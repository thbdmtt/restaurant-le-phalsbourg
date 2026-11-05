import sharp from 'sharp';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const archive=JSON.parse(await readFile('_scrape_archive/media/manifest.json','utf8'));
const manifest=JSON.parse(await readFile('data/media-manifest.json','utf8'));
const selected=[[24,'feuillete-service'],[87,'vin-montcalmes'],[66,'facade-soir'],[31,'detail-banquette'],[13,'geste-cuisine'],[53,'salle-bouteilles'],[63,'tables-auberges'],[70,'college-culinaire']];
await mkdir('public/images/responsive',{recursive:true});
for (const [index,name] of selected) {
 const source=archive[index].url.split('/v1/')[0];
 const response=await fetch(source);if(!response.ok) throw new Error(`${name}: ${response.status}`);
 const bytes=Buffer.from(await response.arrayBuffer());
 const original=await sharp(bytes).metadata();
 const buffer=await sharp(bytes).rotate().resize({width:1920,height:1920,fit:'inside',withoutEnlargement:true}).webp({quality:87}).toBuffer();
 const meta=await sharp(buffer).metadata();
 await writeFile(`public/images/${name}.webp`,buffer);
 const item={file:`${name}.webp`,source,origin:'original',originalWidth:original.width,originalHeight:original.height,width:meta.width,height:meta.height};
 const at=manifest.findIndex(x=>x.file===item.file);if(at<0)manifest.push(item);else manifest[at]=item;
 const widths=[...new Set([320,640,960,1440,1920].filter(w=>w<meta.width).concat(Math.min(meta.width,1920)))];
 for(const width of widths) {
  const im=sharp(buffer).resize({width,withoutEnlargement:true});
  await im.clone().avif({quality:48,effort:4}).toFile(`public/images/responsive/${name}-${width}.avif`);
  await im.clone().webp({quality:76}).toFile(`public/images/responsive/${name}-${width}.webp`);
 }
 console.log(name,meta.width,meta.height);
}
await writeFile('data/media-manifest.json',JSON.stringify(manifest,null,2)+'\n');
