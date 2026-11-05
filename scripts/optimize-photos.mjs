import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
const manifest = JSON.parse(await readFile("data/media-manifest.json", "utf8"));
await mkdir("public/images/responsive", { recursive: true });
for (const item of manifest.filter(
  (i) => i.file.endsWith(".webp") && i.file !== "facade-monceau.webp",
)) {
  const name = item.file.replace(".webp", "");
  const widths = [
    ...new Set(
      [320, 640, 960, 1440, 1920]
        .filter((w) => w < item.width)
        .concat(Math.min(item.width, 1920)),
    ),
  ];
  for (const width of widths) {
    const source = sharp(`public/images/${item.file}`).resize({
      width,
      withoutEnlargement: true,
    });
    await source
      .clone()
      .avif({ quality: 48, effort: 4 })
      .toFile(`public/images/responsive/${name}-${width}.avif`);
    await source
      .clone()
      .webp({ quality: 76 })
      .toFile(`public/images/responsive/${name}-${width}.webp`);
  }
}
await sharp("public/images/signature.png")
  .resize({ width: 340 })
  .webp({ quality: 85 })
  .toFile("public/images/signature-ui.webp");
console.log("Photographies responsive AVIF/WebP et signature optimisées.");
