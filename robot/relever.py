"""Relevé nocturne des prix des produits d'ENTRETIEN, de NETTOYAGE et d'HYGIÈNE (site Prix Hygiène & Maison, 20/11/2026).

Même machine que Prix des Eaux et Prix snacks (modèle « suivi de prix », projets-ahmed) :
- Carrefour par son API GraphQL publique : CHAQUE magasin lu pour le stock et le prix (règle § 43), prix le plus courant ;
- Géant Drive en HTML : produit écarté si quantity_product <= 0 ;
- famille par le NOM (robot/familles.py, règle § 23), contenance lue jamais devinée ;
- panne d'une enseigne (règle § 51) : ses derniers prix gardés avec leur date, robot rouge seulement après 2 jours ;
- photos : copie allégée (WebP 320 px) dans assets/img/p/ (accord des magasins déclaré par Ahmed le 20/11/2026).
Sorties : data/accueil.json (léger), data/produits.json (liste complète), donnees/historique.json, donnees/etat.json.
Usage : python3 robot/relever.py [--local] [--sans-images]
"""
import hashlib, html, io, json, re, subprocess, sys, time
from datetime import date, timedelta  # noqa: F401 (timedelta : tests)
from pathlib import Path
from urllib.parse import urlencode

sys.path.insert(0, str(Path(__file__).resolve().parent))
from familles import famille, contenance, prix_unite, norm, sous_rayon  # noqa: E402

RACINE = Path(__file__).resolve().parent.parent
DONNEES = RACINE / "donnees"
RAW = DONNEES / "brut"
DATA = RACINE / "data"
IMG = RACINE / "assets" / "img" / "p"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36"
PAUSE = 1.0                      # entre deux pages d'un même grand site (règle § 36)
ENSEIGNES = {"carrefour": "Carrefour", "geant": "Géant"}
CARREFOUR_GQL = "https://www.carrefour.tn/graphql"
CARREFOUR_MIN_MAGASINS = 10
JOURS_ROUGE = 2                  # panne plus longue = robot rouge (§ 51)

# Rayons lus (identifiants vérifiés sur les sites le 20/11/2026, étude `etude des sources 2026-11-20.md`) : uid -> rayon
CARREFOUR_RAYONS = {
    "Mzg4Mw==": "linge", "Mzg4Mg==": "linge", "Mzg4NA==": "linge",                       # lessives machine / main, adoucissants
    "Mzg5NA==": "maison", "NDYwMQ==": "vaisselle", "NDYwMg==": "vaisselle",                # javel, vaisselle main / lave-vaisselle
    "Mzg5NQ==": "maison", "Mzg5Ng==": "maison", "Mzg5Nw==": "maison", "Mzg5OA==": "maison", # multi-usages, sols, WC, vitres
    "Mzg5OQ==": "maison", "MzkxNA==": "maison",                                            # savons de ménage, désodorisants
    "MzkwNQ==": "maison", "MzkwMw==": "maison", "MzkwNg==": "maison", "MzkwNA==": "maison", # éponges, lavettes, gants, serpillères
    "Mzk5MA==": "papier", "MzkxMQ==": "papier", "Mzk5MQ==": "papier",                      # papier toilette, essuie-tout, mouchoirs
    "NDQ2Ng==": "bebe", "Mzk4MQ==": "feminine",                                            # couches bébé, serviettes et tampons
    "Mzk2MA==": "hygiene", "Mzk2MQ==": "hygiene", "Mzk1OQ==": "hygiene", "MzkyOQ==": "hygiene", "Mzk0NQ==": "hygiene",
    "Mzk1MQ==": "hygiene", "Mzk1Mg==": "hygiene", "Mzk1NQ==": "hygiene", "Mzk1Ng==": "hygiene",
    "Mzk2OA==": "hygiene", "Mzk2OQ==": "hygiene", "Mzk3OA==": "hygiene",                   # savons, gel douche, shampoings, dentifrices, déos, rasoirs
}
GEANT_RAYONS = {
    "277-entretien-de-la-vaisselle": "vaisselle", "280-entretien-du-linge": "linge", "289-accessoires-de-menage": "maison",
    "296-produits-d-entretien": "maison", "923-papiers-hygieniques-et-essuies-tout": "papier", "230-les-cheveux": "hygiene",
    "236-le-corps": "hygiene", "248-accessoires-de-toilette": "hygiene", "251-hygiene-dentaire": "hygiene", "326-hygiene-et-soin-bebe": "bebe",
}

