# Le Phalsbourg

Refonte Next.js App Router, TypeScript strict, français et anglais. Archive source conservée dans `_scrape_archive/` (192 fichiers déplacés, jamais publiée).

## Développement

```sh
npm ci
npm run dev
```

Production : `npm run build`, puis `npm start`. Vérifications : `npm run typecheck`, `npm test`. Contrôles navigateur : `npx playwright install chromium`, lancer le serveur de production sur le port 3100, puis `npm run test:browser`. `REVIEW_URL` permet un autre port.

Node.js 22 recommandé. Le fichier de verrouillage npm fait référence. `next/font/google` télécharge Cormorant Garamond et Jost lors du build : le build nécessite l’accès à Google Fonts, mais le navigateur ne contacte jamais Google pour les polices.

## Configuration de la maison

`lib/restaurant.ts` centralise adresse, téléphone, horaires, capacité (60 convives), GPS, Zenchef et PDF. `locales/fr.json` et `locales/en.json` contiennent les textes et libellés. Même structure contrôlée par test. La marque reste Le Phalsbourg dans les deux langues.

Les routes sont `/fr` et `/en`, puis `/carte`, `/vins`, `/la-maison`, `/privatisation`, `/contact`, `/presse`, `/recrutement`, `/mentions-legales`, `/confidentialite`. Le sélecteur FR/EN conserve le même chemin. `/` redirige en 308 vers `/fr`. Les URL Wix historiques redirigent vers leur équivalent, y compris les menus avec paramètre de requête. Les pages presse et recrutement utilisent `/en/press` et `/en/careers` en anglais, avec des redirections permanentes depuis les anciens slugs. Les autres slugs restent communs.

## Modifier la cuisine et les vins dans Google Sheets

1. Importer `data/google-sheet-menu-template.csv` dans un onglet **Menu** et `data/google-sheet-wines-template.csv` dans **Wines**. Le séparateur est la virgule, encodage UTF-8.
2. Conserver les en-têtes. Ne pas modifier l’`id` d’une ligne existante. Donner un nouvel identifiant unique à chaque nouvelle proposition.
3. Renseigner les deux langues. `order` est un entier positif ou nul ; `available` vaut TRUE ou FALSE. FALSE masque la ligne. Les lignes supprimées disparaissent également. Un onglet valide sans lignes affiche un message de sélection en évolution.
4. Menu : `price` accepte 12, 12.50 ou « 12,50 ». `price_unit=100g` préserve la tarification au poids du cochon. `dietary_tags` accepte `vegetarian`, `gluten_free`, `homemade` (séparés par des virgules). Ne renseigner que les mentions confirmées par la cuisine.
5. Vins : conserver région, appellation, domaine, cuvée et millésime. Une cellule vide dans `price_glass`, `price_75cl` ou `price_150cl` signifie format non proposé, jamais prix nul. `serving` précise 14cl pour le vin au verre ou 33cl pour la bière. Pour un cocktail, le prix de la consommation utilise `price_glass`. `source_page` est une trace documentaire facultative.
6. Pour le mode public, choisir **Fichier → Partager → Publier sur le Web**, onglet concerné, format CSV. Copier les URL dans `GOOGLE_SHEET_MENU_CSV_URL` et `GOOGLE_SHEET_WINES_CSV_URL` après duplication de `.env.example` en `.env.local`. `GOOGLE_SHEET_CSV_URL` est un alias pour le menu seulement.
7. Redémarrer/reconstruire l’application après modification de sa configuration. Les changements de plats dans une feuille déjà configurée ne nécessitent aucun déploiement.

### Alternative API Google Sheets v4

Définir `GOOGLE_SHEET_ID` et les plages `GOOGLE_SHEET_MENU_RANGE=Menu!A:Z`, `GOOGLE_SHEET_WINES_RANGE=Wines!A:Z`. Pour une feuille privée, partager en lecture avec l’adresse du compte de service puis configurer `GOOGLE_SERVICE_ACCOUNT_EMAIL` et `GOOGLE_PRIVATE_KEY` (les retours à la ligne échappés sont acceptés). Pour une feuille publique, une clé API restreinte peut être configurée via `GOOGLE_SHEETS_API_KEY`. L’API Google Sheets doit être activée pour le projet. Les secrets ne sont jamais transmis au navigateur. Une URL CSV renseignée prend priorité pour le flux concerné.

### Cache et erreurs

Le connecteur `lib/menu-sheet.ts` lit les données côté serveur, limite la durée du fetch à 5 secondes et la taille de la réponse à 2 Mo après lecture. La mémoire de processus est revalidée après 60 secondes. Les pages sont revalidées par Next.js : prévoir environ 60 à 120 secondes après une visite déclenchant la revalidation, auxquels peut s’ajouter la propagation Google CSV. Aucun délai strict ne peut être garanti par un CSV publié.

Chaque récupération valide sauvegarde une version complète, y compris les lignes masquées. Une ligne invalide retrouve sa précédente valeur si son identifiant est connu ; une nouvelle ligne invalide est ignorée. `FALSE` est prioritaire, même en cas d’erreur dans une autre cellule. Une réponse illisible, un en-tête invalide ou un flux entièrement invalide conserve la version précédente. En l’absence de sauvegarde, les fichiers `data/*-fallback.json` servent de secours.

