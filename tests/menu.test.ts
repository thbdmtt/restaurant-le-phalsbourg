import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  csvRows,
  parseRows,
  type MenuItem,
  type WineItem,
} from "../lib/menu-schema";
import menu from "../data/menu-fallback.json";
import wines from "../data/wines-fallback.json";
import fr from "../locales/fr.json";
import en from "../locales/en.json";
const menuCsv = await readFile(
  new URL("../data/google-sheet-menu-template.csv", import.meta.url),
  "utf8",
);
const wineCsv = await readFile(
  new URL("../data/google-sheet-wines-template.csv", import.meta.url),
  "utf8",
);
function modified(changes: Record<string, string>, index = 1) {
  const rows = csvRows(menuCsv);
  for (const [key, value] of Object.entries(changes))
    rows[index][rows[0].indexOf(key)] = value;
  return rows;
}
test("templates round-trip and preserve prices, units, vintages and magnums", () => {
  const m = parseRows<MenuItem>(csvRows(menuCsv), "menu", []);
  assert.equal(m.items.length, 16);
  assert.equal(m.issues.length, 0);
  assert.equal(m.items.find((i) => i.price_unit === "100g")?.price, 9);
  const w = parseRows<WineItem>(csvRows(wineCsv), "wines", []);
  assert.equal(w.items.length, 39);
  assert.equal(w.items.find((i) => i.cuvee === "Silex")?.price_150cl, 640);
});
test("CSV handles BOM, quotes, multiline descriptions and French decimals", () => {
  const result = csvRows('\ufeffid,title,price\r\n1,"A, B\nC","12,50"');
  assert.equal(result[1][1], "A, B\nC");
  assert.equal(
    parseRows<MenuItem>(modified({ price: "12,50 €" }), "menu", menu).items[0]
      .price,
    12.5,
  );
});
test("malformed row uses its own last valid value, while other changes survive", () => {
  const rows = modified({ price: "not a price" });
  rows[2][rows[0].indexOf("price")] = "14";
  const result = parseRows<MenuItem>(rows, "menu", menu);
  assert.equal(result.items[0].price, 12);
  assert.equal(result.items[1].price, 14);
  assert.equal(result.issues.length, 1);
});
test("explicit FALSE hides even an otherwise malformed row", () => {
  const result = parseRows<MenuItem>(
    modified({ available: "FALSE", price: "bad", title_en: "" }),
    "menu",
    menu,
  );
  assert.equal(result.items[0].available, false);
});
test("invalid availability cannot resurrect an already hidden item", () => {
  const previous = menu.map((x, i) => ({ ...x, available: i !== 0 }));
  const result = parseRows<MenuItem>(
    modified({ available: "perhaps" }),
    "menu",
    previous,
  );
  assert.equal(result.items[0].available, false);
});
test("all-hidden and header-only feeds are intentional empty menus", () => {
  const rows = csvRows(menuCsv);
  for (const row of rows.slice(1)) row[rows[0].indexOf("available")] = "FALSE";
  assert.equal(
    parseRows<MenuItem>(rows, "menu", menu).items.filter((i) => i.available)
      .length,
    0,
  );
  assert.deepEqual(parseRows<MenuItem>([rows[0]], "menu", menu).items, []);
});
test("missing headers and entirely malformed feeds fail safely", () => {
  assert.throws(() => parseRows([["title_fr"], ["A"]], "menu", menu));
  const rows = modified({ price: "bad" }).slice(0, 2);
  assert.throws(() => parseRows(rows, "menu", menu));
});
test("removed rows do not reappear from fallback", () => {
  const rows = csvRows(menuCsv);
  rows.splice(1, 1);
  assert.equal(
    parseRows<MenuItem>(rows, "menu", menu).items.some(
      (i) => i.id === "menu-01",
    ),
    false,
  );
});
test("unknown dietary tags are not invented", () => {
  const result = parseRows<MenuItem>(
    modified({ dietary_tags: "vegan" }),
    "menu",
    menu,
  );
  assert.equal(result.items[0].dietary_tags, "");
  assert.equal(result.issues.length, 1);
});
function keys(value: unknown, prefix = ""): string[] {
  if (value && typeof value === "object")
    return Object.entries(value).flatMap(([k, v]) => keys(v, `${prefix}.${k}`));
  return [prefix];
}
test("French and English dictionaries have identical key structures", () =>
  assert.deepEqual(keys(fr).sort(), keys(en).sort()));
test("remote errors retain hidden state and a persisted validated snapshot", async (t) => {
  const cache = await mkdtemp(path.join(os.tmpdir(), "phalsbourg-test-"));
  process.env.MENU_CACHE_DIR = cache;
  process.env.GOOGLE_SHEET_MENU_CSV_URL = "https://example.test/menu.csv";
  const { getMenu } = await import("../lib/menu-sheet");
  const rows = modified({ available: "FALSE" });
  const body = rows
    .map((row) => row.map((c) => `"${c.replaceAll('"', '""')}"`).join(","))
    .join("\n");
  let calls = 0;
  const fetchMock = t.mock.method(globalThis, "fetch", async () => {
    calls++;
    return new Response(body);
  });
  const now = Date.now();
  const time = t.mock.method(Date, "now", () => now);
  assert.equal((await getMenu()).length, 15);
  assert.equal((await getMenu()).length, 15);
  assert.equal(calls, 1);
  const files = await readdir(cache);
  assert.equal(files.length, 1);
  const stored = JSON.parse(await readFile(path.join(cache, files[0]), "utf8"));
  assert.equal(stored.items[0].available, false);
  time.mock.mockImplementation(() => now + 61000);
  fetchMock.mock.mockImplementation(async () => {
    throw new Error("offline");
  });
  assert.equal(
    (await getMenu()).some((i) => i.id === "menu-01"),
    false,
  );
  time.mock.mockImplementation(() => now + 122000);
  fetchMock.mock.mockImplementation(async () => new Response("not,csv"));
  assert.equal((await getMenu()).length, 15);
  delete process.env.GOOGLE_SHEET_MENU_CSV_URL;
  delete process.env.MENU_CACHE_DIR;
});
