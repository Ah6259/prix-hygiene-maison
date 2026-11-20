"""Familles des produits d'entretien et d'hygiène, et lecture de la contenance — d'après le NOM du produit (règle § 23 :
le rayon du magasin ne fait que confirmer, il ne décide jamais). Rien n'est deviné : pas de mot connu = « à vérifier »,
pas de contenance écrite = pas de prix à l'unité. Fonctions PURES (testées sans réseau dans tools/test_robot.py)."""
import re
import unicodedata


def sans_accents(s):
    return "".join(c for c in unicodedata.normalize("NFD", s or "") if unicodedata.category(c) != "Mn")


def norm(s):
    return re.sub(r"\s+", " ", sans_accents(s).lower().replace("’", "'")).strip()


# Ordre = priorité quand deux familles sont possibles : le mot de la famille la plus PRÉCISE gagne
# (« lingettes bébé » = bébé ; « gel douche » = corps ; « lessive liquide » = linge ; « javel » = javel).
FAMILLES = [
    ("bebe", r"\bcouches?\b|\bculottes? (?:bebe|d'apprentissage)|\bpampers\b|\blingettes? (?:bebe|pour bebe)|\bbebe\b|\bbaby\b|\bpants\b"),
    ("feminine", r"\bserviettes? (?:hygieniques?|feminines?)|\bproteges?[- ]slips?\b|\blingettes? intimes?|\btampons?\b|\bnaturella\b|\balways\b|\bintimate?\b|\btoilette intime"),
    ("bouche", r"\bdentifrice|\bbrosses? a dents?\b|\bbain de bouche|\bfil dentaire|\bdentaire\b|\bcolgate\b|\bsignal\b|\bsensodyne\b|\boral[- ]?b\b"),
    ("cheveux", r"\bshampo+ing|\bshampoo|\bapres[- ]shampo+ing|\bmasque (?:capillaire|cheveux)|\bcheveux\b|\bconditioner\b|\bgel coiffant|\blaque\b|\bcreme (?:coiffante|capillaire)"),
    ("soins", r"\bdeodorant|\bdeo\b|\broll\W?\s*on\b|\bcreme a raser|\brasage\b|\banti[- ]?transpirant|\brasoirs?\b|\blames? de rasoir|\bmousse a raser|\bgel a raser|\bapres[- ]rasage|\bcoton[- ]tiges?|\bcotons? (?:demaquillants?|hydrophile)|\bdisques? (?:demaquillants?|coton)"),
    ("corps", r"\bgel lavant|\bcreme lavante|\bgel douche|\bdouche\b|\bsavon|\bbain moussant|\bshower\b|\bsoap\b|\bnettoyant mains|\blave[- ]mains"),
    ("papier", r"\bpapier (?:toilette|hygienique|wc)|\bessuie[- ]tout|\bmouchoirs?\b|\bpapier absorbant|\bserviettes? (?:de table|en papier)|\bpapier cuisine|\brouleaux?\b"),
    ("linge", r"\blessive|\bdetergent (?:poudre|liquide|linge)|\blinge\b|\bassouplissant|\bdetachant|\bcapsules? (?:lavage|lessive)|\bpods\b|\bgel (?:lavage|machine)|\bpoudre (?:a laver|machine)|\bomo\b|\bariel\b|\bpersil\b|\bdixan\b|\bsoupline\b|\bcajoline\b|\bdowny\b|\blenor\b|\bamidon\b"),
    ("vaisselle", r"\bvaisselle|\blave[- ]vaisselle|\bdishwash|\bliquide vaisselle|\bfairy\b|\bpril\b|\bpastilles? (?:lave|lv)|\btablettes? lave"),
    ("javel", r"\bjavel|\beau de javel|\bwc\b|\bcuvette\b|\bcanard\b|\bharpic\b|\bdetartrant|\bdeboucheur|\bblocs? wc|\bchlore\b|\bcanalisations?\b"),
    ("desodorisant", r"\babsorbeurs? d.humidite|\bdesodorisant|\bdesodorisant|\bdiffuseur|\bdesodorisant d'interieur|\bair wick|\bglade\b|\bparfum d'interieur|\bdesodo\b|\bdeodorisant|\banti[- ]odeurs?|\bbougies? parfumees?"),
    ("accessoires", r"\beponges?\b|\bgants?\b|\bgants? (?:menage|de menage|latex|vinyle|nitrile)|\bsacs? (?:poubelle|a ordures|dechets)|\bserpilli[eè]re|\bbalai|\braclette|\bfrottoir|\btampons? (?:a recurer|inox|metalliques?)|\blavette|\bmicrofibre|\bchiffons?\b|\bpelle\b|\bseau\b|\bfilm alimentaire|\bpapier (?:aluminium|alu|cuisson)"),
    ("maison", r"\bnettoyant|\bmultisurfaces?|\bmulti[- ]?usages?|\bsols?\b|\bvitres?\b|\bdegraissant|\bcreme a recurer|\bpoudre a recurer|\bdesinfectant|\bspray (?:nettoyant|desinfectant)|\bcif\b|\bmr\.? propre|\bajax\b|\bst marc\b|\bsaint marc\b|\bwindex\b|\bcarrelage|\bparquet|\bmeubles?\b|\bencaustique|\binsecticide|\bmoustiques?|\bblattes?|\bcafards?|\bfourmis\b|\braid\b|\bbaygon\b|\bbicarbonate\b|\bvinaigre (?:blanc|menager)"),
]
# Ce qui n'est JAMAIS un produit d'entretien ou d'hygiène, même avec un mot ci-dessus (« savon de Marseille » oui ;
# « biscuit savon » non ; nourriture, boissons, jouets, petit électroménager).
HORS = (r"\bbiscuits?\b|\bchocolat|\bgateau|\bboisson|\bjus\b|\blait (?:demi|entier|uht|infantile|croissance|1er|2eme|bebe)|\bpetits? pots?\b|"
        r"\bcereales?\b|\bcompote|\bjouet|\bpeluche|\bbiberon|\btetine|\baspirateur|\bfer a repasser|\bmachine a laver\b|\blave[- ]linge\b|\blave[- ]vaisselle (?:encastrable|pose libre|\d+ couverts)|\binverter\b|\brefrigerateur|"
        r"\bpoussette|\bsiege auto|\bvetements?\b|\bpyjama|\bbody\b|\bchaussettes?|\bcoffret cadeau|"
        r"\badultes?\b|\beau de (?:toilette|parfum|cologne)|\bparfums? (?:homme|femme|pour (?:homme|femme))|\bgants? de toilette|\bcoloration|\bteinture|\bcirage")