MARQUES = {
    "OMO", "ARIEL", "PERSIL", "DIXAN", "TIDE", "DOWNY", "LENOR", "SOUPLINE", "CAJOLINE", "FAIRY", "PRIL", "PAIC", "CIF", "AJAX",
    "MR PROPRE", "MR. PROPRE", "HARPIC", "CANARD", "LA CROIX", "AIR WICK", "GLADE", "AMBI PUR", "SANITA", "SCOTCH BRITE", "SCOTCH-BRITE",
    "PAMPERS", "HUGGIES", "MOLFIX", "BABYJOY", "CANBEBE", "LILLYDOO", "ALWAYS", "NATURELLA", "KOTEX", "LILAS", "COLGATE", "SIGNAL",
    "SENSODYNE", "ORAL-B", "CLOSE UP", "AQUAFRESH", "HEAD & SHOULDERS", "PANTENE", "ELSEVE", "GARNIER", "DOVE", "NIVEA", "PALMOLIVE",
    "LUX", "LIFEBUOY", "DETTOL", "SAFEGUARD", "FA", "AXE", "REXONA", "GILLETTE", "BIC", "WILKINSON", "JOHNSON'S", "JOHNSONS",
    "CLEAR", "SUNSILK", "FRUCTIS", "SCHWARZKOPF", "PRINCESSE", "LOTUS", "OKAY", "TEMPO", "KLEENEX", "SOPAL", "LILAS", "BEBEPLUS",
    "JAVEL", "STAR", "RAID", "BAYGON", "WINDEX", "ST MARC", "SAINT MARC", "VANISH", "CALGON", "FINISH", "SUN", "KLINEX", "CARREFOUR",
}
SYNONYMES = {"SCOTCH-BRITE": "SCOTCH BRITE", "MR. PROPRE": "MR PROPRE", "JOHNSONS": "JOHNSON'S", "SAINT MARC": "ST MARC"}


def http_get(url, params=None, timeout=60, headers=None, binaire=False):
    """GET via curl (Carrefour refuse python ; Géant a une chaîne de certificats incomplète : -k ciblé sur l'erreur 60)."""
    if params:
        url += "?" + urlencode({k: v for k, v in params.items() if v is not None})
    cmd = ["curl", "-sSL", "--fail", "--compressed", "-A", UA, "-H", "Accept-Language: fr-FR,fr;q=0.9",
           *[x for k, v in (headers or {}).items() for x in ("-H", f"{k}: {v}")], "--max-time", str(timeout), url]
    r = subprocess.run(cmd, capture_output=True, timeout=timeout + 10)
    if r.returncode == 60:
        r = subprocess.run(cmd[:1] + ["-k"] + cmd[1:], capture_output=True, timeout=timeout + 10)
    if r.returncode:
        raise RuntimeError(f"curl {r.returncode} {url}: {r.stderr.decode(errors='replace').strip()[:200]}")
    return r.stdout


def parse_prix(s):
    if not s:
        return None
    m = re.search(r"(\d+)[,.](\d{1,3})", s.replace(" ", "").replace(" ", ""))
    return float(f"{m.group(1)}.{m.group(2)}") if m else None


