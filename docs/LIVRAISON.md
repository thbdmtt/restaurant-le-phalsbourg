# Livraison — Le Phalsbourg

Refonte éditoriale achevée le 4 novembre 2026. Next.js 16.4.5, React 19.3.1, TypeScript strict. Les 20 pages FR/EN disposent de la nouvelle direction artistique ; le connecteur Google Sheets, ses fichiers de secours et les données métier restent opérationnels.

## Direction artistique et parcours

Ivoire #EEE9DA, surfaces #F6F3EA et #E5DEC9, rouge #D1000A, encre #000000 et charbon #3C3A37. Cormorant Garamond et Jost auto-hébergées par next/font. Grain papier SVG fixe à 2,5 %, filets fins, cadres à doubles filets, titres expressifs et prix tabulaires.

- Accueil : composition asymétrique, horaires visibles avant la photo sur mobile, aperçu dynamique de trois plats, cave sombre, portraits et distinctions.
- Carte : formule déjeuner à 35 €, navigation sticky avec rubrique active au défilement, points de conduite et indication des prix aux 100 g.
- Vins : présentation sobre autour d’une photographie existante, de quelques mots d’accueil et d’un bouton ouvrant directement la carte PDF. Téléchargement également disponible. Le livre fictif, les filtres et le tableau détaillé ont été retirés à la demande du restaurateur.
- Maison : parcours et portraits décalés de Matthieu Fève, Ahmed Kawsar et Archibald Franquinet.
- Privatisation et recrutement : configurateurs bilingues, validation native, limite de convives centralisée, génération d’un e-mail structuré, copie et aperçu sélectionnable.
- Navigation : dialogue mobile numéroté, horaires, changement de langue vers la page équivalente, indicateur actif et barre d’action flottante accessible aussi sur tablette compacte.
- Presse, contact et pages d’information : même système éditorial, avec compositions adaptées au contenu.

La revue initiale et le parti pris sont documentés dans [DIRECTION-ARTISTIQUE.md](DIRECTION-ARTISTIQUE.md). L’état précédent est conservé dans `review/before/`.

## Vérifications réalisées

- `npm run build` : réussi, toutes les routes générées.
- `npm run typecheck` : réussi, aucune erreur.
- `npm test` : 14 tests réussis. Couverture du parseur CSV, des unités et formats, du cache et des pannes, du masquage, des traductions, des filtres et de la composition des messages.
- `npm run test:browser` : réussi sur les 20 pages FR/EN à 320, 390, 768, 1440 et 3840 px. Aucun débordement horizontal ni erreur JavaScript.
- 20 audits axe WCAG A/AA : aucune violation détectée.
- Parcours vérifiés : menu mobile et Échap, langue équivalente, accès à la carte PDF, refus de 61 convives, acceptation de 60, copie des messages FR/EN, aperçu, candidature et activation de la rubrique Desserts au défilement.
- SEO et ressources : h1 unique, canonical, trois hreflang, sitemap, robots, PDF, redirections, 404 et absence de ressources navigateur externes.

## Lighthouse — build de production local

| Profil | Performance | Accessibilité | Bonnes pratiques | SEO | LCP | CLS |
|---|---:|---:|---:|---:|---:|---:|
| Mobile | 93 | 100 | 100 | 100 | 3,2 s | 0 |
| Desktop | 100 | 100 | 100 | 100 | 0,7 s | 0 |

Référence précédente : performance mobile 90, LCP 3,6 s. Le dernier audit mobile mesure un FCP de 0,8 s et un TBT de 80 ms. L’objectif de 98–100 en performance mobile n’est pas atteint. Les mesures utilisent le profil Lighthouse standard, sur serveur local ; elles ne constituent pas une garantie de Core Web Vitals en production.

Optimisations réalisées : hero AVIF de 768 px réduit d’environ 52 à 31 Ko, variantes photo statiques AVIF/WebP, tailles adaptées aux compositions, suppression de l’hydratation des images et liens simples, dictionnaires complets conservés côté serveur, tuile de grain papier bornée à 180 px. Le hero est préchargé et visible sans animation bloquante.

Rapports : [mobile](../review/lighthouse-mobile.html), [desktop](../review/lighthouse-desktop.html), leurs JSON et [recette navigateur](../review/browser-report.json).

## Captures revues visuellement

Captures régénérées et inspectées :

- [Accueil desktop](../review/home-desktop.png)
- [Accueil mobile](../review/home-mobile.png)
- [Carte mobile](../review/menu-mobile.png)
- [Vins desktop](../review/wines-desktop.png)
- Accueil à 320 et 768 px ; maison, privatisation, recrutement, contact et presse sur desktop et mobile.

La relecture à 768 px a permis de corriger une colonne implicite dans la composition des portraits. Les dernières captures intègrent cette correction et la barre d’action tablette. Les captures intégrales montrent la barre fixe à la position de la première fenêtre : elle reste ancrée au bas de l’écran pendant la navigation réelle.

## Gestion et configuration

- `lib/restaurant.ts` : horaires, capacité, adresse, GPS, téléphone et Zenchef.
- `locales/fr.json` et `locales/en.json` : textes et libellés.
- `data/google-sheet-menu-template.csv` : 15 plats et formule déjeuner.
- `data/google-sheet-wines-template.csv` : 39 boissons/vins sélectionnés dans le PDF.
- `data/*-fallback.json` : secours bilingues.
- `public/documents/carte-des-vins-le-phalsbourg.pdf` : carte complète de 23 pages.
- `README.md` et `.env.example` : configuration CSV/API, cache persistant et exploitation.

Aucune feuille Google réelle n’a été fournie ou créée : les données locales restent utilisées. Les variables `LEGAL_*` doivent toujours être renseignées avant publication publique ; ces informations ne sont pas inventées. Les demandes ouvrent la messagerie ou se copient, sans transmission automatique ni conservation. Aucun déploiement public n’a été effectué.


## Publication du 5 novembre 2026

Code publié sur https://github.com/thbdmtt/restaurant-le-phalsbourg et site sur https://restaurant-le-phalsbourg.thbdmtt.workers.dev/fr. Hébergement Cloudflare Workers (vinext), cache de réponses Workers Cache et cache de données KV. La page des vins épurée conserve la photo et les deux actions de consultation/téléchargement du PDF.

Les builds Next.js et Cloudflare, le typage et les 14 tests unitaires passent. La recette navigateur sur le Worker local couvre les 20 pages, cinq largeurs de 320 à 3840 px et 20 audits d’accessibilité, sans erreur détectée. L’audit npm après les correctifs Vite et fflate indique zéro vulnérabilité connue. Les scores Lighthouse antérieurs restent des mesures de la version Next.js locale ; ils ne constituent pas une mesure du déploiement Cloudflare.

Le domaine officiel n’a pas été basculé. La connexion Google Sheets et les informations légales de l’éditeur restent à renseigner avec les données du restaurant.

La même recette a été exécutée sur l’URL Cloudflare publique : 20 pages, cinq largeurs, 20 audits d’accessibilité, aucune erreur. Ouverture du menu mobile, changement de langue, demandes par e-mail/copie et accès au PDF vérifiés.