# Rayon du magasin -> familles qu'il peut contenir (confirmation seulement ; vide = pas de contrôle)
RAYON_FAMILLES = {
    "linge": {"linge", "maison"}, "vaisselle": {"vaisselle"}, "maison": {"maison", "javel", "desodorisant", "accessoires", "vaisselle", "linge"},
    "papier": {"papier"}, "bebe": {"bebe", "corps", "cheveux"}, "feminine": {"feminine"},
    "hygiene": {"corps", "cheveux", "bouche", "soins", "feminine", "papier"}, "": set(),
}


# Cas précis lus dans l'étude du 20/11/2026 (vrais noms des magasins), décidés AVANT la règle générale
SPECIFIQUES = [
    (r"\bsavons? (?:de menage|noir|vert|a linge)\b", "maison"),       # savon vert du rayon « Lessives » : produit ménager
    (r"\b(?:desodorisant|parfum) (?:sols?|surfaces?|de sol)\b", "maison"),
    (r"\bpoudre (?:mains?|machine)\b", "linge"),                     # « Poudre mains NADHIF » = lessive à la main, pas un savon
    (r"\blessive\b", "linge"),                                       # « Lessive en poudre savon de Marseille » = lessive
    (r"\bpapier (?:toilette|hygienique)|\bessuie[- ]tout\b", "papier"),
    (r"\btampons? (?:a recurer|inox|metalliques?|galvanises?)", "accessoires"),
]


