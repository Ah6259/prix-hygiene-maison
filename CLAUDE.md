# Mémoire du projet — Prix Hygiène & Maison (https://hygiene.clicvia.com)

Dépôt PUBLIC `Ah6259/prix-hygiene-maison` (GitHub Pages, branche main, racine). Rien de personnel ni de secret ici.
Propriétaire : Ahmed (`Ah6259`), non développeur : expliquer simplement, en français. Règles communes, procédure « nouveau site »
et modèle « suivi de prix » : dépôt privé projets-ahmed (dossier parent `_claude code project\`). Brief : `produits entretien hygiene/brief d'Ahmed 2026-11-20.md`.

## Le site (créé le 20/11/2026)
- Pour un ami d'Ahmed qui vend des produits d'entretien, de nettoyage et d'hygiène. Le site montre les prix de Carrefour et Géant
  (relevés chaque nuit, produits EN STOCK seulement) ; le visiteur fait un panier et COMMANDE sur le WhatsApp de la boutique
  (+216 99 453 345) ; la boutique répond avec SES prix et la livraison (toute la Tunisie).
- **Consignes d'Ahmed (20/11)** : sur le site, SEULEMENT l'adresse de la boutique (lien Google Maps) et son numéro ; RIEN sur le
  pourcentage d'Ahmed (pas de carnet des commandes pour l'instant ; le numéro HM-AAMMJJ-XXXX de chaque commande permettra de le
  faire plus tard) ; photos des produits : copies allégées des photos des magasins (accord de TOUS les magasins déclaré par Ahmed).
- FR + AR (`?lang=ar`, bouton, choix gardé), nombres de gauche à droite en arabe, mode sombre, téléphone d'abord.
- Accueil léger (règle § 60) : `data/accueil.json` (24 produits + nombres) tout de suite, `data/produits.json` au 1er geste.
- Familles (13) : linge, vaisselle, maison, javel (et WC), desodorisant, accessoires, papier, bebe, feminine, corps, cheveux, bouche, soins.
- Cache des téléphones : changer le `?v=` de style.css / app.js dans index.html à chaque modification (style.css 20261121n — aussi dans
  tutto-clean/, video/, commandes/ —, app.js 20261121k) ; `CACHE_VERSION` de sw.js (4) ; puis `node tools/construire_ar.mjs` (page arabe).
- GoatCounter : préfixe `/prix-hygiene-maison` (`assets/stats.js`), compteur commun ; clic « commande envoyée » compté comme événement.

## Tutto Clean (boutique de l'ami, 20/11/2026 : nom autorisé par Ahmed, prix SANS livraison)
- Espace privé `tutto-clean/` (noindex, code de la boutique ; jamais dans le dépôt) : la boutique tape ses prix à côté des produits relevés,
  « en stock », « Retirer », « Ajouter un produit » (photo réduite en WebP dans le téléphone).
