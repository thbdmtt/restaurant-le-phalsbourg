import { test } from "node:test";
import assert from "node:assert/strict";
import wines from "../data/wines-fallback.json";
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import { filterWines, wineFilters } from "../lib/wine-filters";
import { composeEnquiry, enquiryMailto, parisToday } from "../lib/enquiry";

test("wine filters preserve real references, formats and accented Rhône regions", () => {
  assert.equal(filterWines(wines, "all").length, 39);
  assert.equal(filterWines(wines, "glass").length, 22);
  for (const filter of wineFilters) {
    const result = filterWines(wines, filter);
    assert.ok(result.length > 0, filter);
    assert.equal(new Set(result.map((i) => i.id)).size, result.length);
  }
  assert.ok(
    filterWines(wines, "rhone").every((i) => i.region.includes("Rhône")),
  );
  assert.ok(filterWines(wines, "magnums").every((i) => i.price_150cl !== null));
  assert.ok(filterWines(wines, "other").some((i) => i.region === "Bordeaux"));
  assert.equal(
    filterWines(
      wines.map((i) => ({ ...i, available: false })),
      "all",
    ).length,
    0,
  );
});
test("email composition retains accents, multiline requests, structured fields and safe encoding", () => {
  const values = {
    choice: "Anniversaire",
    date: "2027-06-17",
    guests: "60",
    name: "Élodie & Martin",
    email: "elodie@example.com",
    phone: "0601020304",
    message: `Déjeuner & vins
Sans noix, s’il vous plaît.`,
  };
  const result = composeEnquiry("event", values, fr.enquiry, "fr");
  assert.match(result.subject, /60 convives/);
  assert.match(result.subject, /17 juin 2027/);
  assert.ok(result.body.includes(values.message));
  const mail = enquiryMailto(
    "restaurant@example.com",
    result.subject,
    result.body,
  );
  const query = new URL(mail).searchParams;
  assert.equal(query.get("subject"), result.subject);
  assert.equal(query.get("body"), result.body);
  assert.equal([...query].length, 2);
  const job = composeEnquiry(
    "job",
    { ...values, choice: "Sommellerie", date: "" },
    en.enquiry,
    "en",
  );
  assert.match(job.subject, /Sommellerie/);
  assert.ok(!job.body.includes(en.enquiry.guests));
  assert.ok(job.body.includes("Élodie & Martin"));
});
test("request date uses the Paris calendar across midnight and DST", () => {
  assert.equal(parisToday(new Date("2026-11-04T23:30:00Z")), "2026-11-05");
  assert.equal(parisToday(new Date("2026-07-04T22:30:00Z")), "2026-07-05");
});