def famille(nom, rayon=""):
    """Famille d'après le NOM. Cas précis d'abord ; sinon le mot connu écrit LE PLUS TÔT dans le nom gagne (« Nettoyant WC » :
    le mot générique « nettoyant » cède à une famille précise). None = à vérifier. Un rayon connu qui ne peut pas contenir la
    famille lue = à vérifier (le rayon confirme, il ne décide jamais : règle § 23)."""
    n = norm(nom)
    if not n or re.search(HORS, n):
        return None
    fam = next((f for pat, f in SPECIFIQUES if re.search(pat, n)), None)
    if not fam:
        trouves = sorted((m.start(), i, f) for i, (f, pat) in enumerate(FAMILLES) for m in [re.search(pat, n)] if m)
        if not trouves:
            return None
        fam = trouves[0][2]
        precises = [t for t in trouves if t[2] in ("javel", "vaisselle", "linge", "desodorisant")]   # « Nettoyant WC » ; jamais « Nettoyant sols au savon »
        if fam == "maison" and precises and re.match(r"\s*(?:nettoyant|spray|gel|creme|produit)\b", n):
            fam = precises[0][2]
    permises = RAYON_FAMILLES.get(rayon or "", set())
    if permises and fam not in permises:
        return None
    return fam


def _nombre(s):
    return float(s.replace(",", "."))


# Unités comptées (« 24 rouleaux », « 44 couches », « 54 lavages », « 3 pièces »)
COMPTES = [
    ("lavage", r"(\d{1,3})\s*(?:lavages?|lav\b|doses?|scoops?|wl\b)"),
    ("u", r"(\d{1,3})\s*(?:rouleaux?|rlx|couches?|culottes?|pants|lingettes?|serviettes?|protege[- ]slips?|tampons?|mouchoirs?|feuilles?|"
          r"pieces?|pcs?\b|unites?|u\b|capsules?|pastilles?|tablettes?|sachets?|sacs?|eponges?|lames?|rasoirs?|disques?|cotons?[- ]tiges?|batonnets?)"),
]


LETTRES = {"deux": 2, "trois": 3, "quatre": 4, "cinq": 5, "six": 6, "huit": 8, "dix": 10, "douze": 12}
VOL = r"(\d+(?:[.,]\d+)?)\s*(ml|cl|l|litres?|g|gr|grs|kg)\b"


def _prepare(t):
    t = norm(t).replace("×", "x")
    t = re.sub(r"\b(" + "|".join(LETTRES) + r")\b", lambda m: str(LETTRES[m.group(1)]), t)
    t = re.sub(r"([a-z])(\d)", r"\1 \2", t)                    # fautes du magasin : « tube de75ml » -> « tube de 75ml »
    t = re.sub(r"(\d)\s*(pieces?|morceaux?|morecaux)\b", r"\1 pieces", t)
    t = re.sub(r"\d+\s*/\s*\d+\s*kg\b|\(\s*\d+\s*-\s*\d+\s*kg\s*\)|\d+\s*-\s*\d+\s*kg\b", " ", t)   # poids de l'ENFANT (couches) : jamais une contenance
    t = re.sub(r"\d+\s*x\s*\d+\s*cm\b|\d+\s*cm\b", " ", t)      # dimensions (« 50x60 cm ») : pas un lot
    return t


