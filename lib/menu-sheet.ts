import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { GoogleAuth } from "google-auth-library";
import menuFallback from "@/data/menu-fallback.json";
import winesFallback from "@/data/wines-fallback.json";
import {
  csvRows,
  parseRows,
  type Item,
  type MenuItem,
  type WineItem,
  type Stream,
} from "./menu-schema";
interface Snapshot {
  version: 1;
  items: Item[];
  updatedAt: number;
  source: string;
}
const memory = new Map<string, { snapshot: Snapshot; checkedAt: number }>();
const pending = new Map<string, Promise<Snapshot>>();
const TTL = 60_000;
function configuration(stream: Stream) {
  const csv =
    stream === "menu"
      ? process.env.GOOGLE_SHEET_MENU_CSV_URL ||
        process.env.GOOGLE_SHEET_CSV_URL
      : process.env.GOOGLE_SHEET_WINES_CSV_URL;
  const id = process.env.GOOGLE_SHEET_ID;
  const range =
    (stream === "menu"
      ? process.env.GOOGLE_SHEET_MENU_RANGE
      : process.env.GOOGLE_SHEET_WINES_RANGE) ||
    (stream === "menu" ? "Menu!A:Z" : "Wines!A:Z");
  const key = createHash("sha256")
    .update(`schema-v1:${stream}:${csv || id || "local"}:${range}`)
    .digest("hex");
  return { csv, id, range, key };
}
async function redis(command: string[]): Promise<unknown> {
  const response = await fetch(process.env.UPSTASH_REDIS_REST_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) throw new Error("Cache unavailable");
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || "error" in data || !("result" in data))
    throw new Error("Cache unavailable");
  return data.result;
}
function validSnapshot(value: unknown, source: string): value is Snapshot {
  if (!value || typeof value !== "object") return false;
  const x = value as Snapshot;
  return (
    x.version === 1 &&
    x.source === source &&
    Number.isFinite(x.updatedAt) &&
    Array.isArray(x.items) &&
    x.items.every(
      (i) =>
        i &&
        typeof i.id === "string" &&
        typeof i.available === "boolean" &&
        typeof i.title_fr === "string" &&
        typeof i.title_en === "string" &&
        typeof i.category_slug === "string" &&
        typeof i.category_fr === "string" &&
        typeof i.category_en === "string" &&
        typeof i.description_fr === "string" &&
        typeof i.description_en === "string" &&
        Number.isFinite(i.order) &&
        ("price" in i
          ? Number.isFinite(i.price) &&
            typeof i.dietary_tags === "string" &&
            typeof i.price_unit === "string"
          : [i.price_glass, i.price_75cl, i.price_150cl].every(
              (p) => p === null || Number.isFinite(p),
            ) &&
            typeof i.domaine === "string" &&
            typeof i.region === "string" &&
            typeof i.vintage === "string"),
    )
  );
}
const cacheFile = (key: string) =>
  path.join(
    process.env.MENU_CACHE_DIR || path.join(process.cwd(), ".menu-cache"),
    `${key}.json`,
  );
async function readSnapshot(key: string): Promise<Snapshot | undefined> {
  try {
    const raw =
      process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? await redis(["GET", `phalsbourg:${key}`])
        : await readFile(cacheFile(key), "utf8");
    if (typeof raw === "string") {
      const data: unknown = JSON.parse(raw);
      if (validSnapshot(data, key)) return data;
    }
  } catch {
    /* Missing or unavailable persistence never prevents rendering. */
  }
}
async function persist(snapshot: Snapshot) {
  try {
    if (
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      await redis([
        "SET",
        `phalsbourg:${snapshot.source}`,
        JSON.stringify(snapshot),
      ]);
      return;
    }
    const target = cacheFile(snapshot.source);
    await mkdir(path.dirname(target), { recursive: true });
    const temporary = `${target}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(snapshot), "utf8");
    await rename(temporary, target);
  } catch {
    console.warn(
      "[menu] Persistent cache unavailable; using process memory. Configure a writable volume or Redis.",
    );
  }
}
async function fetchRows(stream: Stream): Promise<string[][]> {
  const { csv, id, range } = configuration(stream);
  let url: string;
  const headers: Record<string, string> = {};
  if (csv) {
    const parsed = new URL(csv);
    if (parsed.protocol !== "https:") throw new Error("CSV must use HTTPS");
    url = parsed.href;
  } else {
    if (!id) throw new Error("No sheet configured");
    url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(id)}/values/${encodeURIComponent(range)}?valueRenderOption=FORMATTED_VALUE`;
    if (process.env.GOOGLE_SHEETS_API_KEY)
      url += `&key=${encodeURIComponent(process.env.GOOGLE_SHEETS_API_KEY)}`;
    else if (
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY
    ) {
      const auth = new GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      });
      const token = await auth.getAccessToken();
      headers.Authorization = `Bearer ${token}`;
    } else throw new Error("Sheets API credentials missing");
  }
  const response = await fetch(url, {
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error("Sheet unavailable");
  const body = await response.text();
  if (body.length > 2_000_000) throw new Error("Sheet too large");
  if (csv) return csvRows(body);
  const data = JSON.parse(body);
  if (!Array.isArray(data.values)) throw new Error("Invalid sheet response");
  return data.values.map((row: unknown[]) => row.map((v) => String(v)));
}
async function load(stream: Stream): Promise<Snapshot> {
  const config = configuration(stream);
  const fallback = stream === "menu" ? menuFallback : winesFallback;
  if (!config.csv && !config.id)
    return { version: 1, items: fallback, source: config.key, updatedAt: 0 };
  const current = memory.get(config.key);
  if (current && Date.now() - current.checkedAt < TTL) return current.snapshot;
  const running = pending.get(config.key);
  if (running) return running;
  const task = (async () => {
    const old = current?.snapshot ||
      (await readSnapshot(config.key)) || {
        version: 1 as const,
        items: fallback,
        source: config.key,
        updatedAt: 0,
      };
    if (!current && old.updatedAt && Date.now() - old.updatedAt < TTL) {
      memory.set(config.key, { snapshot: old, checkedAt: old.updatedAt });
      return old;
    }
    let snapshot = old;
    try {
      const result = parseRows(await fetchRows(stream), stream, old.items);
      if (result.issues.length)
        console.warn(
          `[menu:${stream}] ${result.issues.length} invalid rows; previous values retained where possible.`,
        );
      snapshot = {
        version: 1,
        source: config.key,
        items: result.items,
        updatedAt: Date.now(),
      };
      await persist(snapshot);
    } catch {
      console.warn(
        `[menu:${stream}] Sheet unavailable or invalid; serving the last valid snapshot or local fallback.`,
      );
    }
    memory.set(config.key, { snapshot, checkedAt: Date.now() });
    return snapshot;
  })();
  pending.set(config.key, task);
  try {
    return await task;
  } finally {
    pending.delete(config.key);
  }
}
export async function getMenu(): Promise<MenuItem[]> {
  return (await load("menu")).items.filter((x) => x.available) as MenuItem[];
}
export async function getWines(): Promise<WineItem[]> {
  return (await load("wines")).items.filter((x) => x.available) as WineItem[];
}