def marque_de(fabricant, nom):
    """Marque écrite par le magasin, sinon UNE marque connue trouvée dans le nom ; sinon vide (jamais devinée)."""
    f = (fabricant or "").strip().upper()
    if f:
        return SYNONYMES.get(f, f)
    n = " " + re.sub(r"[^a-z0-9&' ]+", " ", norm(nom)).upper() + " "
    trouvees = {SYNONYMES.get(m, m) for m in MARQUES if " " + m + " " in n}
    trouvees.discard("JAVEL")
    return trouvees.pop() if len(trouvees) == 1 else ""


def offre(oid, enseigne, nom, marque, rayon, prix, reg, nb, url, image, desc=""):
    fam = famille(nom, rayon)
    val, unite, qt = contenance(nom, desc, fam=fam)
    if fam == "papier" and re.search(r"jumbo|maxi roll|essuie|le rouleau", norm(nom + " " + desc)):
        unite = None                                  # rouleaux de tailles différentes : un prix « au rouleau » tromperait (étude § 7.7)
    o = {"id": oid, "e": enseigne, "n": re.sub(r"\s+", " ", nom).strip(), "m": marque, "f": fam, "q": qt, "p": round(prix, 3),
         "r": round(reg, 3) if reg and reg > prix + 0.0005 else None, "nb": nb, "u": url, "img": image}
    pu = prix_unite(prix, val, unite)
    if pu:
        o["pu"] = [pu, unite]
    if fam:
        o["s"] = sous_rayon(nom + " " + desc, fam)
    return o


# ---------------------------------------------------------------- Carrefour
def carrefour_gql(q, magasin=None):
    q = re.sub(r"\s+", " ", q)
    d = json.loads(http_get(CARREFOUR_GQL, {"query": q}, headers={"Store": magasin} if magasin else None))
    if "errors" in d and not d.get("data"):
        raise RuntimeError(f"Carrefour : {d['errors'][0].get('message')}")
    return d["data"]


def carrefour_filtre():
    return "category_uid:{in:[" + ",".join(f'"{u}"' for u in CARREFOUR_RAYONS) + "]}"


def carrefour_marques():
    """Numéro de marque -> nom (Carrefour donne la marque de CHAQUE produit par un numéro, étude du 20/11/2026)."""
    d = carrefour_gql(f"{{products(filter:{{{carrefour_filtre()}}},pageSize:1){{aggregations{{attribute_code options{{label value}}}}}}}}")
    for a in d["products"]["aggregations"]:
        if a["attribute_code"] == "brand":
            return {o["value"]: o["label"].strip() for o in a["options"]}
    return {}


def carrefour_pages(filtre, champs, magasin=None, taille=100):
    items, page, total = [], 1, 1
    while page <= total:
        q = f'{{products(filter:{{{filtre}}},pageSize:{taille},currentPage:{page}){{page_info{{total_pages}} items{{{champs}}}}}}}'
        d = carrefour_gql(q, magasin)["products"]
        items += d["items"]
        total = d["page_info"]["total_pages"]
        page += 1
        time.sleep(0.3)
    return items


