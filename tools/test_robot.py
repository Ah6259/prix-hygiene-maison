"""Tests du robot SANS réseau (familles par le nom, contenance, prix à l'unité, marque, page Géant inventée, accueil léger).
Usage : python tools/test_robot.py   (code de sortie 1 au premier échec)"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "robot"))
from familles import famille, contenance, prix_unite  # noqa: E402
import relever  # noqa: E402

ECHECS = []


def ok(cond, msg):
    print(("  ok   " if cond else "  ÉCHEC ") + msg)
    if not cond:
        ECHECS.append(msg)


print("Familles lues dans le NOM")
for nom, attendu in [
    ("Lessive poudre OMO main 4kg", "linge"), ("ARIEL lessive liquide 3L 54 lavages", "linge"), ("Assouplissant Soupline 2L", "linge"),
    ("Liquide vaisselle Pril citron 1,25L", "vaisselle"), ("Tablettes lave-vaisselle Finish x40", "vaisselle"),
    ("Eau de javel Star 1L", "javel"), ("Gel WC Harpic 750ml", "javel"), ("Nettoyant multi-surfaces Mr Propre 1L", "maison"),
    ("Nettoyant vitres Windex 500ml", "maison"), ("Insecticide Raid moustiques 300ml", "maison"),
    ("Désodorisant Air Wick lavande 250ml", "desodorisant"), ("Eponges grattantes x3", "accessoires"), ("Sacs poubelle 30L x20", "accessoires"),
    ("Papier toilette Lotus 12 rouleaux", "papier"), ("Mouchoirs Tempo x10", "papier"), ("Essuie-tout Okay 2 rouleaux", "papier"),
    ("Couches Pampers T4 44 couches", "bebe"), ("Lingettes bébé Johnson's x64", "bebe"),
    ("Serviettes hygiéniques Always ultra x10", "feminine"), ("Dentifrice Colgate 75ml", "bouche"), ("Brosse à dents Signal medium", "bouche"),
    ("Shampooing Elseve 400ml", "cheveux"), ("Gel douche Dove 250ml", "corps"), ("Savon Lux 125g", "corps"),
    ("Déodorant Rexona spray 150ml", "soins"), ("Rasoirs jetables Gillette x5", "soins"),
]:
    ok(famille(nom) == attendu, f"{nom!r} -> {attendu} (lu : {famille(nom)})")
print("Pièges : jamais un produit d'entretien")
for nom in ["Biscuit fourré chocolat 200g", "Lait infantile 1er âge 400g", "Biberon 250ml", "Jouet de bain", "Coffret cadeau parfum", "Fer à repasser vapeur", ""]:
    ok(famille(nom) is None, f"{nom!r} -> à vérifier (lu : {famille(nom)})")
print("Le rayon confirme, il ne décide pas")
ok(famille("Shampooing doux 250ml", "linge") is None, "shampooing dans le rayon lessive = à vérifier")
ok(famille("Lessive liquide 3L", "linge") == "linge", "lessive dans le rayon lessive = linge")

print("Contenance lue, jamais devinée")
for nom, attendu in [
    ("Lessive 3L", (3.0, "L")), ("Javel 1,5 L", (1.5, "L")), ("Dentifrice 75ml", (0.075, "L")), ("Gel 25cl", (0.25, "L")),
    ("Poudre 2,5 kg", (2.5, "kg")), ("Savon 125g", (0.125, "kg")), ("Savon 3x90g", (0.27, "kg")), ("Lot de 2 javel 2L", (4.0, "L")),
    ("Papier toilette 24 rouleaux", (24.0, "u")), ("Couches T4 44 couches", (44.0, "u")), ("Lessive liquide 54 lavages", (54.0, "lavage")),
    ("Éponges x3", (None, None)), ("Nettoyant citron", (None, None)),
]:
    v, u, _ = contenance(nom)
    ok((v, u) == attendu, f"{nom!r} -> {attendu} (lu : {(v, u)})")
ok(contenance("Lessive liquide 3L 54 lavages", fam="linge")[:2] == (54.0, "lavage"), "lessive : prix par LAVAGE quand c'est écrit")
ok(contenance("Lessive liquide 3L", fam="linge")[:2] == (3.0, "L"), "lessive sans lavages écrits : au litre")

print("Pièges de l'étude du 20/11/2026 (vrais textes des magasins)")
for textes, fam, attendu in [
    (("Papier hygiénique 2 plis classic", "Le lot de 24 rouleaux + 8 GRATUIT"), "papier", (32.0, "u")),
    (("Eau de javel", "3L +1L GRATUIT"), "javel", (4.0, "L")),
    (("Lessive en poudre", "4Kg dont 1Kg gratuit"), None, (4.0, "kg")),
    (("Lessive Liquide Doses Tropical", "Les 18 doses de 24,5mL"), "linge", (18.0, "lavage")),
    (("Lessive en capsules 3en1 Alpine", "La boîte de 19 capsules"), "linge", (19.0, "u")),
    (("Couches bébé", "9/18KG Taille 4 40 Couches"), "bebe", (40.0, "u")),
    (("Couches Confort Max", "Taille 1 (2-4Kg) : 20 Couches"), "bebe", (20.0, "u")),
    (("Couches bébé Taille 4",), "bebe", (None, None)),
    (("Serpillère", "50x60CM"), "accessoires", (None, None)),
    (("Lot de 2 lessive liquide Lot de deux Bidons de 1,8L",), "linge", (3.6, "L")),
    (("Dentifrice", "Le tube de75ml"), "bouche", (0.075, "L")),
    (("Savon", "Le lot de 5 morceaux de 75g"), "corps", (0.375, "kg")),
    (("Serviettes LILAS", "8Pièces Micro"), "feminine", (8.0, "u")),
]:
    v, u, _ = contenance(*textes, fam=fam)
    ok((v, u) == attendu, f"{' / '.join(textes)!r} -> {attendu} (lu : {(v, u)})")
for nom, attendu in [("Lessive en poudre savon de Marseille", "linge"), ("Poudre mains savon de Marseille", "linge"), ("Savon vert de ménage", "maison"),
                     ("Nettoyant WC gel javel", "javel"), ("Papier toilette 2 plis", "papier"), ("Couche-culotte adulte Medium 10 Pièces", None),
                     ("Désodorisant sols jasmin", "maison"), ("Lessive liquide parfum lavande 3L", "linge"), ("Eau de toilette homme", None),
                     ("Gant de toilette", None),
                     # vrais noms « à vérifier » du 1er relevé (20/11/2026)
                     ("Roll'on homme Fresh", "soins"), ("Roll-on nature protect invisible pour homme", "soins"), ("Crème à raser", "soins"),
                     ("Gel lavant mains Rose", "corps"), ("Crème lavante hydratante Mains & Corps", "corps"), ("Lingettes Intimes", "feminine"),
                     ("Protèges slip", "feminine"), ("Tampons métalliques galvanisées", "accessoires"), ("Gants haute résistance taille 6", "accessoires"),
                     ("Nettoyant sols et surfaces au savon de Marseille 3L", "maison"), ("Absorbeur d'humidité basic", "desodorisant"),
                     ("Bicarbonate de soude Eradic – 250 g", "maison"), ("Lave linge Frontal 7Kg Inverter Noir LG", None)]:
    ok(famille(nom) == attendu, f"{nom!r} -> {attendu} (lu : {famille(nom)})")
ok(relever.nom_geant("Lessive liquide machin…", "https://www.geantdrive.tn/tunis-city/29277-lessive-liquide-machine-lilas.html") == "Lessive liquide machine lilas",
   "nom Géant coupé : relu dans l'adresse")
ok(relever.nom_geant("Javel 1L", "https://x/1-autre.html") == "Javel 1L", "nom Géant entier : gardé tel quel")
o = relever.offre("cf:9", "carrefour", "Essuie-tout Jumbo", "LILAS", "papier", 5.99, None, [1, 1], "u", None, "Le rouleau")
ok("pu" not in o, "essuie-tout « Jumbo » : pas de prix au rouleau (tailles différentes)")

print("Prix à l'unité")
ok(prix_unite(12.0, 3.0, "L") == 4.0, "12 DT les 3 L = 4 DT le litre")
ok(prix_unite(2.0, 0.03, "L") is None, "échantillon de 30 ml : pas de prix au litre")
ok(prix_unite(5.0, None, None) is None, "sans contenance : pas de prix à l'unité")

print("Marque jamais devinée")
ok(relever.marque_de("", "Lessive OMO main 4kg") == "OMO", "OMO lu dans le nom")
ok(relever.marque_de("Henkel", "Lessive Dixan") == "HENKEL", "marque écrite par le magasin d'abord")
ok(relever.marque_de("", "Lessive en poudre 4kg") == "", "aucune marque : vide")
ok(relever.marque_de("", "Pack OMO + ARIEL") == "", "deux marques : vide")

print("Page Géant inventée : stock 0 écarté, prix barré lu")
page = ('<article class="product-miniature" data-id-product="11"><h3 itemprop="name"><a href="https://g/1">Lessive Omo 4kg</a></h3>'
        '<span class="price">25,900 DT</span><span class="regular-price">29,900 DT</span><input value="5" class="x quantity_product"></article>'
        '<article class="product-miniature" data-id-product="12"><h3 itemprop="name"><a href="https://g/2">Javel 1L</a></h3>'
        '<span class="price">1,200 DT</span><input value="0" class="x quantity_product"></article>')
lus = relever.geant_page(page)
ok(len(lus) == 1 and lus[0]["prix"] == 25.9 and lus[0]["reg"] == 29.9, "1 produit en stock, 25,900 DT barré 29,900 DT")

print("Offre et accueil léger")
o = relever.offre("cf:1", "carrefour", "Lessive liquide Ariel 3L", "ARIEL", "linge", 30.0, 36.0, [30, 40], "u", "img")
ok(o["f"] == "linge" and o["pu"] == [10.0, "L"] and o["r"] == 36.0, "offre : famille, prix au litre, prix barré")
o2 = relever.offre("cf:2", "carrefour", "Javel 1L", "", "maison", 1.0, 1.0, [1, 1], "u", None)
ok(o2["r"] is None, "prix barré égal au prix : pas de promotion")
offres = [dict(relever.offre(f"x:{i}", "geant", f"Lessive {i} 3L", "", "", 10 + i, None, [1, 1], "u", None), i="a.webp") for i in range(40)]
a = relever.accueil(offres, "2026-11-20", {"geant": {"offres": 40}})
ok(len(a["produits"]) == 24 and a["total"] == 40 and a["familles"] == {"linge": 40}, "accueil : 24 produits, total et familles justes")
ok(all("u" not in p for p in a["produits"]), "accueil sans adresses des magasins (plus léger)")

print("Panne d'une enseigne : anciens prix gardés avec LEUR date, jamais comptés comme un relevé du jour")
import json, tempfile  # noqa: E402
from pathlib import Path as _P  # noqa: E402
with tempfile.TemporaryDirectory() as tmp:
    relever.DATA, relever.DONNEES, relever.RAW = _P(tmp) / "data", _P(tmp) / "donnees", _P(tmp) / "donnees" / "brut"
    relever.DATA.mkdir(parents=True)
    (relever.DATA / "produits.json").write_text(json.dumps({"date": "2026-11-19", "produits": [
        {"id": "ge:1", "e": "geant", "n": "Javel 1L", "m": "", "f": "javel", "q": "1 L", "p": 1.0}]}), encoding="utf-8")
    relever.geant = lambda local=False: (_ for _ in ()).throw(RuntimeError("délai dépassé"))
    relever.carrefour = lambda local=False: [dict(relever.offre("cf:1", "carrefour", "Lessive 3L", "", "linge", 9.0, None, [3, 3], "u", None))]
    relever.photos = lambda offres, sans_reseau=False: None
    relever.DONNEES.mkdir(parents=True)
    hier = (relever.date.today() - relever.timedelta(days=1)).isoformat()
    (relever.DONNEES / "etat.json").write_text(json.dumps({"geant": {"offres": 1, "derniere_reussite": hier}}), encoding="utf-8")
    try:
        relever.main()
        ok(True, "panne d'un jour : robot pas rouge (§ 51)")
    except SystemExit as e:
        ok(False, f"panne d'un jour : robot pas rouge (§ 51) — sorti avec « {e} »")
    hist = json.loads((relever.DONNEES / "historique.json").read_text(encoding="utf-8"))
    pub = json.loads((relever.DATA / "produits.json").read_text(encoding="utf-8"))["produits"]
    ok("ge:1" not in hist and "cf:1" in hist, "historique : prix de la veille (enseigne en panne) pas compté comme un prix du jour")
    ok(any(p["id"] == "ge:1" and p.get("d") == "2026-11-19" for p in pub), "page : anciens prix Géant gardés, datés du 19/11")
    etat = json.loads((relever.DONNEES / "etat.json").read_text(encoding="utf-8"))
    ok(etat["geant"]["erreur"] and etat["carrefour"]["erreur"] is None, "état : panne Géant notée, Carrefour lu")

print()
if ECHECS:
    print(f"{len(ECHECS)} ÉCHEC(S)")
    sys.exit(1)
print("Tous les tests du robot sont verts.")
