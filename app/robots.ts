import type { MetadataRoute } from "next";
import { restaurant } from "@/lib/restaurant";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/_scrape_archive/", "/api/"],
    },
    sitemap: `${restaurant.url}/sitemap.xml`,
  };
}
