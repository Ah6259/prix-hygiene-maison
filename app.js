/* Prix Hygiène & Maison — page d'accueil (20/11/2026).
   Données : data/accueil.json (léger, chargé tout de suite) puis data/produits.json au 1er geste du visiteur (règle § 60).
   Commande : panier gardé dans le téléphone, message WhatsApp vers la boutique (numéro de commande HM-AAMMJJ-XXXX).
   Aucun script dans la page (CSP), aucun cookie. */
(function () {
  "use strict";
  var WHATSAPP = "21699453345";
  var PAR_PAGE = 24;
  var CLE_PANIER = "hm_panier_v1";
  var CLE_LANGUE = "hm_langue";

  /* ------------------------------------------------------------ langues */
  var T = {
    fr: {
      saut: "Aller aux produits", titre: "Les prix de l'entretien et de l'hygiène, livrés chez vous",
      phrase: "Comparez les grandes surfaces, commandez sur WhatsApp, livraison partout en Tunisie.",
      chercher: "Chercher : lessive, Omo, javel, couches…", "maj-attente": "Prix relevés chaque nuit en grande surface",
      "boutique-titre": "Commandez chez Tutto Clean, on vous livre",
      "boutique-phrase": "Votre commande part sur WhatsApp ; la boutique vous répond avec son prix et la livraison avant de livrer.",
      itineraire: "Adresse de la boutique", tous: "Tous les produits", trier: "Trier",
      "tri-prix": "Prix le plus bas", "tri-unite": "Prix au litre / au kilo / à l'unité", "tri-remise": "En promotion d'abord", "tri-nom": "Marque A → Z",
      note: "Prix indicatifs relevés chaque nuit sur les sites des magasins (produits en stock seulement) : ce ne sont ni les prix en rayon, ni les prix de la boutique. Le prix de la boutique et la livraison vous sont donnés sur WhatsApp avant de confirmer.",
      "comment-titre": "Comment fonctionne ce site ?", commander: "Commander", "panier-titre": "Ma commande",
      "c-nom": "Votre nom", "c-tel": "Votre téléphone", "c-gouv": "Gouvernorat", "c-adresse": "Adresse de livraison", "c-note": "Remarque (facultatif)",
      envoyer: "Envoyer ma commande sur WhatsApp",
      "panier-note": "Rien n'est payé ici. La boutique vous répond sur WhatsApp avec son prix et les frais de livraison ; vous confirmez ensuite.",
      "pied-phrase": "prix relevés chaque nuit chez Carrefour et Géant. Site non officiel, sans lien avec ces enseignes.",
      "pied-commander": "Commander : 99 453 345", "pied-boutique": "Adresse de la boutique", "pied-comment": "Comment fonctionne ce site ?",
      "pied-confid": "Confidentialité", "pied-cond": "Conditions d'utilisation", "pied-tous": "Tous nos services",
      droits: "tous droits réservés", photos: "Photos des produits : sites des magasins, avec leur accord.",
      tout: "Tout", ajouter: "Ajouter", moins: "Retirer un", plus: "Ajouter un", promo: "Promo",
      chez: "chez", magasins: "dans {n} magasins sur {m}", voirPlus: "Voir {n} produits de plus", chargement: "Chargement des produits…",
      aucun: "Aucun produit trouvé. Essayez un autre mot, ou demandez-le directement sur WhatsApp : la boutique a aussi d'autres produits.",
      compte: "{n} produits", compteUn: "1 produit", maj: "Prix du {d} · {n} produits en stock chez {e}", panne: "{e} : prix du {d} (pas de réponse depuis)",
      panierVide: "Votre panier est vide : ajoutez des produits avec le bouton « Ajouter ».",
      estim: "Total indicatif en grande surface : {t} DT. Le prix de la boutique et la livraison vous sont donnés sur WhatsApp.",
      choisir: "Choisir…", errChamps: "Remplissez votre nom, votre téléphone, le gouvernorat et l'adresse.", errVide: "Votre panier est vide.",
      envoye: "Votre commande {c} est prête dans WhatsApp : touchez « Envoyer » dans WhatsApp pour la transmettre.",
      msgTitre: "🧴 Commande {c} — Prix Hygiène & Maison", msgVu: "vu à {p} DT chez {e}", msgTotal: "Total indicatif en grande surface : {t} DT",
      msgNom: "Nom", msgTel: "Téléphone", msgGouv: "Gouvernorat", msgAdr: "Adresse", msgNote: "Remarque",
      msgFin: "Merci de me donner votre prix et les frais de livraison.", unite: { L: "le litre", kg: "le kilo", u: "l'unité", lavage: "le lavage" },
      sansPrix: "prix à demander",
      tuttoPrix: "Tutto Clean : {p} DT + livraison", tuttoChez: "chez Tutto Clean · + livraison",
      msgTutto: "prix Tutto Clean {p} DT"
    },
    ar: {
      saut: "انتقل إلى المنتجات", titre: "أسعار مواد التنظيف والنظافة، تصلك إلى بيتك",
      phrase: "قارن أسعار المساحات الكبرى، واطلب عبر واتساب، والتوصيل إلى كامل تونس.",
      chercher: "ابحث: غسيل، أومو، جافال، حفاظات…", "maj-attente": "أسعار تُجمع كل ليلة من المساحات الكبرى",
      "boutique-titre": "اطلب من Tutto Clean، نوصّل إليك",
      "boutique-phrase": "يصل طلبك عبر واتساب؛ يرد عليك المحل بسعره وبكلفة التوصيل قبل التسليم.",
      itineraire: "عنوان المحل", tous: "كل المنتجات", trier: "ترتيب",
      "tri-prix": "الأرخص أولاً", "tri-unite": "السعر للتر / للكيلو / للوحدة", "tri-remise": "التخفيضات أولاً", "tri-nom": "العلامة أ ← ي",
      note: "أسعار تقريبية تُجمع كل ليلة من مواقع المتاجر (المنتجات المتوفرة فقط): ليست أسعار الرفوف ولا أسعار المحل. يعطيك المحل سعره وكلفة التوصيل عبر واتساب قبل التأكيد.",
      "comment-titre": "كيف يعمل الموقع؟", commander: "اطلب", "panier-titre": "طلبي",
      "c-nom": "الاسم", "c-tel": "رقم الهاتف", "c-gouv": "الولاية", "c-adresse": "عنوان التوصيل", "c-note": "ملاحظة (اختياري)",
      envoyer: "أرسل طلبي عبر واتساب",
      "panier-note": "لا دفع هنا. يرد عليك المحل عبر واتساب بسعره وكلفة التوصيل، ثم تؤكد.",
      "pied-phrase": "أسعار تُجمع كل ليلة من كارفور وجيان. موقع غير رسمي، لا علاقة له بهذه المتاجر.",
      "pied-commander": "للطلب: 99 453 345", "pied-boutique": "عنوان المحل", "pied-comment": "كيف يعمل الموقع؟",
      "pied-confid": "الخصوصية", "pied-cond": "شروط الاستعمال", "pied-tous": "كل خدماتنا",
      droits: "جميع الحقوق محفوظة", photos: "صور المنتجات: مواقع المتاجر، بموافقتها.",
      tout: "الكل", ajouter: "أضف", moins: "أنقص واحدًا", plus: "أضف واحدًا", promo: "تخفيض",
      chez: "في", magasins: "في {n} متجرًا من {m}", voirPlus: "عرض {n} منتجات أخرى", chargement: "جارٍ تحميل المنتجات…",
      aucun: "لا توجد نتيجة. جرّب كلمة أخرى، أو اطلبه مباشرة عبر واتساب: للمحل منتجات أخرى أيضًا.",
      compte: "{n} منتجًا", compteUn: "منتج واحد", maj: "أسعار يوم {d} · {n} منتجًا متوفرًا في {e}", panne: "{e}: أسعار يوم {d} (لا رد منذ ذلك)",
      panierVide: "سلّتك فارغة: أضف منتجات بزر «أضف».",
      estim: "المجموع التقريبي في المساحات الكبرى: {t} د.ت. يعطيك المحل سعره وكلفة التوصيل عبر واتساب.",
      choisir: "اختر…", errChamps: "أدخل الاسم، والهاتف، والولاية، والعنوان.", errVide: "سلّتك فارغة.",
      envoye: "طلبك {c} جاهز في واتساب: اضغط «إرسال» في واتساب لإرساله.",
      msgTitre: "🧴 طلب {c} — Prix Hygiène & Maison", msgVu: "سعره {p} د.ت في {e}", msgTotal: "المجموع التقريبي في المساحات الكبرى: {t} د.ت",
      msgNom: "الاسم", msgTel: "الهاتف", msgGouv: "الولاية", msgAdr: "العنوان", msgNote: "ملاحظة",
      msgFin: "أرجو أن تعطيني سعركم وكلفة التوصيل.", unite: { L: "اللتر", kg: "الكيلو", u: "الوحدة", lavage: "الغسلة" },
      sansPrix: "السعر عند الطلب",
      tuttoPrix: "Tutto Clean: {p} د.ت + التوصيل", tuttoChez: "في Tutto Clean · + التوصيل",
      msgTutto: "سعر Tutto Clean {p} د.ت"
    }
  };
  var ENSEIGNES = { carrefour: { fr: "Carrefour", ar: "كارفور" }, geant: { fr: "Géant", ar: "جيان" }, tutto: { fr: "Tutto Clean", ar: "Tutto Clean" } };
  // Prix de la boutique Tutto Clean (carnet Cloudflare, tapés par la boutique dans son espace privé) ; adresse lue dans la page (les tests la changent)
  var API_TUTTO = (document.querySelector('meta[name="hm-api"]') || {}).content || "https://api-hygiene.clicvia.com";
  var tutto = {}, propres = [];
  var GOUVS = [["Tunis", "تونس"], ["Ariana", "أريانة"], ["Ben Arous", "بن عروس"], ["Manouba", "منوبة"], ["Nabeul", "نابل"], ["Zaghouan", "زغوان"],
    ["Bizerte", "بنزرت"], ["Béja", "باجة"], ["Jendouba", "جندوبة"], ["Le Kef", "الكاف"], ["Siliana", "سليانة"], ["Sousse", "سوسة"],
    ["Monastir", "المنستير"], ["Mahdia", "المهدية"], ["Sfax", "صفاقس"], ["Kairouan", "القيروان"], ["Kasserine", "القصرين"], ["Sidi Bouzid", "سيدي بوزيد"],
    ["Gabès", "قابس"], ["Médenine", "مدنين"], ["Tataouine", "تطاوين"], ["Gafsa", "قفصة"], ["Tozeur", "توزر"], ["Kébili", "قبلي"]];

  // Familles (ordre d'affichage) : nom FR, nom AR, couleurs, icône (tracé SVG 24×24)
  var FAMILLES = [
    ["linge", "Lessive & linge", "الغسيل", "#E7F0FF", "#2F5FB3", "M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 4h12M8 5h.01M11 5h.01M12 10a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"],
    ["vaisselle", "Vaisselle", "الأواني", "#E3F6EF", "#1B7F5A", "M9 3h6v3l1.5 2.5V20a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V8.5L9 6V3Zm-1 9h8"],
    ["maison", "Sols & surfaces", "الأرضيات والأسطح", "#FFF2DD", "#A4610E", "M12 3v10M7 13h10l1 8H6l1-8ZM9 17v4m3-4v4m3-4v4"],
    ["javel", "Javel & WC", "الجافال والمراحيض", "#F1E9FF", "#6A3FB5", "M9 2h4v3h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2V2Zm-2 9h10"],
    ["desodorisant", "Désodorisants", "معطرات الجو", "#FFE9EF", "#B23A5E", "M9 8h6v12a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V8Zm1-4h4v4h-4zM17 4l2-1m-2 4h2.5M17 10l2 1"],
    ["accessoires", "Éponges & sacs", "إسفنج وأكياس", "#E9F4D9", "#4E7A16", "M4 8h16v8H4zM4 12h16M7 8v8m5-8v8m5-8v8"],
    ["papier", "Papier & mouchoirs", "الورق والمناديل", "#EEF1F5", "#47556B", "M7 4h10a3 3 0 0 1 0 6H7a3 3 0 0 1 0-6Zm0 0a3 3 0 0 0 0 6v10h10V10"],
    ["bebe", "Bébé", "الرضيع", "#FFF0E3", "#B5562A", "M12 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-6 9h12l-1.5 7h-9L6 13Zm3 3h6"],
    ["feminine", "Hygiène féminine", "النظافة النسائية", "#FCE8F6", "#A53A8C", "M12 3c3 3 6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 3-7 6-10Z"],
    ["corps", "Savon & douche", "الصابون والاستحمام", "#E2F5F8", "#16798C", "M5 9h14v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V9Zm3-4a1.5 1.5 0 1 0 0 .1M13 4a1 1 0 1 0 0 .1M16 6a1 1 0 1 0 0 .1"],
    ["cheveux", "Cheveux", "الشعر", "#F4EEE4", "#7C5A2C", "M9 7h6v13a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V7Zm1-4h4v4h-4zm5 1h3"],
    ["bouche", "Dents", "الأسنان", "#E6F3FF", "#1D6FB8", "M7 4c2 0 3 1 5 1s3-1 5-1c2.5 0 3.5 2.5 3 5-.6 3-1.6 4-2.2 7.5-.4 2.5-2.8 2.5-3.2.5L14 14h-4l-.6 3c-.4 2-2.8 2-3.2-.5C5.6 13 4.6 12 4 9c-.5-2.5.5-5 3-5Z"],
    ["soins", "Déodorant & rasage", "مزيل العرق والحلاقة", "#EDEBFF", "#4B44A8", "M8 9h8v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9Zm1-6h6v6H9z"]
  ];
  var ICONE_SANS = "M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 6h6m-6 4h6";

  /* ------------------------------------------------------------ état */
  var langue = "fr", accueil = null, produits = null, chargeTout = null;
  var filtreFam = "", texte = "", tri = "prix", montres = PAR_PAGE;
  var panier = lirePanier();
  var $ = function (id) { return document.getElementById(id); };

  function t(cle, vals) {
    var s = (T[langue][cle] != null ? T[langue][cle] : T.fr[cle]);
    if (typeof s !== "string") return s;
    return s.replace(/\{(\w+)\}/g, function (_, k) { return vals && vals[k] != null ? vals[k] : ""; });
  }
  function dt(v) {                       // 3.5 -> « 3,500 » ; espace fine insécable pour les milliers (règle § 30)
    if (v == null || isNaN(v)) return "";
    var s = Number(v).toFixed(3).split(".");
    return s[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ") + "," + s[1];
  }
  function iso(s) { return langue === "ar" ? "⁦" + s + "⁩" : s; }
  function dateCourte(d) { if (!d) return ""; var p = d.split("-"); return p[2] + "/" + p[1] + "/" + p[0]; }
  function nomEnseigne(e) { return (ENSEIGNES[e] || {})[langue] || (ENSEIGNES[e] || {}).fr || e; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function svg(d, taille) { return '<svg viewBox="0 0 24 24" width="' + (taille || 24) + '" height="' + (taille || 24) + '" aria-hidden="true"><path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }

  /* ------------------------------------------------------------ langue */
  function appliquerLangue() {
    var html = document.documentElement;
    html.lang = langue; html.dir = langue === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-t]").forEach(function (el) { var v = t(el.getAttribute("data-t")); if (typeof v === "string") el.textContent = v; });
    document.querySelectorAll("[data-t-ph]").forEach(function (el) { el.placeholder = t(el.getAttribute("data-t-ph")); });
    var b = $("btn-langue");
    b.textContent = langue === "ar" ? "Français" : "العربية";
    b.lang = langue === "ar" ? "fr" : "ar";
    remplirGouvs();
    afficherComment();
    afficherFamilles();
    afficherMaj();
    afficher();
    afficherPanier();
  }
  function changerLangue() {
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
  var GESTES = ["pointerdown", "keydown", "touchstart", "scroll", "focusin"];
  function surPremierGeste() { GESTES.forEach(function (g) { window.removeEventListener(g, surPremierGeste, true); }); toutCharger(); }

  /* ------------------------------------------------------------ affichage */
  function afficherMaj() {
    var el = $("maj"); if (!accueil) return;
    var e = accueil.enseignes || {}, noms = [], pannes = [];
    Object.keys(e).forEach(function (k) {
      if (e[k].offres) noms.push(nomEnseigne(k));
      if (e[k].erreur && e[k].derniere_reussite && e[k].derniere_reussite !== accueil.date) pannes.push(t("panne", { e: nomEnseigne(k), d: iso(dateCourte(e[k].derniere_reussite)) }));
    });
    el.textContent = t("maj", { d: iso(dateCourte(accueil.date)), n: iso(String(accueil.total || 0)), e: noms.join(langue === "ar" ? " و" : " et ") }) + (pannes.length ? " · " + pannes.join(" · ") : "");
  }
  function afficherFamilles() {
    var nav = $("familles"), nb = (accueil && accueil.familles) || {};
    var total = 0; Object.keys(nb).forEach(function (k) { total += nb[k]; });
    var h = '<button type="button" class="famille" data-f="" aria-pressed="' + (filtreFam === "") + '" style="--fa:var(--c-clair);--fc:var(--c-fonce)"><span class="ico">' +
      svg("M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z") + '</span><b>' + esc(t("tout")) + '</b><small>' + (total ? iso(String(total)) : "") + '</small></button>';
    var nbTutto = propres.length + Object.keys(tutto).length;
    if (nbTutto) h += '<button type="button" class="famille famille-tutto" data-f="__tutto" aria-pressed="' + (filtreFam === "__tutto") + '" style="--fa:#FFF1D6;--fc:#9A5B00"><span class="ico">' +
      svg("M3 9l1.5-5h15L21 9M3 9h18M3 9v11h18V9M8 20v-6h8v6") + "</span><b>Tutto Clean</b><small>" + iso(String(nbTutto)) + "</small></button>";
    FAMILLES.forEach(function (f) {
      if (accueil && !nb[f[0]]) return;               // famille sans produit en stock : pas de bouton vide
      h += '<button type="button" class="famille" data-f="' + f[0] + '" aria-pressed="' + (filtreFam === f[0]) + '" style="--fa:' + f[3] + ';--fc:' + f[4] + '"><span class="ico">' +
        svg(f[5]) + '</span><b>' + esc(langue === "ar" ? f[2] : f[1]) + '</b><small>' + (nb[f[0]] ? iso(String(nb[f[0]])) : "") + '</small></button>';
    });
    nav.innerHTML = h;
  }
  function famille(id) { for (var i = 0; i < FAMILLES.length; i++) if (FAMILLES[i][0] === id) return FAMILLES[i]; return null; }

  function liste() {
    var base = propres.concat(produits || (accueil && accueil.produits) || []);
    if (!produits) preparer(base);
    var r = base.filter(function (p) {
      if (filtreFam === "__tutto") { if (!tutto[p.id] && p.e !== "tutto") return false; }
      else if (filtreFam && p.f !== filtreFam) return false;
      if (texte && !(window.sonRecherche ? sonRecherche.trouve(p._cle, texte) : p._cle.indexOf(texte.toLowerCase()) >= 0)) return false;
      return true;
    });
    var cmp = {
      prix: function (a, b) { return a.p - b.p; },
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
  function remise(p) { return p.r && p.r > p.p ? (p.r - p.p) / p.r : 0; }

  function carte(p) {
    var q = panier[p.id] ? panier[p.id].q : 0, rem = remise(p);
    var photo = p.i ? '<img src="' + esc(p.i) + '" alt="' + esc((p.m ? p.m + " " : "") + p.n) + '" loading="lazy" decoding="async" width="240" height="240">'
      : '<span class="sans">' + svg((famille(p.f) || [0, 0, 0, 0, 0, ICONE_SANS])[5], 96) + '</span>';
    var unite = p.pu ? '<span class="unite">' + dt(p.pu[0]) + " DT / " + esc((t("unite") || {})[p.pu[1]] || p.pu[1]) + '</span>' : "";
    var ou = t("chez") + " <b>" + esc(nomEnseigne(p.e)) + "</b>" + (p.nb && p.nb[1] > 1 ? " · " + esc(t("magasins", { n: iso(String(p.nb[0])), m: iso(String(p.nb[1])) })) : "");
    var tc = tutto[p.id], ligneTutto = tc ? '<span class="tutto">' + esc(t("tuttoPrix", { p: dt(tc.p) })) + "</span>" : "";
    if (p.e === "tutto") ou = esc(t("tuttoChez"));
    var ajout = q ? '<div class="qtes"><button type="button" data-moins="' + esc(p.id) + '" aria-label="' + esc(t("moins")) + '">−</button><span>' + q + '</span><button type="button" data-plus="' + esc(p.id) + '" aria-label="' + esc(t("plus")) + '">+</button></div>'
      : '<button type="button" class="btn-ajout" data-plus="' + esc(p.id) + '">+ ' + esc(t("ajouter")) + '</button>';
    return '<article class="carte" data-id="' + esc(p.id) + '">' + (rem >= 0.02 ? '<span class="badge-promo">−' + Math.round(rem * 100) + " %</span>" : "") +
      '<div class="photo">' + photo + '</div><div class="corps">' + (p.m ? '<span class="marque">' + esc(p.m) + "</span>" : "") +
      '<span class="nom" title="' + esc(p.n) + '">' + esc(p.n) + "</span>" + (p.q ? '<span class="qte">' + esc(p.q) + "</span>" : "") +
      '<div class="prix-l"><span class="prix">' + dt(p.p) + " <small>DT</small></span>" + (rem >= 0.02 ? '<span class="barre">' + dt(p.r) + " DT</span>" : "") + "</div>" +
      unite + '<span class="ou">' + ou + "</span>" + ligneTutto + '<div class="ajout">' + ajout + "</div></div></article>";
  }

  function afficher() {
    var g = $("grille"); if (!g) return;
    var fam = famille(filtreFam);
    $("liste-titre").textContent = filtreFam === "__tutto" ? "Tutto Clean" : fam ? (langue === "ar" ? fam[2] : fam[1]) : t("tous");
    if (!accueil && !produits) { g.innerHTML = '<p class="chargement">' + esc(t("chargement")) + "</p>"; return; }
    var r = liste();
    if (filtreFam === "__tutto" && !produits) toutCharger();
    var vrai = produits ? r.length : null;
    if (!produits && (filtreFam || texte)) toutCharger();          // un filtre a besoin de toute la liste
    var cpt = produits ? r.length : (accueil.total || r.length);
    $("compte").textContent = (filtreFam || texte) && !produits ? t("chargement") : (cpt === 1 ? t("compteUn") : t("compte", { n: iso(String(cpt)) }));
    if (!r.length) { g.innerHTML = produits ? '<p class="vide">' + esc(t("aucun")) + "</p>" : '<p class="chargement">' + esc(t("chargement")) + "</p>"; $("btn-plus").hidden = true; return; }
    g.innerHTML = r.slice(0, montres).map(carte).join("");
    var reste = (vrai != null ? vrai : (accueil.total || r.length)) - Math.min(montres, r.length);
    var b = $("btn-plus"); b.hidden = reste <= 0; b.textContent = t("voirPlus", { n: iso(String(Math.min(reste, PAR_PAGE))) });
  }

  /* ------------------------------------------------------------ panier */
  function lirePanier() { try { return JSON.parse(localStorage.getItem(CLE_PANIER)) || {}; } catch (e) { return {}; } }
  function garderPanier() { try { localStorage.setItem(CLE_PANIER, JSON.stringify(panier)); } catch (e) { /* téléphone sans stockage : le panier vit le temps de la page */ } }
  function trouver(id) {
    var l = propres.concat(produits || [], (accueil && accueil.produits) || []);
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return null;
  }
  function changer(id, d) {
    var p = trouver(id), ligne = panier[id];
    if (!ligne && p) ligne = panier[id] = { q: 0, n: p.n, m: p.m || "", qt: p.q || "", p: p.p, e: p.e, i: p.i || "" };
    if (ligne) ligne.tp = tutto[id] ? tutto[id].p : (ligne.e === "tutto" ? ligne.p : null);   // prix Tutto Clean du moment
    if (!ligne) return;
    ligne.q = Math.max(0, Math.min(99, ligne.q + d));
    if (!ligne.q) delete panier[id];
    garderPanier(); afficherPanier();
    var c = document.querySelector('.carte[data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]');
    if (c && p) c.outerHTML = carte(p);
  }
  function nbArticles() { var n = 0; Object.keys(panier).forEach(function (k) { n += panier[k].q; }); return n; }
  function afficherPanier() {
    var n = nbArticles();
    $("panier-nb").textContent = n; $("panier-nb").hidden = !n; $("bp-nb").textContent = n;
    $("barre-panier").hidden = !n; document.body.classList.toggle("a-panier", !!n);
    var ul = $("panier-liste"), ids = Object.keys(panier);
    if (!ids.length) { ul.innerHTML = '<li class="vide">' + esc(t("panierVide")) + "</li>"; $("panier-estim").hidden = true; return; }
    var total = 0;
    ul.innerHTML = ids.map(function (id) {
      var l = panier[id]; total += (l.tp || l.p || 0) * l.q;
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
    var f = { nom: form.nom.value.trim(), tel: form.tel.value.trim(), gouv: form.gouv.value, adresse: form.adresse.value.trim(), note: form.note.value.trim() };
    if (!nbArticles()) { err.textContent = t("errVide"); err.hidden = false; return; }
    if (!f.nom || !f.tel || !f.gouv || !f.adresse) { err.textContent = t("errChamps"); err.hidden = false; return; }
    err.hidden = true;
    var c = numeroCommande();
    try { localStorage.setItem("hm_client", JSON.stringify({ nom: f.nom, tel: f.tel, gouv: f.gouv, adresse: f.adresse })); } catch (e) { /* facultatif */ }
    if (window.goatcounter && goatcounter.count) { try { goatcounter.count({ path: "commande-envoyee", title: "Commande envoyée", event: true }); } catch (e) { /* compteur absent */ } }
    window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(messageCommande(c, f)), "_blank", "noopener");
    err.textContent = t("envoye", { c: c }); err.hidden = false; err.style.color = "var(--vert)";
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
      "<b>Les familles</b> : la famille d'un produit (lessive, vaisselle, papier, bébé…) est lue dans son NOM ; un produit douteux n'est pas affiché plutôt que mal rangé.",
      "<b>Prix au litre, au kilo ou à l'unité</b> : calculé seulement quand la contenance est écrite dans le nom (3 L, 2,5 kg, 24 rouleaux, 44 couches, 54 lavages) ; rien n'est deviné.",
      "<b>Promotion</b> : la remise en rouge (−20 %) vient du prix barré écrit par le magasin.",
      "<b>Recherche</b> : par produit ou par marque, même avec une autre écriture (Omo, Ariel, Dixan…).",
      "<b>Commander</b> : le bouton « Ajouter » met le produit dans votre panier (gardé dans votre téléphone). « Commander » prépare un message WhatsApp avec un numéro de commande, vos produits et votre adresse : vous l'envoyez vous-même. La boutique vous répond avec SON prix et les frais de livraison (toute la Tunisie) ; rien n'est payé sur le site.",
      "<b>Tutto Clean</b> : la boutique qui livre tape elle-même ses prix (sans la livraison) dans son espace privé ; ils s'affichent tout de suite à côté de ceux des grandes surfaces, avec le bouton « Tutto Clean » pour voir tous ses produits. Le panier prend le prix Tutto Clean quand il existe.",
      "<b>Panne d'un magasin</b> : si un site de magasin ne répond pas, ses derniers prix restent affichés avec leur date.",
      "<b>Vos données</b> : aucun compte, aucun cookie ; votre nom et votre adresse restent dans votre téléphone et ne partent que dans le message WhatsApp que vous envoyez. Visites comptées sans cookie (GoatCounter)."
    ];
    var ar = [
      "<b>الأسعار</b>: كل ليلة يقرأ برنامج آلي المتاجر الإلكترونية لكارفور (كل متجر على حدة) وجيان. لا سعر إلا للمنتجات المتوفرة؛ في كارفور السعر المعروض هو سعر أغلب المتاجر مع عدد المتاجر التي يتوفر فيها.",
      "<b>الأصناف</b>: صنف المنتج (غسيل، أوانٍ، ورق، رضيع…) يُقرأ من اسمه؛ المنتج المشكوك فيه لا يُعرض بدل أن يوضع في غير مكانه.",
      "<b>السعر للتر أو للكيلو أو للوحدة</b>: يُحسب فقط إذا كانت الكمية مكتوبة في الاسم (3 لتر، 2,5 كغ، 24 لفة، 44 حفاظة، 54 غسلة)؛ لا شيء يُخمَّن.",
      "<b>التخفيض</b>: النسبة الحمراء تأتي من السعر المشطوب الذي كتبه المتجر.",
      "<b>البحث</b>: بالمنتج أو بالعلامة، حتى بكتابة مختلفة.",
      "<b>الطلب</b>: زر «أضف» يضع المنتج في سلتك (محفوظة في هاتفك). «اطلب» يحضّر رسالة واتساب برقم الطلب ومنتجاتك وعنوانك: ترسلها بنفسك. يرد عليك المحل بسعره هو وبكلفة التوصيل (كامل تونس)؛ لا دفع في الموقع.",
      "<b>Tutto Clean</b>: المحل الذي يوصّل يكتب أسعاره بنفسه (دون التوصيل) في فضائه الخاص؛ تظهر فورًا بجانب أسعار المساحات الكبرى، مع زر «Tutto Clean» لرؤية كل منتجاته. السلة تأخذ سعر Tutto Clean إن وُجد.",
      "<b>عطل في متجر</b>: إذا لم يرد موقع متجر، تبقى آخر أسعاره معروضة مع تاريخها.",
      "<b>معطياتك</b>: لا حساب ولا ملفات تعريف ارتباط؛ اسمك وعنوانك يبقيان في هاتفك ولا يخرجان إلا في رسالة واتساب التي ترسلها. الزيارات تُعدّ دون ملفات تعريف (GoatCounter)."
    ];
    $("comment-corps").innerHTML = (langue === "ar" ? ar : fr).map(function (p) { return "<p>" + p + "</p>"; }).join("");
  }

  /* ------------------------------------------------------------ démarrage */
  function brancher() {
    $("btn-langue").addEventListener("click", changerLangue);
    $("familles").addEventListener("click", function (ev) {
      var b = ev.target.closest(".famille"); if (!b) return;
      filtreFam = b.getAttribute("data-f"); montres = PAR_PAGE;
      afficherFamilles(); afficher();
      $("produits").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    var minuteur;
    $("q").addEventListener("input", function () {
      clearTimeout(minuteur);
      minuteur = setTimeout(function () { texte = $("q").value.trim(); montres = PAR_PAGE; afficher(); }, 150);
    });
    $("q").addEventListener("keydown", function (ev) { if (ev.key === "Enter") { $("q").blur(); $("produits").scrollIntoView({ behavior: "smooth" }); } });
    $("tri").addEventListener("change", function () { tri = $("tri").value; afficher(); });
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
    $("btn-commander").addEventListener("click", ouvrirPanier);
    $("btn-envoyer").addEventListener("click", envoyer);
    // photo du magasin absente : dessin de la famille à la place (pas de « onerror= » : la CSP l'interdit)
    document.addEventListener("error", function (ev) {
      var img = ev.target; if (!img || img.tagName !== "IMG" || !img.closest(".photo")) return;
      var c = img.closest(".carte"), p = c && trouver(c.getAttribute("data-id"));
      img.outerHTML = '<span class="sans">' + svg(((p && famille(p.f)) || [0, 0, 0, 0, 0, ICONE_SANS])[5], 96) + "</span>";
    }, true);
    GESTES.forEach(function (g) { window.addEventListener(g, surPremierGeste, { capture: true, passive: true }); });
  }

  function demarrer() {
    var u = new URLSearchParams(location.search);
    var l = u.get("lang"); if (!l) { try { l = localStorage.getItem(CLE_LANGUE); } catch (e) { l = null; } }
    langue = l === "ar" ? "ar" : "fr";
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