def carrefour(local=False):
    brut = RAW / "carrefour.json"
    if local:
        d = json.loads(brut.read_text(encoding="utf-8"))
        catalogue, prix_mag, noms, lus = {k: tuple(v) for k, v in d["catalogue"].items()}, d["prix_mag"], d["magasins"], d["lus"]
    else:
        filtre = carrefour_filtre()
        marques = carrefour_marques()
        champs = "name sku url_key brand categories{uid} short_description{html} small_image{url}"
        catalogue = {}
        for it in carrefour_pages(filtre, champs, taille=200):
            rayon = next((CARREFOUR_RAYONS[c["uid"]] for c in it.get("categories") or [] if c["uid"] in CARREFOUR_RAYONS), "")
            it["marque"] = marques.get(str(it.get("brand") or ""), "")
            it["desc"] = html.unescape(re.sub(r"<[^>]+>", " ", (it.get("short_description") or {}).get("html") or "")).strip()
            for k in ("categories", "short_description", "brand"):
                it.pop(k, None)
            catalogue[it["sku"]] = (it, rayon)
        liste = carrefour_gql("{availableStores{store_code store_name}}")["availableStores"]
        noms = {m["store_code"]: (m.get("store_name") or m["store_code"]).strip() for m in liste if m["store_code"] != "default"}
        prix_mag, lus, rates = {}, 0, []
        for code in noms:
            try:
                for it in carrefour_pages(filtre, "sku stock_status price_range{minimum_price{final_price{value} regular_price{value}}}", code, 200):
                    if it.get("stock_status") == "IN_STOCK":
                        mp = it["price_range"]["minimum_price"]
                        prix_mag.setdefault(it["sku"], {})[code] = [mp["final_price"]["value"], mp["regular_price"]["value"]]
                lus += 1
            except Exception as e:  # un magasin illisible n'arrête pas les autres
                rates.append(f"{code} ({e})")
            time.sleep(PAUSE)
        if lus < max(CARREFOUR_MIN_MAGASINS, 0.66 * len(noms)):
            raise RuntimeError(f"magasins Carrefour illisibles : {lus} lus sur {len(noms)} ({'; '.join(rates[:3])})")
        brut.write_text(json.dumps({"date": date.today().isoformat(), "magasins": noms, "lus": lus, "catalogue": catalogue,
                                    "prix_mag": prix_mag}, ensure_ascii=False), encoding="utf-8", newline="\n")
    offres, a_verifier = [], []
    for sku, (it, rayon) in catalogue.items():
        pm = prix_mag.get(sku)
        if not pm:
            continue                                  # vendu dans aucun magasin ce jour : pas de prix (§ 43)
        finals = [v[0] for v in pm.values()]
        regs = [v[1] for v in pm.values()]
        courant = min(set(finals), key=lambda v: (-finals.count(v), v))
        reg = min(set(regs), key=lambda v: (-regs.count(v), v))
        o = offre(f"cf:{sku}", "carrefour", it["name"], it.get("marque") or marque_de(None, it["name"]), rayon, courant, reg, [len(pm), lus],
                  f"https://www.carrefour.tn/{it['url_key']}.html", (it.get("small_image") or {}).get("url"), it.get("desc", ""))
        if o["q"] and it.get("desc") and norm(o["q"]) not in norm(o["n"]) and len(it["desc"]) <= 70:
            o["q"] = it["desc"]                       # « Le lot de 24 rouleaux + 8 GRATUIT » : la phrase du magasin, plus claire
        (offres if o["f"] else a_verifier).append(o)
    ecrire(RAW / "carrefour-a-verifier.json", sorted(a["n"] for a in a_verifier))
    print(f"  Carrefour : {len(offres)} offres gardées, {len(a_verifier)} à vérifier, {lus} magasins lus sur {len(noms)}")
    return offres


# ---------------------------------------------------------------- Géant
def geant_page(h):
    out = []
    for bloc in h.split('<article class="product-miniature')[1:]:
        g = lambda pat: (re.search(pat, bloc, re.S) or [None, None])[1]  # noqa: E731
        nom = html.unescape(g(r'itemprop="name"><a[^>]*>([^<]+)</a>') or "").strip()
        url = g(r'itemprop="name"><a[^>]*href="([^"]+)"') or ""
        fab = html.unescape(g(r'class="manufacturer_product[^"]*">\s*([^<]+?)\s*</p>') or "")
        desc = html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", g(r'itemprop="description"[^>]*>(.*?)</div>') or ""))).strip()
        prix = parse_prix(g(r'class="price">([^<]+)<'))
        reg = parse_prix(g(r'class="regular-price">([^<]+)<')) or prix
        stock = g(r'value="(-?\d+)" class="[^"]*quantity_product')
        pid = g(r'data-id-product="(\d+)"') or re.sub(r"\W+", "", url)[-24:]
        if not nom or prix is None or (stock is not None and int(stock) <= 0):
            continue                                  # hors stock : écarté (§ 43)
        out.append({"id": f"ge:{pid}", "nom": nom, "fabricant": fab, "desc": desc, "prix": prix, "reg": reg, "url": url,
                    "image": g(r'data-full-size-image-url="([^"]+)"') or g(r'<img[^>]+src="([^"]+)"')})
    return out


