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
- Cache des téléphones : changer le `?v=` de style.css / app.js dans index.html à chaque modification (20261120a) ; `CACHE_VERSION` de sw.js.
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
