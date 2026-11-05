import type { MetadataRoute } from "next";
import { locales, slugs, href } from "@/lib/i18n";
import { restaurant } from "@/lib/restaurant";
export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    ["", ...slugs.filter((s) => s !== "mentions-legales")].map((slug) => ({
      url: restaurant.url + href(locale, slug),
      changeFrequency:
        slug === "carte" || slug === "vins"
          ? ("daily" as const)
          : ("monthly" as const),
      priority: slug === "" ? 1 : slug === "carte" ? 0.9 : 0.7,
      alternates: {
        languages: {
          fr: restaurant.url + href("fr", slug),
          en: restaurant.url + href("en", slug),
          "x-default": restaurant.url + href("fr", slug),
        },
      },
    })),
  );
}
