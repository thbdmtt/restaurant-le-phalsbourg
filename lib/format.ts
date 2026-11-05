import type { Locale } from "./i18n";
const englishRoutes: Record<string, string> = { presse: "press", recrutement: "careers" };
export const localizedSlug = (locale: Locale, slug: string) =>
  locale === "en" ? englishRoutes[slug] || slug : slug;
export const canonicalSlug = (locale: Locale, slug: string) =>
  locale === "en"
    ? Object.entries(englishRoutes).find(([, value]) => value === slug)?.[0] || slug
    : slug;
export const href = (locale: Locale, slug = "") =>
  `/${locale}${slug ? `/${localizedSlug(locale, slug)}` : ""}`;
export const price = (value: number, locale: Locale) =>
  new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
export const interpolate = (
  text: string,
  values: Record<string, string | number>,
) => text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