def nom_geant(nom, url):
    """Géant coupe 1 648 noms par « … » dans ses listes (étude du 20/11) : le nom complet est relu dans l'adresse du produit
    (« …/29277-liquide-vaiselle-main-5en1.html » -> « Liquide vaiselle main 5en1 »)."""
    nom = re.sub(r"\s+", " ", nom).strip()
    if not nom.endswith(("…", "...")):
        return nom
    slug = re.sub(r"^\d+-", "", url.rstrip("/").rsplit("/", 1)[-1].replace(".html", ""))
    complet = slug.replace("-", " ").strip()
    debut = norm(nom.rstrip("….").strip())[:12]
    return complet[:1].upper() + complet[1:] if complet and norm(complet).startswith(debut[:6]) else nom.rstrip("….").strip()


def geant(local=False):
    brut = RAW / "geant.json"
    if local:
        produits = json.loads(brut.read_text(encoding="utf-8"))["produits"]
    else:
        if not GEANT_RAYONS:
            raise RuntimeError("aucun rayon Géant configuré")
        produits = {}
        for slug, rayon in GEANT_RAYONS.items():
            page = 1
            while page <= 40:
                h = http_get(f"https://www.geantdrive.tn/tunis-city/{slug}", {"resultsPerPage": 100, "page": page}).decode("utf-8", errors="replace")
                lus = geant_page(h)
                for p in lus:
                    p["rayon"] = rayon
                    produits.setdefault(p["id"], p)
                if not lus or f"page={page + 1}" not in h:
                    break
                page += 1
                time.sleep(PAUSE)
            time.sleep(PAUSE)
        brut.write_text(json.dumps({"date": date.today().isoformat(), "produits": produits}, ensure_ascii=False), encoding="utf-8", newline="\n")
    offres, a_verifier = [], []
    for p in produits.values():
        # Géant écrit parfois un nom court (« Lessive »), la marque à part et le format en description : le nom gardé réunit les trois
        nom = nom_geant(p["nom"], p["url"])
        desc = p["desc"].rstrip("….").strip() if not p["desc"].endswith(("…", "...")) else ""
        o = offre(p["id"], "geant", nom, marque_de(p["fabricant"], p["nom"]), p.get("rayon", ""), p["prix"], p["reg"], [1, 1], p["url"], p["image"], desc or p["desc"])
        o["q"] = o["q"] or (desc if len(desc) <= 40 else "")
        (offres if o["f"] else a_verifier).append(o)
    ecrire(RAW / "geant-a-verifier.json", sorted(a["n"] for a in a_verifier))
    print(f"  Géant : {len(offres)} offres gardées, {len(a_verifier)} à vérifier")
    return offres


