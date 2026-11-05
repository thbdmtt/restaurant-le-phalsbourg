import type { WineItem } from "./menu-schema";
export const wineFilters = [
  "all",
  "glass",
  "champagne",
  "bourgogne",
  "loire",
  "rhone",
  "other",
  "magnums",
] as const;
export type WineFilter = (typeof wineFilters)[number];
export function filterWines(items: WineItem[], filter: WineFilter) {
  return items.filter((item) => {
    if (!item.available) return false;
    const region = item.region
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    switch (filter) {
      case "all":
        return true;
      case "glass":
        return item.category_slug === "aperitifs" || item.price_glass !== null;
      case "magnums":
        return item.price_150cl !== null;
      case "other":
        return (
          Boolean(region) &&
          !["champagne", "bourgogne", "loire", "rhone"].some((r) =>
            region.includes(r),
          )
        );
      default:
        return region.includes(filter);
    }
  });
}
