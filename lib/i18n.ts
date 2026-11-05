import fr from "@/locales/fr.json";
import en from "@/locales/en.json";
export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export type Dictionary = typeof fr;
const dictionaries: Record<Locale, Dictionary> = { fr, en };
export const isLocale = (value: string): value is Locale =>
  value === "fr" || value === "en";
export const getDictionary = (locale: Locale): Dictionary =>
  dictionaries[locale];
export const slugs = [
  "carte",
  "vins",
  "la-maison",
  "privatisation",
  "contact",
  "presse",
  "recrutement",
  "mentions-legales",
  "confidentialite",
] as const;
export type Slug = (typeof slugs)[number];
export const isSlug = (value: string): value is Slug =>
  slugs.includes(value as Slug);
export { href, price, interpolate } from "./format";