# ---------------------------------------------------------------- photos (copies allégées)
def photos(offres, sans_reseau=False, maximum=4000):
    """Chaque photo de magasin est copiée UNE fois en WebP 320 px (≈ 10 Ko) : assets/img/p/<empreinte>.webp.
    Photo introuvable ou illisible : la carte montre le dessin de la famille (jamais une image d'un autre site)."""
    carnet = charger(DONNEES / "images.json", {})
    nouvelles = 0
    try:
        from PIL import Image
    except ImportError:
        Image = None
    for o in offres:
        src = o.pop("img", None)
        if not src:
            continue
        nom = hashlib.sha1(src.encode()).hexdigest()[:14] + ".webp"
        if carnet.get(src) == nom and (IMG / nom).exists():
            o["i"] = f"assets/img/p/{nom}"
            continue
        if sans_reseau or Image is None or nouvelles >= maximum:
            continue
        try:
            brut = http_get(src, timeout=30)
            im = Image.open(io.BytesIO(brut))
            im = im.convert("RGBA") if im.mode in ("P", "LA") else im
            if im.mode == "RGBA":                    # fond blanc (le site met les photos sur blanc)
                fond = Image.new("RGB", im.size, "white")
                fond.paste(im, mask=im.split()[3])
                im = fond
            im = im.convert("RGB")
            im.thumbnail((320, 320))
            IMG.mkdir(parents=True, exist_ok=True)
            im.save(IMG / nom, "WEBP", quality=72, method=6)
            carnet[src] = nom
            o["i"] = f"assets/img/p/{nom}"
            nouvelles += 1
            time.sleep(0.3)
        except Exception as e:  # photo absente : dessin de la famille
            print(f"    photo illisible ({e}) : {src[:90]}")
    ecrire(DONNEES / "images.json", carnet)
    print(f"  Photos : {nouvelles} nouvelles, {sum(1 for o in offres if o.get('i'))} offres avec photo sur {len(offres)}")