- Serveur Node : `MENU_CACHE_DIR` doit pointer vers un **volume persistant et accessible en écriture**. L’écriture est atomique. Par défaut : `.menu-cache/`.
- Hébergement serverless ou plusieurs instances : configurer `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN` pour partager la dernière version valide. La mémoire reste locale pendant au plus 60 secondes.
- Si le stockage persistant est indisponible, le site continue avec la mémoire locale ; après redémarrage sans stockage accessible, seul le fallback embarqué est disponible. Cette limite est journalisée.

La sauvegarde est isolée par empreinte du flux et de sa configuration pour ne pas mélanger deux feuilles. Aucune URL contenant des identifiants n’est inscrite dans les journaux d’erreur.

Les fallbacks comprennent les 15 propositions de cuisine, la formule déjeuner à 35 € et 39 boissons/vins. La formule n’est pas présentée comme un nombre de services non attesté. La sélection des bouteilles est issue du PDF, avec numéros de page. Il ne s’agit pas d’une transcription de la totalité des 350+ références. Le PDF intégral de 23 pages reste consultable et téléchargeable sur la page des vins.

## Images et identité

`data/media-manifest.json` documente les 16 médias sélectionnés, leurs originaux Wix et leurs dimensions. Le script `scripts/prepare-assets.py` récupère les URL sans `/v1/…`, applique l’orientation EXIF, réduit à 2400 px maximum et encode en WebP. Il nécessite Python, Pillow et un accès réseau. La signature PNG d’origine est conservée. Le hero dispose de variantes statiques AVIF/WebP (480, 768, 1280 et 1620 px), générées par `node scripts/optimize-hero.mjs`, pour éviter une conversion à la première visite. Les autres photos disposent de variantes statiques AVIF/WebP (320 à 1920 px), produites par `node scripts/optimize-photos.mjs`. Les éléments `<picture>` choisissent la taille et le format sans JavaScript ni conversion lors de la première visite. Les noms de fichiers et les textes alternatifs sont sémantiques et bilingues.

Tokens dans `styles/tokens.css`. Ivoire #EEE9DA, rouge #D1000A, Cormorant Garamond et Jost. Le gris de lecture est plus contrasté que celui du thème Wix. Le menu mobile utilise un dialogue natif (focus contenu et Échap), la barre d’action respecte la zone de sécurité et les animations suivent `prefers-reduced-motion`.

## Réservation, contact et publication

La réservation ouvre Zenchef (374408, pid=1001), sans widget tiers au chargement. Les demandes de privatisation et candidatures ouvrent la messagerie de l’utilisateur avec un objet adapté ; ce ne sont pas des formulaires d’envoi hébergés. Les cartes Google et Instagram ne sont pas intégrées : elles sont accessibles par liens.

Les métadonnées canonical/hreflang sont propres à chaque page. Le JSON-LD Restaurant reprend les données centralisées, et la carte ajoute Menu/MenuSection/MenuItem. `/sitemap.xml` et `/robots.txt` sont générés. Le fichier de carte PDF et les médias publics sont indépendants de l’archive.

**À compléter avant publication publique :** renseigner dans l’environnement les informations légales exactes de l’éditeur, du directeur de publication et de l’hébergeur (`LEGAL_*` dans `.env.example`). Elles ne figurent pas dans le scrape et ne sont pas inventées. La page de mentions légales est provisoirement `noindex` et exclue du sitemap ; une fois complète, retirer cette exception dans `lib/seo.ts` et `app/sitemap.ts`. La politique de confidentialité décrit les traitements effectivement intégrés ; adapter avec les pratiques de conservation du restaurant et les conditions de l’hébergeur choisi.

Aucun service Google Sheets réel n’est configuré par défaut. Le site publié fonctionne sur les fallbacks, jusqu’à configuration de la feuille du restaurant.

## Vérification

Les tests couvrent CSV, traductions, unités, magnums, données mal formées, disparition de lignes, masquage, panne réseau et cache persistant. Le script navigateur contrôle les 20 pages FR/EN à 320, 390, 768, 1440 et 3840 px, les métadonnées, les 404, le PDF, les redirections, le menu mobile et les audits axe. Les rapports et captures sont dans `review/` (ignorés par Git).

## Refonte éditoriale

La direction artistique est documentée dans `docs/DIRECTION-ARTISTIQUE.md` : papier ivoire grainé, filets gastronomiques, cave sombre et portraits en décalage. Le grain SVG fixe à 2,5 % est rendu en tuiles de 180 px pour réduire son coût de peinture. Les contenus restent visibles sans attendre une animation ; les mouvements respectent `prefers-reduced-motion`.