- Carnet : Cloudflare Worker `hygiene-tutto-clean` (source `worker/tutto-clean.js`) + KV `hygiene-tutto-clean`, adresse https://api-hygiene.clicvia.com ;
  GET /prix (public, cache 60 s), GET /photo/<id>, POST /prix et /verifier (en-tête X-Code ; empreinte SHA-256 du code = secret `CODE_SHA256`).
  Redéployer après une modification : API Cloudflare (PUT workers/scripts, voir l'historique de la session du 20/11) avec la clé du PC d'Ahmed.
- Site public : `API_TUTTO` (meta `hm-api`, les essais la remplacent par un faux carnet `/__tutto`), bouton « Tutto Clean », ligne « Tutto Clean : X DT +
  livraison » sur les cartes, produits propres (`e: "tutto"`), panier et message WhatsApp au prix Tutto Clean ; carnet injoignable = site normal.

## Robot (`.github/workflows/maj-prix.yml`, vers 1h17)
- `robot/relever.py` : Carrefour par son API GraphQL (33 rayons en un seul filtre `category_uid:{in:[…]}`, CHAQUE magasin lu,
  prix le plus courant, marque = champ `brand` du magasin), Géant Drive (10 sous-rayons, HTML, noms coupés « … » relus dans l'adresse).
- `robot/familles.py` : famille par le NOM (règle § 23 ; cas précis d'abord, puis le mot écrit le plus tôt ; le rayon confirme),
  contenance jamais devinée (nom puis description ; « 3L +1L gratuit » = 4 L ; « dont 1 kg gratuit » = rien en plus ; lessive au lavage ;
  couches au nombre, le « kg » d'une couche = poids de l'enfant ; « 50x60 cm » n'est pas un lot ; essuie-tout Jumbo : pas de prix au rouleau).
- Panne d'un magasin (§ 51) : ses derniers prix restent, avec leur date ; robot rouge seulement après 2 jours.
- Photos : WebP 320 px dans `assets/img/p/` (600 nouvelles au plus par nuit), carnet `donnees/images.json`.
- Historique = la vérité : `donnees/historique.json` (jamais refait depuis `donnees/brut/`, qui n'est pas versionné).
- Étude des sources (rayons, chiffres, pièges) : `produits entretien hygiene/etude des sources 2026-11-20.md` (projets-ahmed).

## Tests
- `python tools/test_robot.py` (sans réseau, vrais textes pièges des magasins) ; `node tools/essai_page.mjs .` (Chromium,
  390 et 1300 px, FR et AR, données inventées : familles, recherche, tri, panier, message WhatsApp, rien qui dépasse).
- Avant d'envoyer un robot modifié : `python3 "../../outils communs/envoi-robot/controle_robots.py" --local .`
- Page 404 commune : `python "../../outils communs/page-404/installer.py" --verifier .`

## 21/11/2026 — design magasin, logo, partage, commandes (règle commune § 62)
- Accueil : bandeau (slogan « Les prix de l'entretien et de l'hygiène, livrés chez vous ») → boutique Tutto Clean (`#boutique`, carte
  `assets/boutique-carte.webp` faite depuis OpenStreetMap, lien Google Maps de la fiche) → promesses → rayons (13 tuiles photo) → promotions → QR
  (`#qr`, `tools/qr_code.py`) → « Voir tous les produits » (`toutVoir`) ; liste complète jamais d'office ; sous-rayons (`SOUS`), filtres marques/magasin.
- Logo v2 : maison blanche + goutte d'eau bleue + étincelles jaunes, fond marine (`assets/icons/`, `?v=2`, `CACHE_VERSION` 2) ; aperçu `og-image-v3.jpg`.
- Bouton rond « Partager » (`partager()` d'app.js, `PAGE_VIDEO` à remplir quand la vidéo existe).
- Commandes : `noterCommande()` → POST /commande (sans nom/téléphone/adresse) ; onglet « Mes commandes » de `tutto-clean/` (états, POST /commande-etat,
  code de la boutique) ; `commandes/` = page d'Ahmed (code `ADMIN_SHA256`, lecture seule). Déploiement du Worker : API Cloudflare (script
  `deployer.sh` de la session, empreintes des deux codes, jamais les codes).
- Photos : 1re copie depuis le PC par paquets (`HM_PHOTOS_MAX`, photos vues d'abord) ; le robot de nuit ne copie ensuite que les nouvelles.
- RESTE : vidéo de présentation (format Reel) + page `video/` + lien en bas + vidéo du portail.

## 21/11/2026 (soir)
- Vidéo de présentation (`assets/video/`, scénario `hygiene` de `videos (outil)/sites_services.py`, refaite par `python fabriquer.py hygiene`) +
  page `video/` écrite à la main (video.js : Partager ; `assets/video-son.js` = SON_JS commun) ; `PAGE_VIDEO` d'app.js ; lien « Vidéo de présentation ».
- Photos : `adresses_photo()` (Géant large -> home) ; produits sans photo = `sansPhoto()` (marque en grand) ; photo de carte en absolu dans un carré fixe.
- Plus de lien « Tous nos services » (Ahmed) : exception `SANS_LIEN_PORTAIL` de controle.mjs ; 404 installée avec `--sans-portail`, couleur #0D1B3E.
- Barre du haut : `texte-court` au téléphone (!important), essai « rien de coupé ». « shampooing » partout dans nos textes.
- Contrôle complet (§ 63) : ANOMALIES 0 le 21/11/2026.
- Photos QUI BOUGENT dans le bandeau (règle du 16/10, oubliée puis faite le 21/11) : 2 rangées au PC, 1 au téléphone (`hm-defile`), pause au toucher ;
  contrôle complet n° 13. Robot commun « Relance de la publication » (`relance-pages.yml`, contrôle n° 12).
- Ahmed (21/11) : PLUS de « livré par Tutto Clean » sous le logo ; au téléphone, boutons du bandeau pleine largeur et photos entières (30vw).

## 20/11/2026 — retour des visiteurs : « trop d'écriture au téléphone », « couleurs vieilles »
- Accueil allégé : titre court « Entretien et hygiène, livrés chez vous », plus de phrase sous le titre, boutons « Commander sur WhatsApp » /
  « 🏪 La boutique », boutique sans paragraphe (« Tutto Clean vous livre »), promesses = 3 pastilles d'un mot au téléphone (le détail #maj
  n'apparaît qu'en cas de panne : classe `panne`), plus de sous-titres sous « Nos rayons » / « Promotions », QR compact (« Partagez le site »),
  pied de page en une phrase. Même chose en arabe (ar/ refait par `node tools/construire_ar.mjs`).
- Couleurs modernes : turquoise / menthe sur fond clair (bandeau clair au lieu du marine ; boutons d'action #0D9488 ; promos rose #F43F5E ;
  encre #0F3B47). Les noms des variables CSS sont gardés (`--orange` = couleur des boutons). Versions : style.css 20261121m, app.js 20261121j,
  `CACHE_VERSION` 3. Image d'aperçu (og-image-v3) et logo encore aux anciennes couleurs : à refaire si Ahmed le veut (nouveau nom de fichier).
- **En ligne le 20/11/2026** (PR #1 fusionnée dans `main`, vérifié sur https://hygiene.clicvia.com/ au téléphone : nouveau titre et couleurs).
  Les essais attendent le titre arabe avec « النظافة » (`tools/essai_page.mjs`) : le changer aussi si le titre arabe change.
- **Reprendre sur le PC** : dans le dossier du site, `git checkout main` puis `git pull` (la branche de la session en ligne est déjà fusionnée).
- **Logo et aperçu de partage aux nouvelles couleurs (20/11/2026, Ahmed : « en partageant, j'ai les anciennes couleurs »)** : logo v3 = même dessin
  (maison blanche, goutte bleue, étincelles jaune pâle) sur fond turquoise #14B8A6 → #0B7A70 (`assets/icons/icon.svg`, PNG refaits par capture
  Chromium : maskable / iPhone = symbole à 78 % sur carré plein ; `?v=3`) ; aperçu `og-image-v4.jpg` (modèle `tools/og-image.html`, clair) ;
  barre du téléphone (`theme-color`, manifeste) #0F3B47 ; QR recoloré #0F3B47 (`tools/qr_code.py` aussi) ; `CACHE_VERSION` 4.
  Restent aux anciennes couleurs : la VIDÉO de présentation et son aperçu `assets/video/apercu-video.jpg` (à refaire sur le PC :
  `python fabriquer.py hygiene`) et la page 404 commune (outil commun, ne pas la modifier ici).
  Un lien déjà partagé garde l'ancien aperçu dans WhatsApp / Facebook (leur mémoire) ; les nouveaux partages montrent le nouveau.
