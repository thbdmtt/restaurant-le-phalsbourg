import type { Locale } from "./i18n";
export const href = (locale: Locale, slug = "") =>
  `/${locale}${slug ? `/${slug}` : ""}`;
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