def contenance(*textes, fam=None):
    """Contenance lue dans le nom puis dans la description : (valeur, unité, texte lisible), unité « L », « kg », « lavage » ou « u ».
    « 2 x 1,5 L » / « 3x90g » multipliés ; « lot de 2 » + « 1 L » = 2 L ; « 3 L + 1 L gratuit » = 4 L, mais « 4 kg dont 1 kg gratuit » = 4 kg ;
    « 24 rouleaux + 8 gratuit » = 32 rouleaux. Lessive : prix par LAVAGE / dose / capsule quand c'est écrit. Couches : nombre de couches
    seulement (le « kg » écrit est le poids de l'enfant). Rien d'écrit = (None, None, "") : jamais deviné."""
    for brut in textes:
        t = _prepare(brut)
        if not t:
            continue
        lot = re.search(r"\b(?:lot|pack|paquet|les|le lot de) (?:de )?(\d{1,2}) (?:flacons?|bidons?|bouteilles?|sachets?|tubes?|pieces|savons?|boites?|recharges?|x\b)?", t)
        lot = int(lot.group(1)) if lot and 1 < int(lot.group(1)) <= 24 else 1   # multiplie un VOLUME seulement (« lot de 2 » + « 1 L »)
        comptes = COMPTES if fam != "bebe" else [c for c in COMPTES if c[0] == "u"]
        if fam in ("linge", "vaisselle") or fam == "bebe" or not re.search(VOL, t):
            for unite, pat in comptes:
                m = re.search(pat, t)
                if m and int(m.group(1)) > 0 and (fam != "linge" or unite == "lavage" or re.search(r"capsules?|pods|tablettes?|pastilles?", m.group(0))):
                    n = int(m.group(1))
                    plus = re.search(re.escape(m.group(0)) + r"\s*\+\s*(\d{1,3})\s*(?:\w+\s*)?gratuits?", t)
                    n = n + int(plus.group(1)) if plus else n
                    mot = "lavages" if unite == "lavage" else re.sub(r"^\d+\s*", "", m.group(0)).strip()
                    return float(n), unite, f"{n} {mot}"
            if fam == "bebe":
                continue                              # couches : le nombre est peut-être dans la description
        m = re.search(r"(\d{1,2})\s*x\s*" + VOL, t)
        if m:
            n, v, u = int(m.group(1)), _nombre(m.group(2)), m.group(3)
            val, unite = _en_base(v, u)
            return round(n * val, 3), unite, f"{n} × {_lisible(v, u)}"
        m = re.search(VOL, t)
        if m:
            v, u = _nombre(m.group(1)), m.group(2)
            val, unite = _en_base(v, u)
            if val <= 0:
                continue
            plus = re.search(re.escape(m.group(0)) + r"\s*\+\s*" + VOL + r"\s*(?:\w+\s*)?gratuits?", t)
            if plus:
                v2, u2 = _en_base(_nombre(plus.group(1)), plus.group(2))
                if u2 == unite:
                    return round(lot * (val + v2), 3), unite, _lisible(v, u) + " + " + _lisible(_nombre(plus.group(1)), plus.group(2)) + " offert"
            return round(lot * val, 3), unite, (f"{lot} × " if lot > 1 else "") + _lisible(v, u)
    return None, None, ""


def _en_base(v, u):
    if u in ("ml",):
        return v / 1000, "L"
    if u == "cl":
        return v / 100, "L"
    if u.startswith("l"):
        return v, "L"
    if u in ("g", "gr", "grs"):
        return v / 1000, "kg"
    return v, "kg"


def _lisible(v, u):
    s = (f"{v:g}").replace(".", ",")
    return s + " " + {"litre": "L", "litres": "L", "l": "L", "gr": "g", "grs": "g"}.get(u, u)


def prix_unite(prix, valeur, unite):
    """Prix par litre / kilo / lavage / unité ; None sans contenance lue. Un très petit format (< 50 ml, < 50 g) n'a pas de
    prix au litre (on ne compare pas un échantillon à un bidon)."""
    if not prix or not valeur or not unite:
        return None
    if unite in ("L", "kg") and valeur < 0.05:
        return None
    return round(prix / valeur, 3)
