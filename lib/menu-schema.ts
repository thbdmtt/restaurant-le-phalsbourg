import { parse } from "csv-parse/sync";
export type Stream = "menu" | "wines";
export interface CommonItem {
  id: string;
  category_slug: string;
  category_fr: string;
  category_en: string;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  available: boolean;
  order: number;
}
export interface MenuItem extends CommonItem {
  price: number;
  price_unit: string;
  dietary_tags: string;
}
export interface WineItem extends CommonItem {
  region: string;
  appellation: string;
  domaine: string;
  cuvee: string;
  vintage: string;
  price_glass: number | null;
  price_75cl: number | null;
  price_150cl: number | null;
  serving: string;
  source_page?: number;
}
export type Item = MenuItem | WineItem;
export interface Parsed<T> {
  items: T[];
  issues: string[];
}
const common = [
  "id",
  "category_slug",
  "category_fr",
  "category_en",
  "title_fr",
  "title_en",
  "available",
  "order",
];
export const requiredColumns = (stream: Stream) => [
  ...common,
  ...(stream === "menu"
    ? [
        "description_fr",
        "description_en",
        "price",
        "price_unit",
        "dietary_tags",
      ]
    : [
        "region",
        "appellation",
        "domaine",
        "cuvee",
        "vintage",
        "price_glass",
        "price_75cl",
        "price_150cl",
      ]),
];
export function csvRows(source: string): string[][] {
  return parse(source, {
    bom: true,
    skip_empty_lines: true,
    relax_column_count: true,
    max_record_size: 100000,
  }) as string[][];
}
function amount(raw: string, optional = false): number | null {
  const text = raw
    .trim()
    .replace(/€/g, "")
    .replace(/[\s\u00a0\u202f]/g, "")
    .replace(",", ".");
  if (optional && !text) return null;
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) throw new Error("price");
  const value = Number(text);
  if (!Number.isFinite(value) || value < 0 || value > 100000)
    throw new Error("price");
  return value;
}
export function parseRows<T extends Item>(
  matrix: string[][],
  stream: Stream,
  previous: T[],
): Parsed<T> {
  const headers = (matrix[0] || []).map((h) =>
    String(h)
      .trim()
      .replace(/^\uFEFF/, ""),
  );
  if (
    new Set(headers).size !== headers.length ||
    requiredColumns(stream).some((key) => !headers.includes(key))
  )
    throw new Error("Invalid sheet headers");
  if (
    headers.some((x) => ["__proto__", "prototype", "constructor"].includes(x))
  )
    throw new Error("Invalid sheet headers");
  const prior = new Map(previous.map((x) => [x.id, x]));
  const seen = new Set<string>();
  const issues: string[] = [];
  const items: T[] = [];
  let invalid = 0;
  let count = 0;
  for (const cells of matrix.slice(1)) {
    if (cells.every((c) => !String(c).trim())) continue;
    count++;
    const row = Object.fromEntries(
      headers.map((key, i) => [key, String(cells[i] ?? "").trim()]),
    );
    const id = row.id;
    if (!id || seen.has(id)) {
      issues.push(`Row ${count + 1}: missing or duplicate id`);
      invalid++;
      continue;
    }
    seen.add(id);
    const old = prior.get(id);
    try {
      // Honor an explicit hide even when another cell in that row is malformed.
      if (row.available.toUpperCase() === "FALSE" && old) {
        items.push({ ...old, available: false });
        continue;
      }
      if (!/^(TRUE|FALSE)$/i.test(row.available)) throw new Error("available");
      if (!/^[a-z0-9-]+$/.test(row.category_slug))
        throw new Error("category_slug");
      for (const key of ["category_fr", "category_en", "title_fr", "title_en"])
        if (!row[key]) throw new Error(key);
      if (!/^\d+$/.test(row.order)) throw new Error("order");
      const base: CommonItem = {
        id,
        category_slug: row.category_slug,
        category_fr: row.category_fr,
        category_en: row.category_en,
        title_fr: row.title_fr,
        title_en: row.title_en,
        description_fr: row.description_fr || "",
        description_en: row.description_en || "",
        available: row.available.toUpperCase() === "TRUE",
        order: Number(row.order),
      };
      let item: Item;
      if (stream === "menu") {
        if (!["", "100g"].includes(row.price_unit))
          throw new Error("price_unit");
        const tags = row.dietary_tags
          .split(/[,;]/)
          .map((t) => t.trim())
          .filter(Boolean);
        if (
          tags.some(
            (t) => !["vegetarian", "gluten_free", "homemade"].includes(t),
          )
        )
          throw new Error("dietary_tags");
        item = {
          ...base,
          price: amount(row.price)!,
          price_unit: row.price_unit,
          dietary_tags: tags.join(","),
        };
      } else {
        const prices = {
          price_glass: amount(row.price_glass, true),
          price_75cl: amount(row.price_75cl, true),
          price_150cl: amount(row.price_150cl, true),
        };
        if (Object.values(prices).every((p) => p === null))
          throw new Error("prices");
        item = {
          ...base,
          ...prices,
          region: row.region,
          appellation: row.appellation,
          domaine: row.domaine,
          cuvee: row.cuvee,
          vintage: row.vintage,
          serving: row.serving || "",
        };
      }
      items.push(item as T);
    } catch {
      invalid++;
      issues.push(`Row ${count + 1} (${id}): invalid values`);
      if (old) items.push(old);
    }
  }
  if (count > 0 && invalid === count) throw new Error("No valid sheet rows");
  return {
    items: items.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)),
    issues,
  };
}
