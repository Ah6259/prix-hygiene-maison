/* Prix Hygiène & Maison — page d'accueil, design « supermarché » (20/11/2026, refait à la demande d'Ahmed).
   Données : data/accueil.json (léger : rayons, promotions, 24 produits) tout de suite, data/produits.json au 1er geste (règle § 60).
   Rayons et sous-rayons comme en magasin, filtres marques et magasin, prix Tutto Clean (carnet Cloudflare), panier et commande WhatsApp
   (numéro HM-AAMMJJ-XXXX). Aucun script dans la page (CSP), aucun cookie. */
(function () {
  "use strict";
  var WHATSAPP = "21699453345";
  var PAR_PAGE = 24;
  var CLE_PANIER = "hm_panier_v1";
  var CLE_LANGUE = "hm_langue";

  /* ------------------------------------------------------------ textes */
  var T = {
    fr: {
      saut: "Aller aux produits", "haut-livraison": "Livraison partout en Tunisie", "haut-livraison-court": "Livré partout en Tunisie", "haut-prix": "Prix vérifiés chaque nuit", "logo-sous": "livré par Tutto Clean",
      chercher: "Rechercher un produit, une marque…", panier: "Panier", "hero-pastille": "Carrefour · Géant · prix vérifiés chaque nuit",
      titre: "Les prix de l'entretien<br>et de l'hygiène,<br><span class=\"surligne\">livrés chez vous</span>",
      phrase: "Comparez, remplissez votre panier : Tutto Clean vous livre partout en Tunisie.",
      "hero-promos": "Voir les promotions", "hero-wa": "Commander sur WhatsApp", "hero-commander": "Commander chez Tutto Clean", "hero-boutique": "🏪 La boutique Tutto Clean", "boutique-sur": "🏪 Votre boutique", "voir-tous": "Voir tous les produits", "qr-titre": "Partagez le site avec un QR code", "qr-phrase": "Vos proches le scannent avec l'appareil photo de leur téléphone et arrivent directement sur le site.", "qr-telecharger": "Télécharger le QR code",
      "p1-t": "Prix vérifiés chaque nuit", p1: "Carrefour et Géant, produits en stock", "p2-t": "Livré chez vous", p2: "Partout en Tunisie, frais donnés avant",
      "p3-t": "Commande en 1 minute", p3: "Sur WhatsApp, sans compte",
      "rayons-titre": "Nos rayons", "rayons-sous": "Tout pour la maison et l'hygiène, rangé comme en magasin.",
      "promos-titre": "Promotions du moment", "promos-sous": "Les plus fortes remises écrites par les magasins.", "voir-tout": "Voir tout →",
      tous: "Tous les produits", marques: "Marques", "tous-magasins": "Tous les magasins", "chercher-marque": "Chercher une marque", effacer: "Effacer", valider: "Valider",
      "tri-pertinence": "Pertinence", "tri-prix": "Prix croissant", "tri-prix-desc": "Prix décroissant", "tri-unite": "Prix au litre / kilo / unité",
      "tri-remise": "Promotions d'abord", "tri-nom": "Marque A → Z",
      note: "Prix indicatifs relevés chaque nuit sur les sites des magasins (produits en stock seulement) : ce ne sont ni les prix en rayon, ni les prix de la boutique. Tutto Clean vous donne son prix et la livraison sur WhatsApp avant de confirmer.",
      "boutique-titre": "Commandez chez Tutto Clean, on vous livre",
      "boutique-phrase": "Votre commande part sur WhatsApp ; Tutto Clean vous répond avec son prix et la livraison avant de livrer.",
      itineraire: "Adresse de la boutique", adresse: "53 Av. de l'UMA, Borj Louizir (La Soukra)", itin: "Itinéraire →", "comment-titre": "Comment fonctionne ce site ?", commander: "Commander", "panier-titre": "Ma commande",
      "c-nom": "Votre nom", "c-tel": "Votre téléphone", "c-gouv": "Gouvernorat", "c-adresse": "Adresse de livraison", "c-note": "Remarque (facultatif)",
      envoyer: "Envoyer ma commande sur WhatsApp",
      "panier-note": "Rien n'est payé ici. Tutto Clean vous répond sur WhatsApp avec son prix et les frais de livraison ; vous confirmez ensuite.",
      "pied-phrase": "Les prix des produits d'entretien et d'hygiène, relevés chaque nuit chez Carrefour et Géant, et livrés chez vous par Tutto Clean. Site non officiel, sans lien avec ces enseignes.",
      "pied-commander-t": "Commander", "pied-commander": "WhatsApp : 99 453 345", "pied-appeler": "Appeler la boutique", "pied-boutique": "Adresse de la boutique",
      "pied-infos-t": "Informations", "pied-comment": "Comment fonctionne ce site ?", "pied-video": "Vidéo de présentation", "pied-confid": "Confidentialité", "pied-cond": "Conditions d'utilisation", "pied-tous": "Tous nos services",
      droits: "tous droits réservés", photos: "Photos des produits : sites des magasins, avec leur accord.",
      tout: "Tout", accueil: "Accueil", ajouter: "Ajouter", moins: "Retirer un", plus: "Ajouter un", tousRayon: "Tout le rayon",
      chez: "chez", magasins: "dans {n} magasins sur {m}", voirPlus: "Voir {n} produits de plus", chargement: "Chargement des produits…",
      aucun: "Aucun produit trouvé. Essayez un autre mot, ou demandez-le directement sur WhatsApp : Tutto Clean a aussi d'autres produits.",
      compte: "{n} produits", compteUn: "1 produit", maj: "Prix du {d} · {n} produits en stock", "pastille-maj": "Carrefour · Géant · prix mis à jour le {d}", panne: "{e} : prix du {d} (pas de réponse depuis)",
      marquesN: "Marques ({n})", promosTitre: "Promotions", rechercheTitre: "Résultats pour « {q} »",
      panierVide: "Votre panier est vide : ajoutez des produits avec le bouton « Ajouter ».",
      estim: "Total indicatif : {t} DT (+ livraison). Tutto Clean vous confirme son prix sur WhatsApp.",
      choisir: "Choisir…", errChamps: "Remplissez votre nom, votre téléphone, le gouvernorat et l'adresse.", errVide: "Votre panier est vide.",
      envoye: "Votre commande {c} est prête dans WhatsApp : touchez « Envoyer » dans WhatsApp pour la transmettre.",
      msgTitre: "🧴 Commande {c} — Prix Hygiène & Maison", msgVu: "vu à {p} DT chez {e}", msgTotal: "Total indicatif : {t} DT (hors livraison)",
      msgNom: "Nom", msgTel: "Téléphone", msgGouv: "Gouvernorat", msgAdr: "Adresse", msgNote: "Remarque",
      msgFin: "Merci de me donner votre prix et les frais de livraison.", unite: { L: "le litre", kg: "le kilo", u: "l'unité", lavage: "le lavage" },
      tuttoPrix: "Tutto Clean : {p} DT + livraison", tuttoChez: "chez Tutto Clean · + livraison", msgTutto: "prix Tutto Clean {p} DT"
    },
    ar: {
      saut: "انتقل إلى المنتجات", "haut-livraison": "التوصيل إلى كامل تونس", "haut-livraison-court": "توصيل لكامل تونس", "haut-prix": "أسعار محيّنة كل ليلة", "logo-sous": "توصيل Tutto Clean",
      chercher: "ابحث عن منتج أو علامة…", panier: "السلة", "hero-pastille": "كارفور · جيان · أسعار محيّنة كل ليلة",
      titre: "أسعار مواد التنظيف<br>والنظافة،<br><span class=\"surligne\">تصلك إلى بيتك</span>",
      phrase: "قارن، املأ سلتك: Tutto Clean يوصّل إليك في كامل تونس.",
      "hero-promos": "شاهد التخفيضات", "hero-wa": "اطلب عبر واتساب", "hero-commander": "اطلب من Tutto Clean", "hero-boutique": "🏪 محل Tutto Clean", "boutique-sur": "🏪 محلّك", "voir-tous": "عرض كل المنتجات", "qr-titre": "شارك الموقع برمز QR", "qr-phrase": "يمسحه أقاربك بكاميرا الهاتف فيصلون مباشرة إلى الموقع.", "qr-telecharger": "حمّل رمز QR",
      "p1-t": "أسعار محيّنة كل ليلة", p1: "كارفور وجيان، المنتجات المتوفرة", "p2-t": "توصيل إلى بيتك", p2: "إلى كامل تونس، الكلفة تُعطى مسبقًا",
      "p3-t": "طلب في دقيقة", p3: "عبر واتساب، دون حساب",
      "rayons-titre": "أقسامنا", "rayons-sous": "كل ما يلزم للبيت والنظافة، مرتّب كما في المغازة.",
      "promos-titre": "تخفيضات اللحظة", "promos-sous": "أكبر التخفيضات التي كتبتها المتاجر.", "voir-tout": "← عرض الكل",
      tous: "كل المنتجات", marques: "العلامات", "tous-magasins": "كل المتاجر", "chercher-marque": "ابحث عن علامة", effacer: "مسح", valider: "تأكيد",
      "tri-pertinence": "الأنسب", "tri-prix": "الأرخص أولاً", "tri-prix-desc": "الأغلى أولاً", "tri-unite": "السعر للتر / للكيلو / للوحدة",
      "tri-remise": "التخفيضات أولاً", "tri-nom": "العلامة أ ← ي",
      note: "أسعار تقريبية تُجمع كل ليلة من مواقع المتاجر (المنتجات المتوفرة فقط): ليست أسعار الرفوف ولا أسعار المحل. يعطيك Tutto Clean سعره وكلفة التوصيل عبر واتساب قبل التأكيد.",
      "boutique-titre": "اطلب من Tutto Clean، نوصّل إليك",
      "boutique-phrase": "يصل طلبك عبر واتساب؛ يرد عليك Tutto Clean بسعره وبكلفة التوصيل قبل التسليم.",
      itineraire: "عنوان المحل", adresse: "53 شارع اتحاد المغرب العربي، برج الوزير (سكرة)", itin: "← الطريق", "comment-titre": "كيف يعمل الموقع؟", commander: "اطلب", "panier-titre": "طلبي",
      "c-nom": "الاسم", "c-tel": "رقم الهاتف", "c-gouv": "الولاية", "c-adresse": "عنوان التوصيل", "c-note": "ملاحظة (اختياري)",
      envoyer: "أرسل طلبي عبر واتساب",
      "panier-note": "لا دفع هنا. يرد عليك Tutto Clean عبر واتساب بسعره وكلفة التوصيل، ثم تؤكد.",
      "pied-phrase": "أسعار مواد التنظيف والنظافة، تُجمع كل ليلة من كارفور وجيان، ويوصّلها إليك Tutto Clean. موقع غير رسمي، لا علاقة له بهذه المتاجر.",
      "pied-commander-t": "الطلب", "pied-commander": "واتساب: 99 453 345", "pied-appeler": "اتصل بالمحل", "pied-boutique": "عنوان المحل",
      "pied-infos-t": "معلومات", "pied-comment": "كيف يعمل الموقع؟", "pied-video": "الفيديو التقديمي", "pied-confid": "الخصوصية", "pied-cond": "شروط الاستعمال", "pied-tous": "كل خدماتنا",
      droits: "جميع الحقوق محفوظة", photos: "صور المنتجات: مواقع المتاجر، بموافقتها.",
      tout: "الكل", accueil: "الرئيسية", ajouter: "أضف", moins: "أنقص واحدًا", plus: "أضف واحدًا", tousRayon: "كل القسم",
      chez: "في", magasins: "في {n} متجرًا من {m}", voirPlus: "عرض {n} منتجات أخرى", chargement: "جارٍ تحميل المنتجات…",
      aucun: "لا توجد نتيجة. جرّب كلمة أخرى، أو اطلبه مباشرة عبر واتساب: لدى Tutto Clean منتجات أخرى أيضًا.",
      compte: "{n} منتجًا", compteUn: "منتج واحد", maj: "أسعار يوم {d} · {n} منتجًا متوفرًا", "pastille-maj": "كارفور · جيان · أسعار محيّنة يوم {d}", panne: "{e}: أسعار يوم {d} (لا رد منذ ذلك)",
      marquesN: "العلامات ({n})", promosTitre: "التخفيضات", rechercheTitre: "نتائج «{q}»",
      panierVide: "سلّتك فارغة: أضف منتجات بزر «أضف».",
      estim: "المجموع التقريبي: {t} د.ت (+ التوصيل). يؤكد لك Tutto Clean سعره عبر واتساب.",
      choisir: "اختر…", errChamps: "أدخل الاسم، والهاتف، والولاية، والعنوان.", errVide: "سلّتك فارغة.",
      envoye: "طلبك {c} جاهز في واتساب: اضغط «إرسال» في واتساب لإرساله.",
      msgTitre: "🧴 طلب {c} — Prix Hygiène & Maison", msgVu: "سعره {p} د.ت في {e}", msgTotal: "المجموع التقريبي: {t} د.ت (دون التوصيل)",
      msgNom: "الاسم", msgTel: "الهاتف", msgGouv: "الولاية", msgAdr: "العنوان", msgNote: "ملاحظة",
      msgFin: "أرجو أن تعطيني سعركم وكلفة التوصيل.", unite: { L: "اللتر", kg: "الكيلو", u: "الوحدة", lavage: "الغسلة" },
      tuttoPrix: "Tutto Clean: {p} د.ت + التوصيل", tuttoChez: "في Tutto Clean · + التوصيل", msgTutto: "سعر Tutto Clean {p} د.ت"
    }
  };
  var ENSEIGNES = { carrefour: { fr: "Carrefour", ar: "كارفور" }, geant: { fr: "Géant", ar: "جيان" }, tutto: { fr: "Tutto Clean", ar: "Tutto Clean" } };
  var GOUVS = [["Tunis", "تونس"], ["Ariana", "أريانة"], ["Ben Arous", "بن عروس"], ["Manouba", "منوبة"], ["Nabeul", "نابل"], ["Zaghouan", "زغوان"],
    ["Bizerte", "بنزرت"], ["Béja", "باجة"], ["Jendouba", "جندوبة"], ["Le Kef", "الكاف"], ["Siliana", "سليانة"], ["Sousse", "سوسة"],
    ["Monastir", "المنستير"], ["Mahdia", "المهدية"], ["Sfax", "صفاقس"], ["Kairouan", "القيروان"], ["Kasserine", "القصرين"], ["Sidi Bouzid", "سيدي بوزيد"],
    ["Gabès", "قابس"], ["Médenine", "مدنين"], ["Tataouine", "تطاوين"], ["Gafsa", "قفصة"], ["Tozeur", "توزر"], ["Kébili", "قبلي"]];

  // Rayons (ordre d'un supermarché) : id, nom FR, nom AR, fond, couleur, icône
  var FAMILLES = [
    ["linge", "Lessive & linge", "الغسيل", "#E8EEFF", "#2350E6", "M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 4h12M8 5h.01M11 5h.01M12 10a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"],
    ["vaisselle", "Vaisselle", "الأواني", "#E4F7EE", "#13834F", "M9 3h6v3l1.5 2.5V20a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V8.5L9 6V3Zm-1 9h8"],
    ["maison", "Nettoyants ménagers", "منظفات البيت", "#FFF1E3", "#C2590A", "M12 3v10M7 13h10l1 8H6l1-8ZM9 17v4m3-4v4m3-4v4"],
    ["javel", "Javel & WC", "الجافال والمراحيض", "#EFE9FF", "#6A3FB5", "M9 2h4v3h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2V2Zm-2 9h10"],
    ["papier", "Papier & mouchoirs", "الورق والمناديل", "#EEF1F6", "#3E4A62", "M7 4h10a3 3 0 0 1 0 6H7a3 3 0 0 1 0-6Zm0 0a3 3 0 0 0 0 6v10h10V10"],
    ["accessoires", "Éponges & accessoires", "إسفنج ولوازم", "#EAF6DC", "#4E7A16", "M4 8h16v8H4zM4 12h16M7 8v8m5-8v8m5-8v8"],
    ["desodorisant", "Désodorisants", "معطرات الجو", "#FFE8EF", "#B23A5E", "M9 8h6v12a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V8Zm1-4h4v4h-4zM17 4l2-1m-2 4h2.5M17 10l2 1"],
    ["corps", "Douche & savon", "الاستحمام والصابون", "#E1F4F8", "#127287", "M5 9h14v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V9Zm3-4a1.5 1.5 0 1 0 0 .1M13 4a1 1 0 1 0 0 .1M16 6a1 1 0 1 0 0 .1"],
    ["cheveux", "Cheveux", "الشعر", "#F6EEE2", "#86602C", "M9 7h6v13a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V7Zm1-4h4v4h-4zm5 1h3"],
    ["bouche", "Soins dentaires", "العناية بالأسنان", "#E5F1FF", "#1D6FB8", "M7 4c2 0 3 1 5 1s3-1 5-1c2.5 0 3.5 2.5 3 5-.6 3-1.6 4-2.2 7.5-.4 2.5-2.8 2.5-3.2.5L14 14h-4l-.6 3c-.4 2-2.8 2-3.2-.5C5.6 13 4.6 12 4 9c-.5-2.5.5-5 3-5Z"],
    ["soins", "Déodorants & rasage", "مزيل العرق والحلاقة", "#ECEAFF", "#4B44A8", "M8 9h8v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9Zm1-6h6v6H9z"],
    ["feminine", "Hygiène féminine", "النظافة النسائية", "#FCE7F5", "#A53A8C", "M12 3c3 3 6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 3-7 6-10Z"],
    ["bebe", "Bébé", "الرضيع", "#FFEFE2", "#B5562A", "M12 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-6 9h12l-1.5 7h-9L6 13Zm3 3h6"]
  ];
  var SOUS = {
    capsules: ["Capsules & doses", "كبسولات وجرعات"], assouplissant: ["Assouplissants", "منعّمات"], liquide: ["Lessive liquide", "غسيل سائل"],
    poudre: ["Lessive en poudre", "غسيل مسحوق"], detachant: ["Détachants", "مزيلات البقع"], main: ["Liquide vaisselle", "سائل الأواني"],
    "lave-vaisselle": ["Lave-vaisselle", "غسالة الأواني"], "multi-usages": ["Multi-usages", "متعدد الاستعمالات"], sols: ["Sols", "الأرضيات"],
    "vitres-meubles": ["Vitres & meubles", "البلور والأثاث"], "cuisine-salle-de-bain": ["Cuisine & salle de bain", "المطبخ والحمّام"],
    desinfectants: ["Désinfectants", "المطهرات"], insecticides: ["Insecticides", "المبيدات"], "savon-menage": ["Savon de ménage", "صابون المنزل"],
    javel: ["Eau de javel", "الجافال"], wc: ["WC", "المراحيض"], deboucheurs: ["Déboucheurs & détartrants", "مسرّحات ومزيلات الكلس"],
    aerosols: ["Aérosols", "بخاخات"], diffuseurs: ["Diffuseurs & recharges", "معطرات وعبوات"], absorbeurs: ["Absorbeurs d'humidité", "ماصّات الرطوبة"],
    eponges: ["Éponges", "إسفنج"], gants: ["Gants", "قفازات"], serpilleres: ["Serpillères & lavettes", "خرق ومناشف"], balais: ["Balais & seaux", "مكانس ودلاء"],
    sacs: ["Sacs poubelle", "أكياس القمامة"], cuisine: ["Film & aluminium", "ورق الألمنيوم والتغليف"], toilette: ["Papier toilette", "ورق صحي"],
    "essuie-tout": ["Essuie-tout", "مناشف ورقية"], mouchoirs: ["Mouchoirs", "مناديل"], couches: ["Couches", "حفاظات"], lingettes: ["Lingettes", "مناديل مبللة"],
    "toilette-bebe": ["Toilette bébé", "نظافة الرضيع"], serviettes: ["Serviettes", "فوط صحية"], "protege-slips": ["Protège-slips", "فوط يومية"],
    tampons: ["Tampons", "سدادات"], intime: ["Toilette intime", "النظافة الحميمة"], "gel-douche": ["Gel douche", "جل الاستحمام"],
    "savon-liquide": ["Savon liquide", "صابون سائل"], savon: ["Savon solide", "صابون"], shampooing: ["Shampooings", "شامبو"],
    "apres-shampooing": ["Après-shampooings", "بلسم"], "masques-soins": ["Masques & soins", "أقنعة وعناية"], coiffants: ["Coiffants", "مثبتات الشعر"],
    dentifrice: ["Dentifrices", "معجون الأسنان"], brosses: ["Brosses à dents", "فرش الأسنان"], "bain-de-bouche": ["Bain de bouche & fil", "غسول وخيط"],
    deodorants: ["Déodorants", "مزيلات العرق"], rasoirs: ["Rasoirs & lames", "شفرات الحلاقة"], rasage: ["Mousse & gel à raser", "رغوة وجل الحلاقة"],
    coton: ["Coton", "قطن"], autres: ["Autres", "أخرى"]
  };
  var ICONE_SANS = "M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 6h6m-6 4h6";
  var API_TUTTO = (document.querySelector('meta[name="hm-api"]') || {}).content || "https://api-hygiene.clicvia.com";

  /* ------------------------------------------------------------ état */
  var langue = "fr", accueil = null, produits = null, chargeTout = null, tutto = {}, propres = [];
  var toutVoir = false;   // accueil : la liste complète seulement sur demande (« Voir tous les produits »)
  var filtreFam = "", sous = "", texte = "", tri = "pertinence", magasin = "", marquesChoisies = {}, voirPromos = false, montres = PAR_PAGE;
  var panier = lirePanier();
  var $ = function (id) { return document.getElementById(id); };

  function t(cle, vals) {
    var s = (T[langue][cle] != null ? T[langue][cle] : T.fr[cle]);
    if (typeof s !== "string") return s;
    return s.replace(/\{(\w+)\}/g, function (_, k) { return vals && vals[k] != null ? vals[k] : ""; });
  }
  function dt(v) {
    if (v == null || isNaN(v)) return "";
    var s = Number(v).toFixed(3).split(".");
    return s[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ") + "," + s[1];
  }
  function iso(s) { s = /^\d+$/.test(s) ? s.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : s; return langue === "ar" ? "⁦" + s + "⁩" : s; }   // « 6 321 » (règle § 30)
  function dateCourte(d) { if (!d) return ""; var p = d.split("-"); return p[2] + "/" + p[1] + "/" + p[0]; }
  function nomEnseigne(e) { return (ENSEIGNES[e] || {})[langue] || (ENSEIGNES[e] || {}).fr || e; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function svg(d, taille) { return '<svg viewBox="0 0 24 24" width="' + (taille || 24) + '" height="' + (taille || 24) + '" aria-hidden="true"><path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
  function famille(id) { for (var i = 0; i < FAMILLES.length; i++) if (FAMILLES[i][0] === id) return FAMILLES[i]; return null; }
  function nomFam(f) { return f ? (langue === "ar" ? f[2] : f[1]) : ""; }
  function nomSous(s) { var x = SOUS[s] || [s, s]; return langue === "ar" ? x[1] : x[0]; }
  function remise(p) { return p.r && p.r > p.p ? (p.r - p.p) / p.r : 0; }
  function accueilVisible() { return !filtreFam && !texte && !voirPromos; }

  /* ------------------------------------------------------------ langue */
  function appliquerLangue() {
    var html = document.documentElement;
    html.lang = langue; html.dir = langue === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-t]").forEach(function (el) { var v = t(el.getAttribute("data-t")); if (typeof v === "string") el.textContent = v; });
    document.querySelectorAll("[data-t-html]").forEach(function (el) { el.innerHTML = t(el.getAttribute("data-t-html")); });
    document.querySelectorAll("[data-t-ph]").forEach(function (el) { el.placeholder = t(el.getAttribute("data-t-ph")); });
    var b = $("btn-langue");
    b.textContent = langue === "ar" ? "Français" : "العربية";
    b.lang = langue === "ar" ? "fr" : "ar";
    var qr = "assets/qr/hygiene-" + langue;   // QR de la langue de la page (version arabe = adresse ?lang=ar)
    $("qr-image").src = qr + ".svg"; $("qr-telecharger").href = qr + ".png";
    remplirGouvs(); afficherComment(); afficherFamilles(); afficherAccueil(); afficherMaj(); afficher(); afficherPanier();
  }
  function changerLangue() {
    if (document.documentElement.getAttribute("data-langue-fixe")) {   // une adresse par langue : on ouvre l'autre page
      try { localStorage.setItem(CLE_LANGUE, langue === "ar" ? "fr" : "ar"); } catch (e) { /* sans gravité */ }
      (window.allerVers || function (a) { location.href = a; })(langue === "ar" ? "/" : "/ar/");
      return;
    }
    langue = langue === "ar" ? "fr" : "ar";
    try { localStorage.setItem(CLE_LANGUE, langue); } catch (e) { /* stockage refusé : sans gravité */ }
    var u = new URL(location.href);
    if (langue === "ar") u.searchParams.set("lang", "ar"); else u.searchParams.delete("lang");
    history.replaceState(null, "", u.pathname + u.search + u.hash);
    appliquerLangue();
  }

  /* ------------------------------------------------------------ données */
  function charger(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(url + " " + r.status); return r.json(); });
  }
  function toutCharger() {             // grosse liste : au 1er geste du visiteur seulement (règle § 60)
    if (!chargeTout) {
      chargeTout = charger("data/produits.json").then(function (d) { produits = d.produits || []; preparer(produits); afficher(); return produits; })
        .catch(function () { chargeTout = null; });
    }
    return chargeTout;
  }
  function preparer(liste) {
    liste.forEach(function (p) { if (!p._cle) p._cle = window.sonRecherche ? sonRecherche.cle([p.m, p.n, p.q].join(" ")) : (" " + [p.m, p.n].join(" ").toLowerCase() + " "); });
  }
  // « scroll » écouté SANS capture : seul le défilement de la PAGE compte (le carrousel des promotions qui s'aligne seul au chargement
  // n'est pas un geste du visiteur : avec la capture, il chargeait toute la liste d'office — trouvé par l'essai, 20/11/2026)
  var GESTES = ["pointerdown", "keydown", "touchstart", "focusin"];
  function surPremierGeste() {
    GESTES.forEach(function (g) { window.removeEventListener(g, surPremierGeste, true); });
    window.removeEventListener("scroll", surPremierGeste);
    toutCharger();
  }

  /* ------------------------------------------------------------ en-tête, rayons, accueil */
  function afficherMaj() {
    var el = $("maj"); if (!accueil) return;
    var e = accueil.enseignes || {}, pannes = [];
    Object.keys(e).forEach(function (k) {
      if (e[k].erreur && e[k].derniere_reussite && e[k].derniere_reussite !== accueil.date) pannes.push(t("panne", { e: nomEnseigne(k), d: iso(dateCourte(e[k].derniere_reussite)) }));
    });
    el.textContent = t("maj", { d: iso(dateCourte(accueil.date)), n: iso(String(accueil.total || 0)) }) + (pannes.length ? " · " + pannes.join(" · ") : "");
    // 21/11/2026 (Ahmed) : la date du dernier relevé se voit DÈS l'ouverture, dans la pastille du bandeau
    var pastille = document.querySelector('[data-t="hero-pastille"]');
    if (pastille && accueil.date) pastille.textContent = t("pastille-maj", { d: iso(dateCourte(accueil.date)) });
  }
  function afficherFamilles() {
    var nav = $("familles"), nb = (accueil && accueil.familles) || {};
    var total = 0; Object.keys(nb).forEach(function (k) { total += nb[k]; });
    var h = '<button type="button" class="famille" data-f="" aria-pressed="' + (filtreFam === "" && !voirPromos) + '"><span class="ico">' +
      svg("M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z") + '</span><b>' + esc(t("tout")) + '</b><small>' + (total ? iso(String(total)) : "") + '</small></button>';
    var nbTutto = propres.length + Object.keys(tutto).length;
    h += '<button type="button" class="famille famille-tutto" data-f="__tutto" aria-pressed="' + (filtreFam === "__tutto") + '" style="--fa:#FFE7A3;--fc:#8A5A00"><span class="ico">' +
      svg("M3 9l1.5-5h15L21 9M3 9h18M3 9v11h18V9M8 20v-6h8v6") + "</span><b>Tutto Clean</b><small>" + (nbTutto ? iso(String(nbTutto)) : "") + "</small></button>";
    FAMILLES.forEach(function (f) {
      if (accueil && !nb[f[0]]) return;               // rayon sans produit en stock : pas de bouton vide
      h += '<button type="button" class="famille" data-f="' + f[0] + '" aria-pressed="' + (filtreFam === f[0]) + '" style="--fa:' + f[3] + ';--fc:' + f[4] + '"><span class="ico">' +
        svg(f[5]) + '</span><b>' + esc(nomFam(f)) + '</b><small>' + (nb[f[0]] ? iso(String(nb[f[0]])) : "") + '</small></button>';
    });
    nav.innerHTML = h;
  }
  function afficherAccueil() {
    $("vue-accueil").hidden = !accueilVisible();
    if (!accueil) return;
    var ray = accueil.rayons || {};
    $("rayons-grille").closest("section").hidden = !Object.keys(ray).length;   // anciennes données sans rayons : partie cachée, jamais vide
    // photos du bandeau QUI BOUGENT (règle commune « des photos qui bougent », 16/10/2026) : une photo par rayon + celles des promotions,
    // deux rangées qui défilent en sens contraire (PC : 4 visibles ; téléphone : une rangée, 2 visibles) ; chaque rangée est doublée
    // (copie aria-hidden) pour une boucle sans trou ; pause sous la souris ou au toucher ; immobile si « réduire les animations ».
    var photos = FAMILLES.map(function (f) { return ray[f[0]] && ray[f[0]].i; }).concat((accueil.promos || []).map(function (p) { return p.i; }))
      .filter(function (x, n, l) { return x && l.indexOf(x) === n; }).slice(0, 16);
    var moitie = Math.ceil(photos.length / 2), r1 = photos.slice(0, moitie), r2 = photos.slice(moitie).concat(photos.slice(0, Math.max(0, moitie - (photos.length - moitie))));
    function rangee(liste, classe) {
      var tuile = function (i, copie) { return '<div class="tuile"' + (copie ? ' aria-hidden="true"' : "") + '><img src="' + esc(i) + '" alt="" width="200" height="200" decoding="async"' + (copie ? ' loading="lazy"' : "") + "></div>"; };
      return '<div class="rangee ' + classe + '">' + liste.map(function (i) { return tuile(i, false); }).join("") + liste.map(function (i) { return tuile(i, true); }).join("") + "</div>";
    }
    $("hero-photos").innerHTML = photos.length ? rangee(r1, "r1") + rangee(r2, "r2") : "";
    $("rayons-grille").innerHTML = FAMILLES.filter(function (f) { return ray[f[0]]; }).map(function (f) {
      var r = ray[f[0]];
      return '<button type="button" class="rayon-tuile" data-f="' + f[0] + '" style="--fa:' + f[3] + ';--fc:' + f[4] + '"><span class="img">' +
        (r.i ? '<img src="' + esc(r.i) + '" alt="" loading="lazy" width="160" height="160">' : svg(f[5], 48)) + '</span><b>' + esc(nomFam(f)) + "</b><small>" +
        esc(t("compte", { n: iso(String(r.n)) })) + "</small></button>";
    }).join("");
    var promos = accueil.promos || [];
    $("promos").hidden = !promos.length;
    preparer(promos);
    $("defile-promos").innerHTML = promos.map(carte).join("");
  }

  /* ------------------------------------------------------------ liste */
  function base() { return propres.concat(produits || (accueil && accueil.produits) || []); }
  function passe(p, sauf) {
    if (filtreFam === "__tutto") { if (!tutto[p.id] && p.e !== "tutto") return false; }
    else if (filtreFam && p.f !== filtreFam) return false;
    if (sauf !== "sous" && sous && (p.s || "autres") !== sous) return false;
    if (voirPromos && remise(p) < 0.02) return false;
    if (magasin && !(p.e === magasin || (magasin === "tutto" && tutto[p.id]))) return false;
    if (sauf !== "marque" && Object.keys(marquesChoisies).length && !marquesChoisies[p.m || "—"]) return false;
    if (texte && !(window.sonRecherche ? sonRecherche.trouve(p._cle, texte) : p._cle.indexOf(texte.toLowerCase()) >= 0)) return false;
    return true;
  }
  function liste() {
    var b = base();
    if (!produits) preparer(b);
    var r = b.filter(function (p) { return passe(p); });
    var cmp = {
      pertinence: function (a, b) { return (b.i ? 1 : 0) - (a.i ? 1 : 0) || (tutto[b.id] ? 1 : 0) - (tutto[a.id] ? 1 : 0) || (remise(b) >= 0.02) - (remise(a) >= 0.02) || a.p - b.p; },
      prix: function (a, b) { return a.p - b.p; },
      "prix-desc": function (a, b) { return b.p - a.p; },
      unite: function (a, b) { return (a.pu ? a.pu[0] : 1e9) - (b.pu ? b.pu[0] : 1e9) || a.p - b.p; },   // sans prix à l'unité : à la fin
      remise: function (a, b) { return remise(b) - remise(a) || a.p - b.p; },
      nom: function (a, b) { return (a.m || "~").localeCompare(b.m || "~", "fr") || a.p - b.p; }
    }[tri];
    if (texte) {                                     // nom exact d'abord (règle § 27.7)
      var tt = texte.toLowerCase();
      return r.sort(function (a, b) { var ea = (a.m || "").toLowerCase() === tt ? 0 : 1, eb = (b.m || "").toLowerCase() === tt ? 0 : 1; return ea - eb || cmp(a, b); });
    }
    return r.sort(cmp);
  }

  // produit sans photo chez le magasin (169 produits Géant le 21/11/2026) : vignette aux couleurs du rayon, dessin + marque en grand
  function sansPhoto(p) {
    var f = famille(p.f) || [0, 0, 0, "#EEF2FF", "#2350E6", ICONE_SANS];
    return '<span class="sans" style="--fa:' + f[3] + ';--fc:' + f[4] + '">' + svg(f[5], 56) + (p.m ? "<b>" + esc(p.m) + "</b>" : "") + "</span>";
  }
  function carte(p) {
    var q = panier[p.id] ? panier[p.id].q : 0, rem = remise(p);
    var photo = p.i ? '<img src="' + esc(p.i) + '" alt="' + esc((p.m ? p.m + " " : "") + p.n) + '" loading="lazy" decoding="async" width="240" height="240">'
      : sansPhoto(p);
    var unite = p.pu ? '<span class="unite">' + dt(p.pu[0]) + " DT / " + esc((t("unite") || {})[p.pu[1]] || p.pu[1]) + '</span>' : "";
    var ou = '<span class="enseigne enseigne-' + esc(p.e) + '">' + esc(nomEnseigne(p.e)) + "</span>" +
      (p.nb && p.nb[1] > 1 ? esc(t("magasins", { n: iso(String(p.nb[0])), m: iso(String(p.nb[1])) })) : "");
    var tc = tutto[p.id], ligneTutto = tc ? '<span class="tutto">' + esc(t("tuttoPrix", { p: dt(tc.p) })) + "</span>" : "";
    if (p.e === "tutto") ou = '<span class="enseigne enseigne-tutto">Tutto Clean</span>' + esc(t("tuttoChez").replace(/^.*·\s*/, ""));
    var ajout = q ? '<div class="qtes"><button type="button" data-moins="' + esc(p.id) + '" aria-label="' + esc(t("moins")) + '">−</button><span>' + q + '</span><button type="button" data-plus="' + esc(p.id) + '" aria-label="' + esc(t("plus")) + '">+</button></div>'
      : '<button type="button" class="btn-ajout" data-plus="' + esc(p.id) + '">' + svg("M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2", 17) + esc(t("ajouter")) + '</button>';
    return '<article class="carte' + (rem >= 0.02 ? " en-promo" : "") + '" data-id="' + esc(p.id) + '">' + (rem >= 0.02 ? '<span class="badge-promo">−' + Math.round(rem * 100) + " %</span>" : "") +
      '<div class="photo">' + photo + '</div><div class="corps">' + (p.m ? '<span class="marque">' + esc(p.m) + "</span>" : "") +
      '<span class="nom" title="' + esc(p.n) + '">' + esc(p.n) + "</span>" + (p.q ? '<span class="qte">' + esc(p.q) + "</span>" : "") +
      '<div class="prix-l"><span class="prix">' + dt(p.p) + " <small>DT</small></span>" + (rem >= 0.02 ? '<span class="barre">' + dt(p.r) + " DT</span>" : "") + "</div>" +
      unite + '<span class="ou">' + ou + "</span>" + ligneTutto + '<div class="ajout">' + ajout + "</div></div></article>";
  }

  function afficherFil() {
    var fil = $("fil"), fam = famille(filtreFam);
    if (accueilVisible()) { fil.hidden = true; return; }
    fil.hidden = false;
    fil.innerHTML = '<button type="button" data-aller="accueil">' + esc(t("accueil")) + "</button> › " +
      (fam ? (sous ? '<button type="button" data-aller="rayon">' + esc(nomFam(fam)) + "</button> › " + esc(nomSous(sous)) : esc(nomFam(fam)))
        : filtreFam === "__tutto" ? "Tutto Clean" : voirPromos ? esc(t("promosTitre")) : esc(t("rechercheTitre", { q: texte })));
  }
  function afficherSous() {
    var el = $("sous-rayons"), ray = accueil && accueil.rayons && accueil.rayons[filtreFam];
    if (!famille(filtreFam) || !ray || !ray.s) { el.hidden = true; el.innerHTML = ""; return; }
    var cles = Object.keys(ray.s).sort(function (a, b) { return (a === "autres") - (b === "autres") || ray.s[b] - ray.s[a]; });
    el.hidden = cles.length < 2;
    el.innerHTML = '<button type="button" class="puce" data-s="" aria-pressed="' + (sous === "") + '">' + esc(t("tousRayon")) + "<small>" + iso(String(ray.n)) + "</small></button>" +
      cles.map(function (s) { return '<button type="button" class="puce" data-s="' + esc(s) + '" aria-pressed="' + (sous === s) + '">' + esc(nomSous(s)) + "<small>" + iso(String(ray.s[s])) + "</small></button>"; }).join("");
  }
  function afficherMarques() {
    var n = Object.keys(marquesChoisies).length;
    $("txt-marques").textContent = n ? t("marquesN", { n: n }) : t("marques");
    if ($("panneau-marques").hidden) return;
    var compte = {};
    base().forEach(function (p) { if (passe(p, "marque")) compte[p.m || "—"] = (compte[p.m || "—"] || 0) + 1; });
    var cherche = ($("q-marque").value || "").trim().toLowerCase();
    var noms = Object.keys(compte).filter(function (m) { return !cherche || m.toLowerCase().indexOf(cherche) >= 0; })
      .sort(function (a, b) { return compte[b] - compte[a] || a.localeCompare(b); });
    $("liste-marques").innerHTML = noms.map(function (m) {
      return '<label title="' + esc(m) + '"><input type="checkbox" value="' + esc(m) + '"' + (marquesChoisies[m] ? " checked" : "") + "><span>" + esc(m) + "</span><small>" + iso(String(compte[m])) + "</small></label>";
    }).join("");
  }

  function afficher() {
    var g = $("grille"); if (!g) return;
    afficherAccueil(); afficherFil(); afficherSous(); afficherMarques();
    $("produits").hidden = accueilVisible() && !toutVoir;
    if (accueil) $("voir-tous-nb").textContent = "(" + iso(String(accueil.total || 0)) + ")";
    var fam = famille(filtreFam);
    $("liste-titre").textContent = filtreFam === "__tutto" ? "Tutto Clean" : fam ? (sous ? nomSous(sous) : nomFam(fam)) : voirPromos ? t("promosTitre") : texte ? t("rechercheTitre", { q: texte }) : t("tous");
    if (!accueil && !produits) { g.innerHTML = '<p class="chargement">' + esc(t("chargement")) + "</p>"; return; }
    var filtre = !accueilVisible() || magasin || Object.keys(marquesChoisies).length;
    if (!produits && filtre) toutCharger();          // un filtre a besoin de toute la liste
    var r = liste();
    var cpt = produits ? r.length : (accueil.total || r.length);
    $("compte").textContent = filtre && !produits ? t("chargement") : (cpt === 1 ? t("compteUn") : t("compte", { n: iso(String(cpt)) }));
    if (!r.length) { g.innerHTML = produits ? '<p class="vide">' + esc(t("aucun")) + "</p>" : '<p class="chargement">' + esc(t("chargement")) + "</p>"; $("btn-plus").hidden = true; return; }
    g.innerHTML = r.slice(0, montres).map(carte).join("");
    var reste = (produits ? r.length : (accueil.total || r.length)) - Math.min(montres, r.length);
    var b = $("btn-plus"); b.hidden = reste <= 0; b.textContent = t("voirPlus", { n: iso(String(Math.min(reste, PAR_PAGE))) });
  }
  function allerA(fam, s) {
    filtreFam = fam; sous = s || ""; voirPromos = false; montres = PAR_PAGE; marquesChoisies = {}; toutVoir = false;
    afficherFamilles(); afficher();
    var cible = accueilVisible() ? document.body : $("produits");
    cible.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ------------------------------------------------------------ panier */
  function lirePanier() { try { return JSON.parse(localStorage.getItem(CLE_PANIER)) || {}; } catch (e) { return {}; } }
  function garderPanier() { try { localStorage.setItem(CLE_PANIER, JSON.stringify(panier)); } catch (e) { /* téléphone sans stockage : le panier vit le temps de la page */ } }
  function trouver(id) {
    var l = propres.concat(produits || [], (accueil && accueil.produits) || [], (accueil && accueil.promos) || []);
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return null;
  }
  function changer(id, d) {
    var p = trouver(id), ligne = panier[id];
    if (!ligne && p) ligne = panier[id] = { q: 0, n: p.n, m: p.m || "", qt: p.q || "", p: p.p, e: p.e, i: p.i || "" };
    if (!ligne) return;
    ligne.tp = tutto[id] ? tutto[id].p : (ligne.e === "tutto" ? ligne.p : null);   // prix Tutto Clean du moment
    ligne.q = Math.max(0, Math.min(99, ligne.q + d));
    if (!ligne.q) delete panier[id];
    garderPanier(); afficherPanier();
    if (p) document.querySelectorAll('.carte[data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]').forEach(function (c) { c.outerHTML = carte(p); });
  }
  function nbArticles() { var n = 0; Object.keys(panier).forEach(function (k) { n += panier[k].q; }); return n; }
  function afficherPanier() {
    var n = nbArticles(), total = 0;
    Object.keys(panier).forEach(function (id) { total += (panier[id].tp || panier[id].p || 0) * panier[id].q; });
    $("panier-nb").textContent = n; $("panier-nb").hidden = !n; $("bp-nb").textContent = n;
    $("panier-total").textContent = n ? dt(total) + " DT" : "";
    $("barre-panier").hidden = !n; document.body.classList.toggle("a-panier", !!n);
    var ul = $("panier-liste"), ids = Object.keys(panier);
    if (!ids.length) { ul.innerHTML = '<li class="vide">' + esc(t("panierVide")) + "</li>"; $("panier-estim").hidden = true; return; }
    ul.innerHTML = ids.map(function (id) {
      var l = panier[id];
      return '<li>' + (l.i ? '<img src="' + esc(l.i) + '" alt="">' : "") + '<span class="pl-nom">' + esc((l.m ? l.m + " " : "") + l.n) +
        "<small>" + esc(l.qt) + (l.tp ? " · " + esc(t("tuttoPrix", { p: dt(l.tp) })) : l.p ? " · " + dt(l.p) + " DT " + esc(t("chez")) + " " + esc(nomEnseigne(l.e)) : "") + "</small></span>" +
        '<span class="qtes"><button type="button" data-moins="' + esc(id) + '" aria-label="' + esc(t("moins")) + '">−</button><span>' + l.q +
        '</span><button type="button" data-plus="' + esc(id) + '" aria-label="' + esc(t("plus")) + '">+</button></span></li>';
    }).join("");
    $("panier-estim").hidden = false;
    $("panier-estim").textContent = t("estim", { t: dt(total) });
  }
  function remplirGouvs() {
    var s = $("c-gouv"), v = s.value;
    s.innerHTML = '<option value="">' + esc(t("choisir")) + "</option>" + GOUVS.map(function (g) { return '<option value="' + esc(g[0]) + '">' + esc(langue === "ar" ? g[1] : g[0]) + "</option>"; }).join("");
    s.value = v;
  }
  function numeroCommande() {
    var d = new Date(), p = function (x) { return String(x).padStart(2, "0"); };
    var a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", r = "";
    var alea = new Uint8Array(4); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(alea) : alea.forEach(function (_, i) { alea[i] = Math.random() * 256; });
    for (var i = 0; i < 4; i++) r += a[alea[i] % a.length];
    return "HM-" + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + "-" + r;
  }
  function messageCommande(c, f) {
    var lignes = [t("msgTitre", { c: c }), ""], total = 0, i = 0;
    Object.keys(panier).forEach(function (id) {
      var l = panier[id]; i++; total += (l.tp || l.p || 0) * l.q;
      lignes.push(i + ". " + l.q + " × " + (l.m ? l.m + " " : "") + l.n + (l.qt && l.n.indexOf(l.qt) < 0 ? " (" + l.qt + ")" : "") +
        (l.tp ? " — " + t("msgTutto", { p: dt(l.tp) }) : l.p ? " — " + t("msgVu", { p: dt(l.p), e: nomEnseigne(l.e) }) : ""));
    });
    lignes.push("", t("msgTotal", { t: dt(total) }), "",
      t("msgNom") + " : " + f.nom, t("msgTel") + " : " + f.tel, t("msgGouv") + " : " + f.gouv, t("msgAdr") + " : " + f.adresse);
    if (f.note) lignes.push(t("msgNote") + " : " + f.note);
    lignes.push("", t("msgFin"));
    return lignes.join("\n");
  }
  function envoyer() {
    var form = $("form-commande"), err = $("erreur-commande");
    if (form._gotcha && form._gotcha.value) return;   // piège anti-robots rempli : rien n'est envoyé ni noté
    var f = { nom: form.nom.value.trim(), tel: form.tel.value.trim(), gouv: form.gouv.value, adresse: form.adresse.value.trim(), note: form.note.value.trim() };
    err.style.color = "";
    if (!nbArticles()) { err.textContent = t("errVide"); err.hidden = false; return; }
    if (!f.nom || !f.tel || !f.gouv || !f.adresse) { err.textContent = t("errChamps"); err.hidden = false; return; }
    err.hidden = true;
    var c = numeroCommande();
    try { localStorage.setItem("hm_client", JSON.stringify({ nom: f.nom, tel: f.tel, gouv: f.gouv, adresse: f.adresse })); } catch (e) { /* facultatif */ }
    if (window.goatcounter && goatcounter.count) { try { goatcounter.count({ path: "commande-envoyee", title: "Commande envoyée", event: true }); } catch (e) { /* compteur absent */ } }
    noterCommande(c, f.gouv);
    window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(messageCommande(c, f)), "_blank", "noopener");
    err.textContent = t("envoye", { c: c }); err.hidden = false; err.style.color = "var(--wa)";
  }
  // Copie de la commande dans le carnet (21/11/2026, Ahmed : « je veux juste pouvoir voir les commandes si je veux ») : numéro,
  // gouvernorat, produits, prix — JAMAIS le nom, le téléphone ni l'adresse. En silence : une panne n'empêche jamais la commande WhatsApp.
  function noterCommande(c, gouv) {
    var l = Object.keys(panier).map(function (id) { var x = panier[id]; return { n: x.n, m: x.m, qt: x.qt, q: x.q, p: x.tp || x.p, e: x.e, tc: !!x.tp }; });
    try {
      fetch(API_TUTTO + "/commande", { method: "POST", keepalive: true, headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ c: c, g: gouv, l: l, lang: langue }) }).catch(function () { /* carnet injoignable : sans gravité */ });
    } catch (e) { /* navigateur trop ancien : sans gravité */ }
  }
  // Bouton rond « Partager » (règle commune § 8) : menu de partage du téléphone, sinon WhatsApp ; clic compté dans GoatCounter.
  // Il partage un LIEN : la page vidéo de présentation (PAGE_VIDEO, dès qu'elle existe) + l'adresse du site.
  var PAGE_VIDEO = "https://hygiene.clicvia.com/video/";   // vidéo de présentation (21/11/2026)
  function partager() {
    var site = "https://hygiene.clicvia.com/" + (langue === "ar" ? "ar/" : ""), lien = PAGE_VIDEO || site;
    var texte = (langue === "ar" ? "أسعار مواد التنظيف والنظافة، تصلك إلى بيتك — Tutto Clean\nالموقع: " : "Les prix de l'entretien et de l'hygiène, livrés chez vous — Tutto Clean\nLe site : ") + site;
    if (window.goatcounter && goatcounter.count) { try { goatcounter.count({ path: "partage/accueil", title: "Partage", event: true }); } catch (e) { /* compteur absent */ } }
    function whatsapp() { window.open("https://wa.me/?text=" + encodeURIComponent(PAGE_VIDEO ? texte + "\n" + PAGE_VIDEO : texte), "_blank", "noopener"); }
    if (navigator.share) navigator.share({ title: "Prix Hygiène & Maison", text: texte, url: lien }).catch(function (e) { if (!e || e.name !== "AbortError") whatsapp(); });
    else whatsapp();
  }
  function ouvrirPanier() {
    var d = $("panier");
    try { var cl = JSON.parse(localStorage.getItem("hm_client") || "null"); if (cl) { var f = $("form-commande"); ["nom", "tel", "gouv", "adresse"].forEach(function (k) { if (!f[k].value) f[k].value = cl[k] || ""; }); } } catch (e) { /* rien */ }
    $("erreur-commande").hidden = true; $("erreur-commande").style.color = "";
    if (d.showModal) d.showModal(); else d.setAttribute("open", "");
  }

  /* ------------------------------------------------------------ « Comment fonctionne ce site ? » (règle § 44) */
  function afficherComment() {
    var fr = [
      "<b>Les prix</b> : chaque nuit, un robot lit les boutiques en ligne de Carrefour (chaque magasin, un par un) et de Géant. Seuls les produits EN STOCK ont un prix ; chez Carrefour, le prix affiché est celui de la plupart des magasins, avec le nombre de magasins qui l'ont.",
      "<b>Les rayons</b> : comme en magasin, 13 rayons et leurs sous-rayons (lessive liquide, en poudre, capsules…). Le rayon d'un produit est lu dans son NOM ; un produit douteux n'est pas affiché plutôt que mal rangé.",
      "<b>Filtres</b> : marques (plusieurs à la fois), magasin, et tri par prix, par prix à l'unité ou par promotion.",
      "<b>Prix au litre, au kilo ou à l'unité</b> : calculé seulement quand la contenance est écrite (3 L, 2,5 kg, 24 rouleaux, 44 couches, 54 lavages) ; rien n'est deviné.",
      "<b>Promotion</b> : la remise en rouge (−20 %) vient du prix barré écrit par le magasin.",
      "<b>Recherche</b> : par produit ou par marque, même avec une autre écriture (Omo, Ariel, Dixan…).",
      "<b>Tutto Clean</b> : la boutique qui livre tape elle-même ses prix (sans la livraison) dans son espace privé ; ils s'affichent tout de suite à côté de ceux des grandes surfaces, avec le bouton « Tutto Clean » pour voir tous ses produits. Le panier prend le prix Tutto Clean quand il existe.",
      "<b>Vidéo de présentation</b> : une vidéo verticale (format Reel) montre le site ; le bouton « Partager » envoie sa page, qu'on peut aussi télécharger pour la publier sur Instagram ou Facebook.",
      "<b>QR code</b> : sur l'accueil, un QR code de l'adresse du site (et un bouton pour le télécharger, à envoyer ou à imprimer) : on le scanne avec l'appareil photo du téléphone. Le bouton rond « Partager » en haut envoie aussi le lien du site.",
      "<b>Commander</b> : le bouton « Ajouter » met le produit dans votre panier (gardé dans votre téléphone). « Commander » prépare un message WhatsApp avec un numéro de commande, vos produits et votre adresse : vous l'envoyez vous-même. Tutto Clean vous répond avec SON prix et les frais de livraison (toute la Tunisie) ; rien n'est payé sur le site.",
      "<b>Panne d'un magasin</b> : si un site de magasin ne répond pas, ses derniers prix restent affichés avec leur date.",
      "<b>Vos données</b> : aucun compte, aucun cookie ; votre nom, votre téléphone et votre adresse restent dans votre téléphone et ne partent que dans le message WhatsApp que vous envoyez. Pour le suivi de la boutique, le site garde seulement le numéro de commande, le gouvernorat et les produits (400 jours). Visites comptées sans cookie (GoatCounter)."
    ];
    var ar = [
      "<b>الأسعار</b>: كل ليلة يقرأ برنامج آلي المتاجر الإلكترونية لكارفور (كل متجر على حدة) وجيان. لا سعر إلا للمنتجات المتوفرة؛ في كارفور السعر المعروض هو سعر أغلب المتاجر مع عدد المتاجر التي يتوفر فيها.",
      "<b>الأقسام</b>: كما في المغازة، 13 قسمًا وأقسامها الفرعية. قسم المنتج يُقرأ من اسمه؛ المنتج المشكوك فيه لا يُعرض بدل أن يوضع في غير مكانه.",
      "<b>التصفية</b>: العلامات (عدة علامات معًا)، المتجر، والترتيب حسب السعر أو سعر الوحدة أو التخفيض.",
      "<b>السعر للتر أو للكيلو أو للوحدة</b>: يُحسب فقط إذا كانت الكمية مكتوبة (3 لتر، 2,5 كغ، 24 لفة، 44 حفاظة، 54 غسلة)؛ لا شيء يُخمَّن.",
      "<b>التخفيض</b>: النسبة الحمراء تأتي من السعر المشطوب الذي كتبه المتجر.",
      "<b>البحث</b>: بالمنتج أو بالعلامة، حتى بكتابة مختلفة.",
      "<b>Tutto Clean</b>: المحل الذي يوصّل يكتب أسعاره بنفسه (دون التوصيل) في فضائه الخاص؛ تظهر فورًا بجانب أسعار المساحات الكبرى، مع زر «Tutto Clean» لرؤية كل منتجاته. السلة تأخذ سعر Tutto Clean إن وُجد.",
      "<b>الفيديو التقديمي</b>: فيديو عمودي (بصيغة Reel) يعرض الموقع؛ زر «شارك» يرسل صفحته، ويمكن تحميله لنشره على إنستغرام أو فيسبوك.",
      "<b>رمز QR</b>: في الصفحة الرئيسية رمز QR لعنوان الموقع (وزر لتحميله وإرساله أو طباعته): يُمسح بكاميرا الهاتف. والزر الدائري «شارك» في الأعلى يرسل رابط الموقع أيضًا.",
      "<b>الطلب</b>: زر «أضف» يضع المنتج في سلتك (محفوظة في هاتفك). «اطلب» يحضّر رسالة واتساب برقم الطلب ومنتجاتك وعنوانك: ترسلها بنفسك. يرد عليك Tutto Clean بسعره هو وبكلفة التوصيل (كامل تونس)؛ لا دفع في الموقع.",
      "<b>عطل في متجر</b>: إذا لم يرد موقع متجر، تبقى آخر أسعاره معروضة مع تاريخها.",
      "<b>معطياتك</b>: لا حساب ولا ملفات تعريف ارتباط؛ اسمك وهاتفك وعنوانك تبقى في هاتفك ولا تخرج إلا في رسالة واتساب التي ترسلها. لمتابعة المحل، يحتفظ الموقع فقط برقم الطلب والولاية والمنتجات (400 يوم). الزيارات تُعدّ دون ملفات تعريف (GoatCounter)."
    ];
    $("comment-corps").innerHTML = (langue === "ar" ? ar : fr).map(function (p) { return "<p>" + p + "</p>"; }).join("");
  }

  /* ------------------------------------------------------------ démarrage */
  function brancher() {
    $("btn-langue").addEventListener("click", changerLangue);
    $("familles").addEventListener("click", function (ev) {
      var b = ev.target.closest(".famille"); if (!b) return;
      if (b.getAttribute("data-f") === "__tutto" && !(propres.length + Object.keys(tutto).length)) {   // pas encore de prix Tutto Clean : la boutique
        filtreFam = ""; texte = ""; $("q").value = ""; afficherFamilles(); afficher(); $("boutique").scrollIntoView({ behavior: "smooth" }); return;
      }
      if (b.getAttribute("data-f") === "") { texte = ""; $("q").value = ""; }
      allerA(b.getAttribute("data-f"));
    });
    $("rayons-grille").addEventListener("click", function (ev) { var b = ev.target.closest(".rayon-tuile"); if (b) allerA(b.getAttribute("data-f")); });
    $("sous-rayons").addEventListener("click", function (ev) {
      var b = ev.target.closest(".puce"); if (!b) return;
      sous = b.getAttribute("data-s"); montres = PAR_PAGE; afficher();
    });
    $("fil").addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-aller]"); if (!b) return;
      if (b.getAttribute("data-aller") === "accueil") { texte = ""; $("q").value = ""; allerA(""); } else allerA(filtreFam);
    });
    $("voir-tous").addEventListener("click", function () { toutVoir = true; montres = PAR_PAGE; afficher(); $("produits").scrollIntoView({ behavior: "smooth" }); });
    $("voir-promos").addEventListener("click", function () { filtreFam = ""; sous = ""; voirPromos = true; tri = "remise"; $("tri").value = "remise"; montres = PAR_PAGE; afficherFamilles(); afficher(); $("produits").scrollIntoView({ behavior: "smooth" }); });
    var minuteur;
    $("q").addEventListener("input", function () {
      clearTimeout(minuteur);
      minuteur = setTimeout(function () { texte = $("q").value.trim(); voirPromos = false; montres = PAR_PAGE; afficher(); }, 150);
    });
    $("q").addEventListener("keydown", function (ev) { if (ev.key === "Enter") { $("q").blur(); $("produits").scrollIntoView({ behavior: "smooth" }); } });
    $("tri").addEventListener("change", function () { tri = $("tri").value; afficher(); });
    $("magasin").addEventListener("change", function () { magasin = $("magasin").value; montres = PAR_PAGE; afficher(); });
    $("btn-marques").addEventListener("click", function () {
      var p = $("panneau-marques"); p.hidden = !p.hidden; $("btn-marques").setAttribute("aria-expanded", String(!p.hidden));
      if (!p.hidden && !produits) toutCharger().then(afficherMarques);
      afficherMarques();
    });
    $("q-marque").addEventListener("input", afficherMarques);
    $("liste-marques").addEventListener("change", function (ev) {
      var c = ev.target; if (c.type !== "checkbox") return;
      if (c.checked) marquesChoisies[c.value] = 1; else delete marquesChoisies[c.value];
      montres = PAR_PAGE; afficher();
    });
    $("marques-effacer").addEventListener("click", function () { marquesChoisies = {}; montres = PAR_PAGE; afficher(); });
    $("marques-ok").addEventListener("click", function () { $("panneau-marques").hidden = true; $("btn-marques").setAttribute("aria-expanded", "false"); afficher(); });
    $("btn-plus").addEventListener("click", function () {
      montres += PAR_PAGE;
      if (!produits) toutCharger().then(afficher); else afficher();
    });
    document.addEventListener("click", function (ev) {
      var p = ev.target.closest("[data-plus]"), m = ev.target.closest("[data-moins]");
      if (p) changer(p.getAttribute("data-plus"), +1);
      else if (m) changer(m.getAttribute("data-moins"), -1);
    });
    $("btn-panier").addEventListener("click", ouvrirPanier);
    $("btn-partager").addEventListener("click", partager);
    $("btn-commander").addEventListener("click", ouvrirPanier);
    $("btn-envoyer").addEventListener("click", envoyer);
    // photo du magasin absente : dessin du rayon à la place (pas de « onerror= » : la CSP l'interdit)
    document.addEventListener("error", function (ev) {
      var img = ev.target; if (!img || img.tagName !== "IMG") return;
      if (img.closest(".photo")) {
        var c = img.closest(".carte"), p = c && trouver(c.getAttribute("data-id"));
        img.outerHTML = p ? sansPhoto(p) : '<span class="sans">' + svg(ICONE_SANS, 56) + "</span>";
      } else if (img.closest(".hero-photos")) img.parentNode.remove();
      else if (img.closest(".rayon-tuile")) { var f = famille(img.closest(".rayon-tuile").getAttribute("data-f")); img.outerHTML = svg((f || [0, 0, 0, 0, 0, ICONE_SANS])[5], 48); }
    }, true);
    GESTES.forEach(function (g) { window.addEventListener(g, surPremierGeste, { capture: true, passive: true }); });
    window.addEventListener("scroll", surPremierGeste, { passive: true });
    // photos qui bougent : pause au toucher (la souris : CSS :hover)
    $("hero-photos").addEventListener("touchstart", function () { $("hero-photos").classList.add("pause"); }, { passive: true });
    $("hero-photos").addEventListener("touchend", function () { setTimeout(function () { $("hero-photos").classList.remove("pause"); }, 1500); }, { passive: true });
  }

  function demarrer() {
    var u = new URLSearchParams(location.search), fixe = document.documentElement.getAttribute("data-langue-fixe");
    if (fixe === "fr" && u.get("lang") === "ar") { location.replace("/ar/" + location.hash); return; }   // ancien lien ?lang=ar
    langue = fixe === "ar" ? "ar" : fixe === "fr" ? "fr" : (u.get("lang") === "ar" ? "ar" : "fr");
    brancher();
    appliquerLangue();
    fetch(API_TUTTO + "/prix", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : { produits: [] }; }).then(function (d) {
      tutto = {}; propres = [];
      (d.produits || []).forEach(function (p) {
        if (p.s === false || !p.p) return;                                   // « en stock » décoché : rien sur le site
        if (p.id.indexOf("tc:") === 0) propres.push({ id: p.id, e: "tutto", n: p.n, m: p.m, f: p.f, q: p.q, p: p.p, i: p.i ? API_TUTTO + "/photo/" + encodeURIComponent(p.id) : "" });
        else tutto[p.id] = p;
      });
      preparer(propres);
      Object.keys(panier).forEach(function (id) { panier[id].tp = tutto[id] ? tutto[id].p : (panier[id].e === "tutto" ? panier[id].p : null); });
      garderPanier(); afficherFamilles(); afficher(); afficherPanier();
    }).catch(function () { /* carnet Tutto Clean injoignable : le site marche avec les prix des magasins */ });
    charger("data/accueil.json").then(function (d) { accueil = d; preparer(d.produits || []); afficherFamilles(); afficherMaj(); afficher(); })
      .catch(function () { $("grille").innerHTML = '<p class="vide">' + esc(t("aucun")) + "</p>"; });
    if ("serviceWorker" in navigator && location.protocol === "https:") {
      try { navigator.serviceWorker.register("/sw.js", { scope: "/" }); } catch (e) { /* sans service worker, le site marche quand même */ }
    }
    if (window.top !== window.self) { try { window.top.location = window.self.location; } catch (e) { document.body.innerHTML = ""; } }   // anti-iframe
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer); else demarrer();
  window.HM = { dt: dt, messageCommande: messageCommande, numeroCommande: numeroCommande, liste: liste };   // pour les tests
})();