- `components/category-nav.tsx` : sommaire de carte avec rubrique active suivant le défilement.
- `Wines` dans `components/menus.tsx` : photographie existante et accès direct à la carte PDF, dans une présentation courte et chaleureuse. La sélection détaillée et les filtres ne sont plus affichés.
- `components/enquiry-composer.tsx` : demandes bilingues, validation des champs, copie et aperçu sélectionnable. Les privatisations sont limitées à la capacité centralisée. Aucune transmission automatique ni conservation des demandes.
- `lib/format.ts` : utilitaires partagés sans embarquer les dictionnaires complets dans le navigateur.
- `scripts/optimize-photos.mjs` : variantes AVIF/WebP de 320 à 1920 px, signature adaptée au header.
- `scripts/optimize-hero.mjs` : variantes du hero préchargé.

Les mesures et limites de recette figurent dans `docs/LIVRAISON.md`.


## Publication GitHub et Cloudflare

- Code : https://github.com/thbdmtt/restaurant-le-phalsbourg
- Site : https://restaurant-le-phalsbourg.thbdmtt.workers.dev/fr
- Version anglaise : https://restaurant-le-phalsbourg.thbdmtt.workers.dev/en

Le site est hébergé sur Cloudflare Workers avec vinext. Le projet Next.js reste utilisable avec les commandes originales. `cloudflare.config.ts` définit le Worker, le cache de réponses Workers Cache et le cache de données du framework dans Workers KV. Les images AVIF/WebP sont préoptimisées et les polices sont auto-hébergées. Les journaux et traces Cloudflare sont activés. Aucun domaine personnalisé ni DNS du restaurant n’a été modifié ; les URL canoniques conservent le domaine officiel défini dans `lib/restaurant.ts`.

```sh
npm ci
npx cf auth login
npm run deploy:vinext -- --dry-run
npm run deploy:vinext
```

Prévisualisation du Worker : `npm run build:vinext`, puis `npm run start:vinext -- --port 3101`. Utiliser `REVIEW_URL=http://localhost:3101 npm run test:browser`. `npm run typecheck` régénère les types Next.js, car les deux moteurs produisent des types de routes dans `.next/`.

Les pushes et pull requests GitHub lancent les tests, les deux compilations et le typage. La publication Cloudflare est déclenchée séparément par `npm run deploy:vinext` depuis un poste connecté au compte Cloudflare ; le workflow GitHub ne contient aucun jeton de déploiement.

Pour Google Sheets sur Workers, configurer les variables serveur via les bindings de configuration ou les secrets Cloudflare. Le cache KV du framework ne remplace pas la sauvegarde applicative des derniers menus valides : pour conserver ces sauvegardes entre instances, le connecteur prend actuellement en charge Upstash Redis REST. Le disque local `.menu-cache/` est destiné au serveur Node, pas au stockage durable Workers. Sans feuille configurée, les données locales embarquées sont immédiatement disponibles.

L’archive source, les captures de recette, les identifiants Cloudflare et les fichiers de build sont exclus du dépôt.


## Photographies et enrichissement éditorial

L’accueil présente une composition de trois photos culinaires, trois flacons, les portraits de Matthieu Fève, Ahmed Kawsar et Archibald Franquinet, une frise de cinq vues du bistrot et les trois emblèmes de distinction. La frise figure aussi sur la carte et la page Maison. Les citations de Gilles Pudlowski et de Corneille (cité par Rémi Déchambre) sont rétablies sur l’accueil, avec une traduction anglaise. Un encart de recrutement et une navigation éditoriale complètent le parcours.

`components/editorial-sequences.tsx` rassemble les sections partagées. Huit médias supplémentaires ont été récupérés depuis les originaux Wix listés dans l’archive, puis optimisés en AVIF/WebP par `scripts/enrich-assets.mjs` ; ce script de préparation nécessite l’archive locale. Tous les fichiers utiles à l’affichage sont publiés dans `public/images/`.

La recette navigateur vérifie le téléphone exact `tel:+33140570441` dans le HTML serveur et dans le DOM après chargement, sur chaque page. Elle contrôle aussi les routes anglaises, les redirections, les liens de langue et six largeurs (320, 390, 768, 1280, 1440, 3840 px).


## Finitions mobiles

Toutes les icônes d’interface sont des SVG inline dans `components/icon.tsx` (flèche, téléphone, carte, téléchargement, copie et fermeture). Aucun glyphe de police n’est utilisé comme icône. Un test parcourt les composants, les pages et les dictionnaires pour prévenir leur réintroduction.

`components/mobile-action-bar.tsx` affiche une pilule de 340 × 46 px maximum, avec prise en compte de la zone de sécurité du téléphone. Elle est initialement masquée, reste absente jusqu’à 420 px, se masque à la descente et réapparaît à la remontée ou après 800 ms d’arrêt. Le footer et l’ouverture du dialogue la masquent toujours. Quand elle est masquée, elle est également `inert`, retirée du parcours clavier et de l’arbre d’accessibilité. Les changements de hauteur liés à la barre d’adresse mobile sont pris en compte. Le macaron est ancré dans un cadre photographique distinct de la légende.

`npm run test:browser` inclut les tests de scroll, pause, footer, dialogue, SVG, macaron et mouvement réduit de `scripts/mobile-ui-check.mjs`. Cette fonction peut aussi être exécutée avec un navigateur WebKit installé via `npx playwright install webkit`.
