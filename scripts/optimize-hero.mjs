import sharp from "sharp";
import { mkdir } from "node:fs/promises";
await mkdir("public/images/hero", { recursive: true });
for (const width of [480, 768, 1280, 1620]) {
  await sharp("public/images/facade-monceau.webp")
    .resize({ width })
    .avif({ quality: 48, effort: 6 })
    .toFile(`public/images/hero/facade-${width}.avif`);
  await sharp("public/images/facade-monceau.webp")
    .resize({ width })
    .webp({ quality: 76 })
    .toFile(`public/images/hero/facade-${width}.webp`);
}
console.log("Hero AVIF/WebP : 4 largeurs prégénérées.");
