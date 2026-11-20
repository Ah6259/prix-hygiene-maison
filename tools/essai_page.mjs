// Essai de l'accueil comme un visiteur (Chromium sans écran, téléphone 390 px et PC 1300 px, français et arabe) sur des DONNÉES
// INVENTÉES (copie du site dans un dossier temporaire : rien n'est écrit dans le site). Vérifie : accueil léger (pas de liste
// complète avant le 1er geste), familles, recherche (au son), tri, « Voir plus », panier, message WhatsApp de la commande (numéro,
// produits, adresse), boutique (WhatsApp, téléphone, adresse), pied de page (pages légales), « Comment fonctionne ce site ? »
// (une phrase par fonction, règle § 44), aucune erreur JavaScript, rien qui dépasse de l'écran. Captures dans le 2e argument.
// Usage : node tools/essai_page.mjs [dossier du site=.] [dossier des captures]
import { spawn } from "child_process";
import { writeFileSync, mkdirSync, mkdtempSync, existsSync, readFileSync, cpSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import http from "http";

const [source = ".", captures = join(tmpdir(), "essai-hygiene")] = process.argv.slice(2);
mkdirSync(captures, { recursive: true });
const pause = ms => new Promise(r => setTimeout(r, ms));
const dossier = mkdtempSync(join(tmpdir(), "hm-site-"));
cpSync(source, dossier, { recursive: true, filter: f => !/node_modules|\.git[\\/]|[\\/]donnees[\\/]/.test(f) });

// ---------- données inventées : 13 familles, 70 produits, promotions, sans photo pour certains
const FAM = ["linge", "vaisselle", "maison", "javel", "desodorisant", "accessoires", "papier", "bebe", "feminine", "corps", "cheveux", "bouche", "soins"];
const produits = [];
for (let i = 0; i < 70; i++) {
  const f = FAM[i % FAM.length];
  produits.push({ id: `cf:${i}`, e: i % 3 ? "carrefour" : "geant", n: `Produit ${f} n° ${i}`, m: i === 5 ? "OMO" : `MARQUE${i % 7}`, f,
    q: `${(i % 4) + 1} L`, p: 2 + i * 0.5, r: i % 9 === 0 ? 3 + i * 0.5 : null, nb: i % 3 ? [12, 40] : [1, 1],
    pu: [(2 + i * 0.5) / ((i % 4) + 1), "L"], i: i % 5 === 4 ? "assets/img/p/absente.webp" : null, u: "https://exemple.tn/p" + i,
    s: i % 2 ? "liquide" : "poudre" });
}
produits[5].n = "Lessive poudre OMO main 4kg";
const familles = {}; produits.forEach(p => { familles[p.f] = (familles[p.f] || 0) + 1; });
const rayons = {}; produits.forEach(p => { const r = rayons[p.f] = rayons[p.f] || { n: 0, s: {}, i: null }; r.n++; r.s[p.s] = (r.s[p.s] || 0) + 1; });
const promos = produits.filter(p => p.r).map(({ u, ...p }) => p);
mkdirSync(join(dossier, "data"), { recursive: true });
writeFileSync(join(dossier, "data", "produits.json"), JSON.stringify({ date: "2026-11-20", produits }));
writeFileSync(join(dossier, "data", "accueil.json"), JSON.stringify({ date: "2026-11-20", total: produits.length, familles, rayons, promos,
  enseignes: { carrefour: { offres: 47, erreur: null, derniere_reussite: "2026-11-20" }, geant: { offres: 23, erreur: "délai", derniere_reussite: "2026-11-19" } },
  produits: produits.slice(0, 24).map(({ u, ...p }) => p) }));

// ---------- faux carnet Tutto Clean (jamais le vrai : l'adresse du carnet est remplacée dans la copie du site)
for (const page of ["index.html", "ar/index.html", "tutto-clean/index.html", "commandes/index.html"]) {   // jamais le vrai carnet pendant un essai
  const f = join(dossier, page);
  writeFileSync(f, readFileSync(f, "utf8").replace(/<meta name="hm-api" content="[^"]*">/, '<meta name="hm-api" content="/__tutto">'));
}
const carnet = { maj: "2026-11-20T10:00:00Z", produits: [
  { id: "cf:3", n: produits[3].n, m: produits[3].m, f: produits[3].f, q: produits[3].q, p: 1.234, s: true },
  { id: "tc:propre1", n: "Savon noir artisanal", m: "TUTTO", f: "corps", q: "500 g", p: 4.5, s: true },
  { id: "cf:4", n: produits[4].n, m: produits[4].m, f: produits[4].f, q: produits[4].q, p: 9.9, s: false } ] };
const BON_CODE = "tc-essai123";
const commandesNotees = [];
function fauxCarnet(req, res, chemin) {
  res.setHeader("Content-Type", "application/json");
  const bon = req.headers["x-code"] === BON_CODE;
  if (req.method === "GET" && chemin === "/__tutto/prix") return res.end(JSON.stringify({ ...carnet, produits: carnet.produits.filter(p => p.p != null) }));
  if (req.method === "POST" && chemin === "/__tutto/verifier") { res.statusCode = bon ? 200 : 403; return res.end(JSON.stringify({ ok: bon })); }
  if (req.method === "GET" && chemin === "/__tutto/commandes") {
    if (!bon) { res.statusCode = 403; return res.end('{"erreur":"code"}'); }
    return res.end(JSON.stringify({ commandes: commandesNotees.map((c, i) => ({ s: "nouvelle", d: "2026-11-21T10:0" + (i % 10) + ":00Z", ...c, k: "cmd:2026-11-21:" + c.c })) }));
  }
  if (req.method === "POST" && chemin === "/__tutto/commande-etat") {
    let corps = ""; req.on("data", c => { corps += c; }); req.on("end", () => {
      if (!bon) { res.statusCode = 403; return res.end('{"erreur":"code"}'); }
      const b = JSON.parse(corps), c = commandesNotees.find(x => "cmd:2026-11-21:" + x.c === b.k);
      if (!c) { res.statusCode = 404; return res.end("{}"); }
      c.s = b.s; res.end('{"ok":true}');
    });
    return;
  }
  if (req.method === "POST" && chemin === "/__tutto/commande") {
    let corps = ""; req.on("data", c => { corps += c; }); req.on("end", () => { commandesNotees.push(JSON.parse(corps)); res.end('{"ok":true}'); });
    return;
  }
  if (req.method === "POST" && chemin === "/__tutto/prix") {
    let corps = ""; req.on("data", c => { corps += c; }); req.on("end", () => {
      if (!bon) { res.statusCode = 403; return res.end('{"erreur":"code"}'); }
      const b = JSON.parse(corps), i = carnet.produits.findIndex(p => p.id === b.id);
      if (b.p == null) { if (i >= 0) carnet.produits.splice(i, 1); } else if (i >= 0) carnet.produits[i] = b; else carnet.produits.push(b);
      res.end('{"ok":true}');
    });
    return;
  }
  res.statusCode = 404; res.end("{}");
}

// ---------- petit serveur local (fetch() refuse file://) qui compte les fichiers demandés
const demandes = [];
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };
const srv = http.createServer((req, res) => {
  const chemin = req.url.split("?")[0];
  demandes.push(chemin);
  if (chemin.startsWith("/__tutto/")) return fauxCarnet(req, res, chemin);
  const f = resolve(dossier, "." + (chemin.endsWith("/") ? chemin + "index.html" : chemin));
  try { res.setHeader("Content-Type", TYPES[f.slice(f.lastIndexOf("."))] || "application/octet-stream"); res.end(readFileSync(f)); }
  catch { res.statusCode = 404; res.end(); }
});
await new Promise(r => srv.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${srv.address().port}/`;
const CHROME = ["/opt/pw-browsers/chromium", "/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium",
  "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"];
const PORT = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn(CHROME.find(c => existsSync(c)) || CHROME[0],
  ["--headless=new", "--disable-gpu", "--no-sandbox", `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "hm-"))}`, "about:blank"], { stdio: "ignore" });
let cibles;
for (let i = 0; i < 80 && !cibles; i++) { try { cibles = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); } catch { await pause(250); } }
const ws = new WebSocket(cibles.find(c => c.type === "page").webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener("open", r));
let n = 0; const attente = {}, erreurs = [];
ws.addEventListener("message", e => {
  const m = JSON.parse(e.data);
  if (m.id && attente[m.id]) { attente[m.id](m.result || m); delete attente[m.id]; }
  if (m.method === "Runtime.exceptionThrown") erreurs.push((m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text || "").split("\n")[0]);
});
const cmd = (method, params = {}) => new Promise(r => { const id = ++n; attente[id] = r; ws.send(JSON.stringify({ id, method, params })); });
const val = async expression => (await cmd("Runtime.evaluate", { returnByValue: true, awaitPromise: true, expression })).result?.value;
await cmd("Page.enable"); await cmd("Runtime.enable"); await cmd("Network.enable"); await cmd("Network.setCacheDisabled", { cacheDisabled: true });
await cmd("Network.setBlockedURLs", { urls: ["*goatcounter.com*", "*gc.zgo.at*", "*fonts.googleapis.com*", "*fonts.gstatic.com*"] });

let defauts = 0;
const verif = (cond, msg) => { console.log((cond ? "  ok   " : "  DÉFAUT ") + msg); if (!cond) defauts++; };
const capture = async nom => { const r = await cmd("Page.captureScreenshot", { format: "png" }); writeFileSync(join(captures, nom + ".png"), Buffer.from(r.data, "base64")); };

// « Comment fonctionne ce site ? » : repère dans app.js -> mot attendu dans l'explication (règle § 44)
const FONCTIONS = [["sonRecherche", "Recherche"], ["data-plus", "Ajouter"], ["numeroCommande", "numéro de commande"], ["pu[0]", "Prix au litre"],
  ["badge-promo", "Promotion"], ["panne", "Panne d'un magasin"], ["hm_client", "Vos données"], ["nb[1]", "nombre de magasins"], ["famille(", "Les rayons"], ["marquesChoisies", "Filtres"], ["noterCommande", "numéro de commande, le gouvernorat et les produits"], ["qr-telecharger", "QR code"]];
const appjs = readFileSync(join(source, "app.js"), "utf8");
for (const [repere] of FONCTIONS) verif(appjs.includes(repere), `repère présent dans app.js : ${repere}`);

for (const [nom, w, h, mobile] of [["telephone", 390, 844, true], ["ordinateur", 1300, 900, false]]) {
  console.log(`\n== ${nom} (${w} px)`);
  await cmd("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile });
  demandes.length = 0;
  await cmd("Page.navigate", { url }); await pause(1500);
  await val(`localStorage.clear()`);
  await cmd("Page.navigate", { url }); await pause(1500);
  verif(!demandes.includes("/data/produits.json"), "accueil léger : liste complète pas chargée avant le 1er geste");
  verif(await val(`document.querySelector("#produits").hidden`), "accueil : pas de liste complète d'office");
  verif(await val(`(() => { const i = document.querySelector("#qr-image"); return !!i && i.complete && i.naturalWidth > 0 && i.src.endsWith("hygiene-fr.svg") && document.querySelector("#qr-telecharger").href.endsWith("hygiene-fr.png"); })()`), "QR code à partager (image affichée + téléchargement)");
  verif(await val(`(() => { const b = document.querySelector("#boutique"), h = document.querySelector(".hero"); return !!b && !!h && b.getBoundingClientRect().top > h.getBoundingClientRect().top && b.getBoundingClientRect().top < document.querySelector("#t-rayons").getBoundingClientRect().top; })()`), "accueil : la boutique Tutto Clean juste après le bandeau, avant les rayons");
  verif((await val(`document.querySelector('.hero .btn-orange').href`) || "").startsWith("https://wa.me/21699453345"), "bandeau : « Commander chez Tutto Clean »");
  await val(`document.querySelector("#voir-tous").click()`); await pause(300);
  verif(await val(`document.querySelectorAll("#grille .carte").length`) === 24, "« Voir tous les produits » : 24 cartes");
  verif(await val(`document.querySelectorAll("#familles .famille").length`) === 15, "boutons « Tout », « Tutto Clean » et 13 familles");
  verif((await val(`document.querySelector('#familles [data-f="__tutto"] small')?.textContent`)) === "2", "Tutto Clean : 2 produits (« en stock » décoché = caché)");
  verif((await val(`document.querySelector('.carte[data-id="cf:3"] .tutto')?.textContent`) || "").includes("1,234 DT + livraison"), "carte : prix Tutto Clean + livraison");
  verif(!(await val(`!!document.querySelector('.carte[data-id="cf:4"] .tutto')`)), "produit décoché « en stock » : pas de prix Tutto Clean");
  verif(await val(`document.querySelector("#panier-nb").hidden`), "panier vide : pas de « 0 » sur le bouton");
  verif(await val(`[...document.querySelectorAll("button")].every(b => b.offsetParent === null || (b.scrollWidth <= b.clientWidth + 1 && b.scrollHeight <= b.clientHeight + 1))`), "aucun bouton dont le texte déborde");
  verif((await val(`document.querySelector("#maj").textContent`) || "").includes("Géant : prix du 19/11/2026"), "panne d'une enseigne dite avec la date de ses prix");
  verif(await val(`document.querySelector('.btn-wa').href`) === "https://wa.me/21699453345", "bouton WhatsApp de la boutique");
  verif(await val(`(() => { const b = document.querySelector(".entete .btn-partager"); const r = b && b.getBoundingClientRect(); return !!b && r.width > 30 && r.top < 120; })()`), "bouton rond « Partager » dans l'en-tête (règle § 8)");
  await val(`window.__partage = null; window.__ouvertP = []; const so = navigator.share; navigator.share = d => { window.__partage = d; return Promise.resolve(); }; document.querySelector("#btn-partager").click(); navigator.share = so;`);
  verif((await val(`window.__partage && window.__partage.url`) || "").startsWith("https://hygiene.clicvia.com/"), "« Partager » : lien du site dans le menu du téléphone");
  verif(await val(`document.querySelector('.btn-tel').href`) === "tel:+21699453345", "bouton téléphone 99 453 345");
  verif((await val(`document.querySelector('.btn-carte').href`) || "").includes("0x9df9049a18b3af98"), "lien de l'adresse de la boutique");
  verif(await val(`(() => { const a = document.querySelector('.boutique-carte'); return !!a && a.href.includes("0x9df9049a18b3af98") && a.querySelector('img').src.includes('boutique-carte'); })()`), "carte de la boutique (clic = Google Maps)");
  verif(await val(`[...document.querySelectorAll('.pied a')].some(a => a.href === "https://clicvia.com/confidentialite/") && [...document.querySelectorAll('.pied a')].some(a => a.href === "https://clicvia.com/conditions/")`), "pied : Confidentialité et Conditions (§ 58)");
  verif(await val(`!document.body.textContent.match(/pourcentage|commission/i)`), "rien sur la commission (consigne d'Ahmed)");
  verif(await val(`document.documentElement.scrollWidth <= innerWidth`), "rien ne dépasse de l'écran (accueil)");
  const chevauche = `(() => { const a = document.querySelector(".logo-txt").getBoundingClientRect(), b = document.querySelector(".entete-actions").getBoundingClientRect();
    return document.documentElement.dir === "rtl" ? a.left < b.right : a.right > b.left; })()`;
  verif(!(await val(chevauche)), "en-tête : le nom du site n'est pas coupé par les boutons");
  await capture(`${nom}-accueil`);

  // 1er geste : la liste complète arrive
  await val(`window.scrollBy(0, 300)`); await pause(800);
  verif(demandes.includes("/data/produits.json"), "liste complète chargée au 1er geste");
  // famille
  await val(`document.querySelector('#familles [data-f="papier"]').click()`); await pause(400);
  const pap = await val(`[...document.querySelectorAll("#grille .carte")].length`);
  verif(pap === produits.filter(p => p.f === "papier").length, `famille Papier : ${pap} produits, tous de la famille`);
  verif(await val(`document.querySelector('#familles [data-f="papier"]').getAttribute("aria-pressed")`) === "true", "bouton de famille marqué choisi");
  verif(await val(`document.querySelector("#vue-accueil").hidden && !document.querySelector("#fil").hidden`), "rayon choisi : accueil caché, fil d'Ariane « Accueil › rayon »");
  // sous-rayons (comme Carrefour)
  verif(await val(`document.querySelectorAll("#sous-rayons .puce").length`) === 3, "sous-rayons : « Tout le rayon » + 2 sous-rayons");
  await val(`document.querySelector('#sous-rayons [data-s="poudre"]').click()`); await pause(300);
  const nbPoudre = await val(`document.querySelectorAll("#grille .carte").length`);
  verif(nbPoudre === produits.filter(p => p.f === "papier" && p.s === "poudre").length, `sous-rayon choisi : ${nbPoudre} produits, tous de ce sous-rayon`);
  verif((await val(`document.querySelector("#fil").textContent`)).includes("Lessive en poudre"), "fil d'Ariane : rayon › sous-rayon");
  await val(`document.querySelector('#fil [data-aller="accueil"]').click()`); await pause(300);
  verif(!(await val(`document.querySelector("#vue-accueil").hidden`)), "« Accueil » du fil d'Ariane : retour à l'accueil");
  // accueil : tuiles des rayons et promotions
  verif(await val(`document.querySelectorAll("#rayons-grille .rayon-tuile").length`) === 13, "accueil : 13 tuiles de rayons");
  verif(await val(`document.querySelectorAll("#defile-promos .carte").length`) === promos.length, "accueil : carrousel des promotions");
  await val(`document.querySelector('#rayons-grille [data-f="bebe"]').click()`); await pause(400);
  verif(await val(`[...document.querySelectorAll("#grille .carte")].length`) === produits.filter(p => p.f === "bebe").length, "tuile « Bébé » : les produits du rayon");
  await val(`document.querySelector("#voir-promos").click()`); await pause(400);
  verif(await val(`[...document.querySelectorAll("#grille .carte")].every(c => c.querySelector(".badge-promo"))`), "« Voir tout » des promotions : seulement des promotions");
  // filtre des marques et du magasin
  await val(`document.querySelector('#familles [data-f=""]').click()`); await pause(300);
  await val(`document.querySelector("#btn-marques").click()`); await pause(500);
  await val(`(() => { const c = [...document.querySelectorAll("#liste-marques input")].find(x => x.value === "MARQUE3"); c.click(); })()`); await pause(400);
  verif(await val(`[...document.querySelectorAll("#grille .carte .marque")].every(m => m.textContent === "MARQUE3")`) && (await val(`document.querySelectorAll("#grille .carte").length`)) === produits.filter(p => p.m === "MARQUE3").length,
    "filtre marque : seulement MARQUE3, tous ses produits");
  await val(`document.querySelector("#marques-effacer").click(); document.querySelector("#marques-ok").click()`); await pause(300);
  await val(`(() => { const s = document.querySelector("#magasin"); s.value = "geant"; s.dispatchEvent(new Event("change")); })()`); await pause(300);
  verif(await val(`[...document.querySelectorAll("#grille .carte .ou")].every(o => o.textContent.includes("Géant"))`), "filtre magasin : seulement Géant");
  await val(`(() => { const s = document.querySelector("#magasin"); s.value = ""; s.dispatchEvent(new Event("change")); })()`); await pause(300);
  await val(`document.querySelector('#familles [data-f=""]').click()`); await pause(300);
  await val(`document.querySelector("#voir-tous").click()`); await pause(300);
  // « Voir plus »
  await val(`document.querySelector('#btn-plus').click()`); await pause(300);
  verif(await val(`document.querySelectorAll("#grille .carte").length`) === 48, "« Voir plus » ajoute 24 produits");
  // recherche au son + nom exact d'abord
  await val(`(() => { const q = document.querySelector("#q"); q.value = "omo"; q.dispatchEvent(new Event("input")); })()`); await pause(500);
  verif(await val(`document.querySelector("#grille .carte .marque")?.textContent`) === "OMO", "recherche « omo » : OMO en premier");
  await val(`(() => { const q = document.querySelector("#q"); q.value = "lessiv omo"; q.dispatchEvent(new Event("input")); })()`); await pause(500);
  verif(await val(`document.querySelectorAll("#grille .carte").length`) === 1, "recherche de deux mots");
  await val(`(() => { const q = document.querySelector("#q"); q.value = "zzzzz"; q.dispatchEvent(new Event("input")); })()`); await pause(500);
  verif(await val(`!!document.querySelector("#grille .vide")`), "aucun résultat : message clair qui renvoie vers WhatsApp");
  await val(`(() => { const q = document.querySelector("#q"); q.value = ""; q.dispatchEvent(new Event("input")); })()`); await pause(400);
  // tri
  await val(`(() => { const s = document.querySelector("#tri"); s.value = "prix"; s.dispatchEvent(new Event("change")); })()`); await pause(300);
  const prix = await val(`[...document.querySelectorAll("#grille .prix")].map(e => parseFloat(e.textContent.replace(/\\u202F/g, "").replace(",", ".")))`);
  verif(prix.every((v, i) => !i || prix[i - 1] <= v), "tri « prix le plus bas » : prix croissants");
  await val(`(() => { const s = document.querySelector("#tri"); s.value = "remise"; s.dispatchEvent(new Event("change")); })()`); await pause(300);
  verif(await val(`!!document.querySelector("#grille .carte:first-child .badge-promo")`), "tri « promotion d'abord » : une promotion en tête");
  // photo absente -> dessin de la famille (photos chargées tout de suite pour l'essai : elles le sont au défilement sinon)
  await val(`document.querySelectorAll("#grille img").forEach(i => { i.loading = "eager"; })`); await pause(800);
  verif(await val(`!document.querySelector('#grille img[src*="absente"]')`), "photo introuvable remplacée par le dessin de la famille");
  // panier
  verif(await val(`document.querySelector("#barre-panier").hidden`), "barre « Commander » cachée tant que le panier est vide");
  await val(`document.querySelector("#grille .carte .btn-ajout").click()`); await pause(200);
  await val(`document.querySelector("#grille .carte [data-plus]").click()`); await pause(200);
  verif(await val(`document.querySelector("#panier-nb").textContent`) === "2", "2 articles dans le panier");
  verif(await val(`!document.querySelector("#barre-panier").hidden`), "barre « Commander » visible");
  await capture(`${nom}-panier-barre`);
  await val(`document.querySelector("#btn-commander").click()`); await pause(400);
  verif(await val(`document.querySelector("#panier").open`), "fenêtre de la commande ouverte");
  await val(`window.__ouvert = []; window.open = (u) => { window.__ouvert.push(u); return null; }`);
  await val(`document.querySelector("#btn-envoyer").click()`);
  verif(await val(`!document.querySelector("#erreur-commande").hidden && window.__ouvert.length === 0`), "formulaire vide : erreur, rien n'est envoyé");
  await val(`(() => { const f = document.querySelector("#form-commande"); f.nom.value = "Sami Test"; f.tel.value = "22 333 444"; f.gouv.value = "Sfax"; f.adresse.value = "Rue de l'essai, Sfax"; })()`);
  await capture(`${nom}-commande`);
  await val(`document.querySelector("#btn-envoyer").click()`);
  const lien = await val(`window.__ouvert[0] || ""`);
  const msg = decodeURIComponent((lien.split("?text=")[1] || ""));
  verif(lien.startsWith("https://wa.me/21699453345?text="), "commande envoyée vers le WhatsApp de la boutique");
  verif(/Commande HM-\d{6}-[A-Z0-9]{4}/.test(msg), "message : numéro de commande HM-AAMMJJ-XXXX");
  verif(msg.includes("2 × ") && msg.includes("Sami Test") && msg.includes("Sfax") && msg.includes("Rue de l'essai"), "message : quantités, nom, gouvernorat, adresse");
  verif(msg.includes("votre prix et les frais de livraison"), "message : demande le prix de la boutique et la livraison");
  await pause(400);
  const notee = commandesNotees[commandesNotees.length - 1] || {};
  verif(notee.c && msg.includes(notee.c) && notee.g === "Sfax" && notee.l && notee.l.length >= 1, "commande notée dans le carnet (même numéro, gouvernorat, produits)");
  verif(!JSON.stringify(notee).match(/Sami|22 333 444|Rue de l/), "carnet : ni nom, ni téléphone, ni adresse du client");
  await val(`document.querySelector("#panier").close()`);
  // Tutto Clean : son bouton, son produit propre, le panier au prix de la boutique
  await val(`document.querySelector('#familles [data-f="__tutto"]').click()`); await pause(500);
  const ids = await val(`[...document.querySelectorAll("#grille .carte")].map(c => c.dataset.id).sort().join(",")`);
  verif(ids === "cf:3,tc:propre1", `bouton Tutto Clean : ses 2 produits (${ids})`);
  verif((await val(`document.querySelector('.carte[data-id="tc:propre1"] .ou')?.textContent`) || "").includes("Tutto Clean"), "produit propre : « chez Tutto Clean · + livraison »");
  await val(`document.querySelector('.carte[data-id="tc:propre1"] [data-plus]').click()`); await pause(200);
  await val(`document.querySelector("#btn-commander").click()`); await pause(300);
  await val(`window.__ouvert = []; document.querySelector("#btn-envoyer").click()`);
  const msg2 = decodeURIComponent(((await val(`window.__ouvert[0] || ""`)).split("?text=")[1] || ""));
  verif(msg2.includes("Savon noir artisanal") && msg2.includes("prix Tutto Clean 4,500 DT"), "message : produit Tutto Clean à son prix");
  await val(`document.querySelector("#panier").close()`);
  await val(`document.querySelector('#familles [data-f=""]').click()`); await pause(300);
  // « Comment fonctionne ce site ? »
  const comment = await val(`document.querySelector("#comment-corps").textContent`);
  for (const [, attendu] of FONCTIONS) verif(comment.toLowerCase().includes(attendu.toLowerCase()), `explication : « ${attendu} »`);
  verif(await val(`document.documentElement.scrollWidth <= innerWidth`), "rien ne dépasse de l'écran (après les essais)");

  // arabe
  await val(`document.querySelector("#btn-langue").click()`); await pause(1800);
  verif(await val(`document.documentElement.dir === "rtl" && document.documentElement.lang === "ar"`), "arabe : page de droite à gauche");
  verif(await val(`document.title.includes("أسعار") && document.querySelector('link[rel=canonical]').href.endsWith("/ar/")`), "arabe : titre arabe et adresse propre /ar/ (une adresse par langue)");
  verif(await val(`document.querySelector("h1").textContent.includes("أسعار")`), "arabe : titre traduit");
  verif(await val(`location.pathname === "/ar/"`), "arabe : adresse /ar/");
  verif(await val(`document.querySelector("#qr-image").src.endsWith("hygiene-ar.svg")`), "arabe : QR code de la page arabe");
  verif(await val(`document.documentElement.scrollWidth <= innerWidth`), "arabe : rien ne dépasse de l'écran");
  verif(!(await val(chevauche)), "arabe : le nom du site n'est pas coupé par les boutons");
  verif(await val(`getComputedStyle(document.querySelector(".badge-promo") || document.body).direction`) !== "rtl" || !(await val(`!!document.querySelector(".badge-promo")`)), "arabe : remise écrite « −33 % » (de gauche à droite)");
  await val(`window.scrollTo(0, 0)`); await pause(200);
  await capture(`${nom}-arabe`);
  await val(`document.querySelector("#btn-langue").click()`); await pause(1800);
  verif(await val(`document.documentElement.dir === "ltr" && location.pathname === "/"`), "retour au français (adresse /)");
}
// ---------- Espace Tutto Clean (page privée), au téléphone
console.log("\n== Espace Tutto Clean (390 px)");
await cmd("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await cmd("Page.navigate", { url: url + "tutto-clean/" }); await pause(1200);
await val(`localStorage.clear()`);
verif(await val(`document.querySelector('meta[name="robots"]').content.includes("noindex")`), "page privée : pas dans Google (noindex)");
await val(`document.querySelector("#code").value = "mauvais"; document.querySelector("#form-code").requestSubmit()`); await pause(600);
verif(await val(`!document.querySelector("#erreur-code").hidden && document.querySelector("#espace").hidden`), "mauvais code : refusé");
await val(`document.querySelector("#code").value = "${BON_CODE}"; document.querySelector("#form-code").requestSubmit()`); await pause(1500);
verif(await val(`!document.querySelector("#espace").hidden`), "bon code : espace ouvert");
verif(await val(`document.querySelector("#resume").textContent.includes("3 produits")`), "résumé : ses 3 produits");
verif(await val(`document.querySelectorAll("#lignes .ligne").length`) === 30, "30 produits par page");
await val(`document.querySelector("#seulement-miens").click()`); await pause(300);
verif(await val(`document.querySelectorAll("#lignes .ligne").length`) === 3, "« Seulement mes produits » : 3");
await val(`document.querySelector("#seulement-miens").click()`); await pause(300);
await val(`(() => { const q = document.querySelector("#q"); q.value = "${produits[7].n}"; q.dispatchEvent(new Event("input")); })()`); await pause(500);
await val(`(() => { const li = document.querySelector('.ligne[data-id="cf:7"]'); li.querySelector("input[type=text]").value = "abc"; li.querySelector(".enr").click(); })()`); await pause(300);
verif((await val(`document.querySelector('.ligne[data-id="cf:7"] .etat').textContent`)).includes("illisible"), "prix illisible : refusé avant l'envoi");
await val(`(() => { const li = document.querySelector('.ligne[data-id="cf:7"]'); li.querySelector("input[type=text]").value = "7,5"; li.querySelector(".enr").click(); })()`); await pause(800);
verif(carnet.produits.some(p => p.id === "cf:7" && p.p === 7.5), "prix « 7,5 » enregistré dans le carnet (7,500 DT)");
verif((await val(`document.querySelector('.ligne[data-id="cf:7"] .etat').textContent`)).includes("Enregistré"), "« Enregistré ✓ » affiché");
await val(`document.querySelector('.ligne[data-id="cf:7"] .ret').click()`); await pause(800);
verif(!carnet.produits.some(p => p.id === "cf:7"), "« Retirer » : prix enlevé du carnet");
await val(`(() => { document.querySelector("#bloc-ajout").open = true; const f = document.querySelector("#form-ajout");
  f.n.value = "Javel maison 5L"; f.m.value = "tutto"; f.f.value = "javel"; f.q.value = "5 L"; f.p.value = "6,250"; f.requestSubmit(); })()`); await pause(900);
const ajoute = carnet.produits.find(p => p.n === "Javel maison 5L");
verif(ajoute && ajoute.id.startsWith("tc:") && ajoute.p === 6.25 && ajoute.f === "javel" && ajoute.m === "TUTTO", "produit ajouté dans le carnet (tc:…, 6,250 DT, Javel, marque TUTTO)");
verif(await val(`document.documentElement.scrollWidth <= innerWidth`), "espace : rien ne dépasse de l'écran");
// onglet « Mes commandes »
verif(await val(`document.querySelector("#nb-a-traiter").textContent`) === String(commandesNotees.length), `pastille : ${commandesNotees.length} commandes à traiter`);
await val(`document.querySelector("#onglet-btn-commandes").click()`); await pause(800);
verif(await val(`!document.querySelector("#onglet-commandes").hidden && document.querySelector("#onglet-prix").hidden`), "onglet « Mes commandes » ouvert, prix cachés");
verif(await val(`document.querySelectorAll("#liste-cmd .cmd").length`) === commandesNotees.length, "toutes les commandes du site sont listées");
const premiere = commandesNotees[0].c;
verif((await val(`document.querySelector("#liste-cmd .cmd .num").textContent`)) && (await val(`document.querySelector("#liste-cmd").textContent.includes("${premiere}")`)), "numéro HM-… affiché (le même que sur WhatsApp)");
await val(`[...document.querySelectorAll("#liste-cmd .cmd")].find(c => c.textContent.includes("${premiere}")).querySelector('[data-etat="livree"]').click()`); await pause(800);
verif(commandesNotees[0].s === "livree", "« Livrée » enregistré dans le carnet");
verif(!(await val(`document.querySelector("#liste-cmd").textContent.includes("${premiere}")`)), "commande livrée : sortie de « À traiter »");
await val(`document.querySelector('#filtres-cmd [data-etat="livree"]').click()`); await pause(300);
verif(await val(`document.querySelector("#liste-cmd").textContent.includes("${premiere}")`), "filtre « Livrées » : elle y est");
verif(await val(`document.documentElement.scrollWidth <= innerWidth`), "onglet commandes : rien ne dépasse de l'écran");
await capture("tutto-commandes");
await capture("tutto-espace");
verif(erreurs.length === 0, `aucune erreur JavaScript${erreurs.length ? " : " + erreurs.join(" | ") : ""}`);
chrome.kill(); srv.close(); ws.close();
console.log(`\nCaptures : ${captures}`);
console.log(defauts ? `ÉCHEC : ${defauts} défaut(s)` : "Tous les essais de la page sont verts.");
process.exit(defauts ? 1 : 0);