# ---------------------------------------------------------------- fichiers
def charger(p, defaut):
    try:
        return json.loads(Path(p).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return defaut


def ecrire(p, d, compact=False):
    p = Path(p)
    p.parent.mkdir(parents=True, exist_ok=True)
    txt = json.dumps(d, ensure_ascii=False, separators=(",", ":")) if compact else json.dumps(d, ensure_ascii=False, indent=1, sort_keys=True)
    p.write_text(txt + "\n", encoding="utf-8", newline="\n")


def enregistrer_historique(offres, jour):
    """Historique = la vérité (jamais refait depuis donnees/brut/) : {id: {e, n, m, f, q, prix: {jour: [prix, prix barré, nb magasins]}}}."""
    hist = charger(DONNEES / "historique.json", {})
    for o in offres:
        if o.get("d", jour) != jour:
            continue                                  # offre gardée d'une enseigne en panne : pas un relevé du jour
        h = hist.setdefault(o["id"], {"prix": {}})
        h.update({k: o.get(k) for k in ("e", "n", "m", "f", "q", "u")})
        h["prix"][jour] = [o["p"], o.get("r"), (o.get("nb") or [1])[0]]
    ecrire(DONNEES / "historique.json", hist, compact=True)


def accueil(offres, jour, etat):
    """Fichier léger de l'accueil (< 30 Ko) : nombres par famille + 24 produits (promotions d'abord, puis un peu de chaque famille)."""
    par_fam = {}
    for o in offres:
        par_fam.setdefault(o["f"], []).append(o)
    choix, vus = [], set()
    promos = sorted((o for o in offres if o.get("r") and o.get("i")), key=lambda o: -(o["r"] - o["p"]) / o["r"])
    for o in promos[:8]:
        choix.append(o); vus.add(o["id"])
    familles = sorted(par_fam, key=lambda f: -len(par_fam[f]))
    # photo d'abord (l'accueil doit être beau), puis le prix à l'unité ; sans photo seulement s'il en manque
    files = {f: sorted(par_fam[f], key=lambda o: (not o.get("i"), o.get("pu", [o["p"]])[0])) for f in familles}
    while len(choix) < 24 and any(files.values()):      # un produit de chaque famille à tour de rôle
        for f in familles:
            while files[f] and files[f][0]["id"] in vus:
                files[f].pop(0)
            if files[f] and len(choix) < 24:
                o = files[f].pop(0)
                choix.append(o); vus.add(o["id"])
    # rayons : nombre, sous-rayons, et la photo d'un produit connu (marque la plus présente du rayon, produit avec photo)
    rayons = {}
    for f, l in par_fam.items():
        sous = {}
        for o in l:
            sous[o.get("s") or "autres"] = sous.get(o.get("s") or "autres", 0) + 1
        marques = {}
        for o in l:
            if o.get("m") and o.get("i"):
                marques[o["m"]] = marques.get(o["m"], 0) + 1
        top = max(marques, key=marques.get) if marques else None
        photo = next((o["i"] for o in sorted(l, key=lambda o: o["p"]) if o.get("i") and o.get("m") == top), None) \
            or next((o["i"] for o in l if o.get("i")), None)
        rayons[f] = {"n": len(l), "s": sous, "i": photo}
    promo = [{k: v for k, v in o.items() if k != "u"} for o in promos[:16]]
    return {"date": jour, "total": len(offres), "familles": {f: len(v) for f, v in par_fam.items()}, "rayons": rayons, "promos": promo,
            "enseignes": {k: {kk: v.get(kk) for kk in ("offres", "erreur", "derniere_reussite")} for k, v in etat.items()},
            "produits": [{k: v for k, v in o.items() if k != "u"} for o in choix]}


def main():
    local = "--local" in sys.argv
    RAW.mkdir(parents=True, exist_ok=True)
    jour = date.today().isoformat()
    etat = charger(DONNEES / "etat.json", {})
    avant = charger(DATA / "produits.json", {})
    anciennes = [{**o, "d": o.get("d") or avant.get("date")} for o in avant.get("produits", [])]   # date de leur relevé, jamais « aujourd'hui »
    offres, rouge = [], []
    for nom, lecteur in (("geant", geant), ("carrefour", carrefour)):
        try:
            lus = lecteur(local)
            avant = etat.get(nom, {}).get("offres", 0)
            if avant and len(lus) < 0.5 * avant:
                raise RuntimeError(f"{len(lus)} offres au lieu de ~{avant} : lecture incomplète, relevé {nom} refusé")
            for o in lus:
                o["d"] = jour
            offres += lus
            etat[nom] = {"date": jour, "offres": len(lus), "erreur": None, "derniere_reussite": jour}
        except Exception as e:
            print(f"  ÉCHEC {ENSEIGNES[nom]} : {e}")
            gardees = [o for o in anciennes if o.get("e") == nom]
            offres += gardees                           # derniers prix gardés, avec leur date (§ 51)
            der = etat.get(nom, {}).get("derniere_reussite")
            etat[nom] = {**etat.get(nom, {}), "date": jour, "erreur": str(e)[:300], "offres": len(gardees)}
            if not der or (date.fromisoformat(jour) - date.fromisoformat(der)).days > JOURS_ROUGE:
                rouge.append(f"{ENSEIGNES[nom]} : {e}")
    if not offres:
        ecrire(DONNEES / "etat.json", etat)
        sys.exit("ÉCHEC : aucune enseigne lue et aucun ancien prix")
    photos([o for o in offres if "img" in o], sans_reseau=local or "--sans-images" in sys.argv)
    for o in offres:
        o.pop("img", None)
    offres.sort(key=lambda o: (o["f"], o["p"]))
    enregistrer_historique(offres, jour)
    # page publique : sans l'adresse chez le magasin ni la date du relevé (plus léger) ; offre d'une enseigne en panne : date gardée
    legeres = [{k: v for k, v in o.items() if k != "u" and not (k == "d" and v == jour) and v not in (None, "")} for o in offres]
    ecrire(DATA / "produits.json", {"date": jour, "produits": legeres}, compact=True)
    ecrire(DATA / "accueil.json", accueil(offres, jour, etat), compact=True)
    ecrire(DONNEES / "etat.json", etat)
    print(f"Relevé du {jour} : {len(offres)} offres publiées")
    if rouge:
        sys.exit("ÉCHEC durable (> 2 jours) : " + " ; ".join(rouge))


if __name__ == "__main__":
    main()
