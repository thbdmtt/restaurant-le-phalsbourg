from pathlib import Path
import json, urllib.request, concurrent.futures, shutil
from PIL import Image,ImageOps
root=Path(__file__).resolve().parents[1]
archive=root/'_scrape_archive'
manifest=json.loads((archive/'media/manifest.json').read_text())
selection={
 'facade-monceau':'fa6642_67bf4d51fdcc4fd680ea3600696e7975',
 'salle-banquettes-rouges':'fa6642_8a31c22c5063492a8f77bb1b1b474fd2',
 'salle-comptoir':'fa6642_1c2eb04e20774c5eb5e68a0acad9d5f3',
 'terrasse-paris':'fa6642_06de549eac0647849f06805176d02e91',
 'cuisine-dressage':'fa6642_5e29d655ba9c4073a2f9fc280e173206',
 'assiette-saison':'fa6642_2aba5fa4e7674c879925e6c26558847a',
 'dessert-chocolat':'fa6642_695ddd884b41474a8f094b03a65aff6f',
 'chef-en-cuisine':'fa6642_659b18ef664a49e3a3fc8b029210de74',
 'vin-dagueneau':'fa6642_3f19bd46d6634fa3a5fea8bcdfa8300b',
 'vin-jobard':'fa6642_c0a2c389d132471f9f09924e62780823',
 'reception-privee':'fa6642_2c30ce7a3a364a89a7f70dac37df9402',
 'matthieu-feve':'IMG_2922', 'ahmed-kawsar':'IMG_2920', 'archibald-franquinet':'IMG_4105',
 'signature':'fa6642_25f7071fee0a407bb3edb288c43f73e3',
 'pudlo-2026':'Macaron%20Troph',
}
# Use local names where source URLs contain encoded display names.
for name,needle in [('matthieu-feve','img-2922'),('ahmed-kawsar','img-2920'),('archibald-franquinet','img-4105'),('pudlo-2026','macaron-20troph-c3-a9es-20pudlo-202026')]:
 selection[name]=next(x['url'].split('/v1/')[0] for x in manifest if needle in x['file'])
out=root/'public/images';out.mkdir(parents=True,exist_ok=True)
raw=root/'review/source-images';raw.mkdir(parents=True,exist_ok=True)
def work(pair):
 name,needle=pair
 candidates=[x for x in manifest if needle in x['url']]
 if not candidates: raise ValueError(name)
 x=max(candidates,key=lambda x:(archive/x['file']).stat().st_size)
 url=x['url'].split('/v1/')[0]
 source=raw/(name+Path(x['file']).suffix)
 origin='original'
 try:
  if not source.exists():
   with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=30) as response: source.write_bytes(response.read())
  im=Image.open(source)
 except Exception:
  origin='archive';im=Image.open(archive/x['file'])
 im=ImageOps.exif_transpose(im); size=im.size
 im.thumbnail((2400,2400))
 if name=='signature':
  im.save(out/'signature.png');filename='signature.png'
 else:
  im.convert('RGB').save(out/(name+'.webp'),'WEBP',quality=86,method=6);filename=name+'.webp'
 record={'file':filename,'source':url,'origin':origin,'originalWidth':size[0],'originalHeight':size[1],'width':im.width,'height':im.height}
 print(name,origin,size,flush=True)
 return record
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool: records=list(pool.map(work,selection.items()))
(root/'data').mkdir(exist_ok=True)
(root/'data/media-manifest.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
pdf=root/'public/documents';pdf.mkdir(parents=True,exist_ok=True)
shutil.copyfile(archive/'documents/fa6642-ed7b9b89d613464e8326fef3fdfe8dc6--3d149085.pdf',pdf/'carte-des-vins-le-phalsbourg.pdf')
# Social image uses the same verified facade photograph.
im=Image.open(out/'facade-monceau.webp');ImageOps.fit(im,(1200,630)).save(out/'opengraph.jpg',quality=88)
