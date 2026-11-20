# Prix Hygiène & Maison

https://hygiene.clicvia.com — prix des produits d'entretien, de nettoyage et d'hygiène en Tunisie (Carrefour, Géant), relevés chaque
nuit, et commande livrée par WhatsApp (+216 99 453 345), partout en Tunisie.

## Ce qui marche tout seul
- Chaque nuit (robot `maj-prix`) : prix relevés, photos ajoutées, site mis à jour, page essayée dans un navigateur.
- À chaque envoi (robot `tests`) : tests du robot et de la page.

## Plan de continuité (si Claude n'est plus là)
- Le site est sur GitHub Pages (gratuit) et ses robots tournent sur GitHub (dépôt public : gratuit). Rien ne dépend du PC.
- Changer le numéro de la boutique : remplacer `21699453345` et `99 453 345` dans `index.html` et `app.js` (sur github.com, crayon ✏️).
- Changer l'adresse de la boutique : remplacer le lien `maps.google.com/maps?ftid=…` dans `index.html`.
- Un magasin ne répond plus : le site garde ses derniers prix avec leur date ; le robot devient rouge après 2 jours.
- Relancer le relevé : onglet Actions → maj-prix → Run workflow.

© 2026 Ahmed (Ah6259) — tous droits réservés (voir LICENSE).
