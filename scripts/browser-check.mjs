import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const base = process.env.REVIEW_URL || "http://127.0.0.1:3100";
const route = (locale, slug = "") => `/${locale}${slug ? "/" + (locale === "en" ? ({ presse: "press", recrutement: "careers" }[slug] || slug) : slug) : ""}`;
const widths = [320, 390, 768, 1280, 1440, 3840];
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const paths = [
  "",
  "carte",
  "vins",
  "la-maison",
  "privatisation",
  "contact",
  "presse",
  "recrutement",
  "mentions-legales",
  "confidentialite",
];
const report = { pages: [], accessibility: [], errors };
async function prepareScreenshot() {
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto";
    for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
  await page
    .locator("img")
    .evaluateAll(async (imgs) =>
      Promise.all(
        imgs
          .filter(
            (i) => getComputedStyle(i).display !== "none" && i.offsetHeight > 0,
          )
          .map((i) => i.decode().catch(() => {})),
      ),
    );
  await page.waitForFunction(() => window.scrollY === 0);
  await page.waitForTimeout(160);
  const broken = await page
    .locator("img")
    .evaluateAll((imgs) =>
      imgs
        .filter((i) => i.offsetHeight > 0 && !i.naturalWidth)
        .map((i) => i.src),
    );
  assert.deepEqual(broken, [], "Images load");
}
await mkdir("review", { recursive: true });
try {
  for (const locale of ["fr", "en"])
    for (const slug of paths) {
      const url = route(locale, slug);
      const response = await page.goto(base + url);
      assert.equal(response.status(), 200, url);
      const html = await response.text();
      assert.ok(!/href=["']about:invalid/i.test(html), `${url}: no rewritten telephone links`);
      assert.ok((html.match(/href="tel:\+33140570441"/g) || []).length >= 2, `${url}: server-rendered phone links`);
      await page.waitForLoadState("networkidle");
      const telephone = page.locator('a[href^="tel:"]');
      assert.ok(await telephone.count() >= 2, `${url}: footer and mobile phone links`);
      assert.deepEqual(await telephone.evaluateAll(links => [...new Set(links.map(a => a.getAttribute("href")))]), ["tel:+33140570441"]);
      assert.equal(await page.locator('a[href^="about:invalid"]').count(), 0);
      assert.equal(await page.locator('.editorial-nav a').count(), 2);
      if (!slug) {
        assert.equal(await page.locator('.culinary-mosaic figure').count(), 3);
        assert.equal(await page.locator('.cellar-triptych figure').count(), 3);
        assert.equal(await page.locator('.house-portraits figure').count(), 4);
        assert.equal(await page.locator('.press-excerpts blockquote').count(), 2);
        assert.equal(await page.locator('.distinction-emblems img').count(), 3);
        assert.equal(await page.locator('.press-feature > a').getAttribute('href'), route(locale, 'presse'));
        assert.equal(await page.locator('.careers-feature a').getAttribute('href'), route(locale, 'recrutement'));
      }
      if (["", "carte", "la-maison"].includes(slug)) assert.equal(await page.locator('.atmosphere-frieze figure').count(), 5);
      assert.equal(await page.locator("h1").count(), 1, url);
      assert.equal(await page.locator("html").getAttribute("lang"), locale);
      assert.equal(
        await page.locator('link[rel="canonical"]').getAttribute("href"),
        "https://www.restaurantlephalsbourg.com" + url,
      );
      assert.equal(
        await page.locator('link[rel="alternate"][hreflang]').count(),
        3,
      );
      await page.evaluate(() => document.fonts.ready);
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        const dimensions = await page.evaluate(() => ({
          width: innerWidth,
          scroll: document.documentElement.scrollWidth,
        }));
        assert.ok(
          dimensions.scroll <= width,
          `${url} overflows at ${width}: ${dimensions.scroll}`,
        );
      }
      report.pages.push(url);
    }
  for (const locale of ["fr", "en"])
    for (const slug of [
      "",
      "carte",
      "vins",
      "privatisation",
      "recrutement",
      "la-maison",
      "contact",
      "presse",
      "mentions-legales",
      "confidentialite",
    ]) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(base + route(locale, slug));
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      report.accessibility.push({
        locale,
        slug,
        violations: results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      });
    }
  await page.goto(base + "/fr/vins");
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  assert.equal(await page.locator("dialog").evaluate((el) => el.open), true);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog").evaluate((el) => el.open), false);
  await page
    .locator(".header-actions .languages")
    .getByRole("link", { name: "EN", exact: true })
    .click();
  await page.waitForURL("**/en/vins");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + "/fr");
  await prepareScreenshot();
  await page.screenshot({ path: "review/home-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await prepareScreenshot();
  await page.screenshot({ path: "review/home-mobile.png", fullPage: true });
  await page.goto(base + "/fr/carte");
  await prepareScreenshot();
  await page.screenshot({ path: "review/menu-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + "/fr/vins");
  await prepareScreenshot();
  await page.screenshot({ path: "review/wines-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await prepareScreenshot();
  await page.screenshot({ path: "review/wines-mobile.png", fullPage: true });
  for (const locale of ["fr", "en"]) {
    await page.goto(base + `/${locale}/vins`);
    const winePdf = page.locator('.wine-page-actions a[target="_blank"]');
    assert.equal(
      await winePdf.getAttribute("href"),
      "/documents/carte-des-vins-le-phalsbourg.pdf",
    );
    assert.equal(
      await page.locator(".wine-page-actions a[download]").count(),
      1,
    );
    assert.equal(
      await page.locator(".wine-filters, .book-art, .wine-table").count(),
      0,
    );
    const pdfResponse = await page.request.get(
      base + (await winePdf.getAttribute("href")),
    );
    assert.equal(pdfResponse.status(), 200);
    assert.ok(
      pdfResponse.headers()["content-type"].includes("application/pdf"),
    );
    await page.goto(base + `/${locale}/privatisation`);
    await page.locator('input[name="name"]').fill("Élodie & Martin");
    await page.locator('input[name="email"]').fill("elodie@example.com");
    await page.locator('input[type="date"]').fill("2027-06-17");
    await page.locator('input[name="guests"]').fill("61");
    assert.equal(
      await page.locator("form").evaluate((el) => el.checkValidity()),
      false,
    );
    await page.locator('input[name="guests"]').fill("60");
    await page
      .locator("#enquiry-message")
      .fill("Déjeuner & vins\nSans noix, s’il vous plaît.");
    assert.equal(
      await page.locator("form").evaluate((el) => el.checkValidity()),
      true,
    );
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.locator('.form-actions button[type="button"]').click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    assert.ok(copied.includes("Élodie & Martin"));
    assert.ok(copied.includes("60"));
    assert.ok(copied.includes("Déjeuner & vins\nSans noix"));
    await page.locator("summary").click();
    assert.ok(await page.locator("#enquiry-preview").isVisible());
    await page.goto(base + route(locale, "recrutement"));
    assert.equal(await page.locator('input[name="guests"]').count(), 0);
    assert.equal(await page.locator('input[name="choice"]').count(), 4);
    await page.locator('input[name="name"]').fill("Élodie");
    await page.locator('input[name="email"]').fill("elodie@example.com");
    await page.locator('.form-actions button[type="button"]').click();
    assert.ok(
      (await page.evaluate(() => navigator.clipboard.readText())).includes(
        "Élodie",
      ),
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/fr/carte");
  await page.locator('.category-nav a[href="#desserts"]').click();
  await page.waitForFunction(
    () =>
      document
        .querySelector('.category-nav a[href="#desserts"]')
        ?.getAttribute("aria-current") === "location",
  );
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + "/fr");
    await prepareScreenshot();
    await page.screenshot({ path: `review/home-${width}.png`, fullPage: true });
  }
  for (const slug of [
    "la-maison",
    "privatisation",
    "recrutement",
    "contact",
    "presse",
  ]) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(base + "/fr/" + slug);
    await prepareScreenshot();
    await page.screenshot({
      path: `review/${slug}-desktop.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await prepareScreenshot();
    await page.screenshot({
      path: `review/${slug}-mobile.png`,
      fullPage: true,
    });
  }
  const foreign = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((r) => r.name)
      .filter((url) => !url.startsWith(location.origin)),
  );
  assert.deepEqual(foreign, [], "No external browser resources");
  assert.equal((await page.request.get(base + "/sitemap.xml")).status(), 200);
  assert.equal((await page.request.get(base + "/robots.txt")).status(), 200);
  assert.equal(
    (
      await page.request.get(
        base + "/documents/carte-des-vins-le-phalsbourg.pdf",
      )
    ).status(),
    200,
  );
  for (const url of ["/fr/non-existent", "/de", "/en/not-a-page"])
    assert.equal((await page.request.get(base + url)).status(), 404, url);
  assert.equal(
    (await page.request.get(base + "/menus", { maxRedirects: 0 })).status(),
    308,
  );
  for (const [from, to] of [["/en/presse", "/en/press"], ["/en/recrutement", "/en/careers"]]) {
    const redirect = await page.request.get(base + from, { maxRedirects: 0 });
    assert.equal(redirect.status(), 308);
    assert.equal(new URL(redirect.headers().location, base).pathname, to);
  }
  for (const slug of ["presse", "recrutement"]) {
    await page.goto(base + route("en", slug));
    await page.locator('.header-actions .languages a[lang="fr"]').click();
    await page.waitForURL(base + route("fr", slug));
    await page.locator('.header-actions .languages a[lang="en"]').click();
    await page.waitForURL(base + route("en", slug));
  }
  assert.deepEqual(errors, []);
  await writeFile(
    "review/browser-report.json",
    JSON.stringify(report, null, 2),
  );
  assert.equal(
    report.accessibility.flatMap((r) => r.violations).length,
    0,
    JSON.stringify(report.accessibility),
  );
  console.log(
    JSON.stringify({
      pages: report.pages.length,
      widths,
      accessibilityAudits: report.accessibility.length,
      errors: errors.length,
    }),
  );
} finally {
  await writeFile(
    "review/browser-report.json",
    JSON.stringify(report, null, 2),
  );
  await browser.close();
}
