import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import { launch } from "chrome-launcher";
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.REVIEW_URL || "http://127.0.0.1:3100";
const desktop = process.argv.includes("--desktop");
const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ["--headless", "--no-sandbox"],
});
try {
  const result = await lighthouse(base + "/fr", {
    port: chrome.port,
    output: ["json", "html"],
    logLevel: "error",
  }, desktop ? desktopConfig : undefined);
  if (!result) throw new Error("No report");
  await mkdir("review", { recursive: true });
  const name = `review/lighthouse-${desktop ? "desktop" : "mobile"}`;
  await writeFile(name + ".json", result.report[0]);
  await writeFile(name + ".html", result.report[1]);
  console.log(
    JSON.stringify(
      {
        scores: Object.fromEntries(
          Object.entries(result.lhr.categories).map(([key, v]) => [
            key,
            v.score,
          ]),
        ),
        metrics: Object.fromEntries(
          [
            "first-contentful-paint",
            "largest-contentful-paint",
            "cumulative-layout-shift",
            "total-blocking-time",
          ].map((k) => [k, result.lhr.audits[k].displayValue]),
        ),
        failed: Object.values(result.lhr.audits)
          .filter((a) => a.score !== null && a.score < 1)
          .map((a) => ({ id: a.id, title: a.title, value: a.displayValue })),
      },
      null,
      2,
    ),
  );
} finally {
  await chrome.kill();
}
