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
    pu: [(2 + i * 0.5) / ((i % 4) + 1), "L"], i: i % 5 === 4 ? "assets/img/p/absente.webp" : null, u: "https://exemple.tn/p" + i });
}
produits[5].n = "Lessive poudre OMO main 4kg";
const familles = {}; produits.forEach(p => { familles[p.f] = (familles[p.f] || 0) + 1; });
mkdirSync(join(dossier, "data"), { recursive: true });
writeFileSync(join(dossier, "data", "produits.json"), JSON.stringify({ date: "2026-11-20", produits }));
writeFileSync(join(dossier, "data", "accueil.json"), JSON.stringify({ date: "2026-11-20", total: produits.length, familles,
  enseignes: { carrefour: { offres: 47, erreur: null, derniere_reussite: "2026-11-20" }, geant: { offres: 23, erreur: "délai", derniere_reussite: "2026-11-19" } },
  produits: produits.slice(0, 24).map(({ u, ...p }) => p) }));

// ---------- petit serveur local (fetch() refuse file://) qui compte les fichiers demandés
const demandes = [];
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };
const srv = http.createServer((req, res) => {
  const chemin = req.url.split("?")[0];
  demandes.push(chemin);
  const f = resolve(dossier, "." + (chemin === "/" ? "/index.html" : chemin));
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
  ["badge-promo", "Promotion"], ["panne", "Panne d'un magasin"], ["hm_client", "Vos données"], ["nb[1]", "nombre de magasins"], ["famille(", "Les familles"]];
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
  verif(await val(`document.querySelectorAll("#grille .carte").length`) === 24, "24 cartes à l'accueil");
  verif(await val(`document.querySelectorAll("#familles .famille").length`) === 14, "bouton « Tout » + 13 familles");
  verif(await val(`document.querySelector("#panier-nb").hidden`), "panier vide : pas de « 0 » sur le bouton");
  verif(await val(`[...document.querySelectorAll("button")].every(b => b.offsetParent === null || (b.scrollWidth <= b.clientWidth + 1 && b.scrollHeight <= b.clientHeight + 1))`), "aucun bouton dont le texte déborde");
  verif((await val(`document.querySelector("#maj").textContent`) || "").includes("Géant : prix du 19/11/2026"), "panne d'une enseigne dite avec la date de ses prix");
  verif(await val(`document.querySelector('.btn-wa').href`) === "https://wa.me/21699453345", "bouton WhatsApp de la boutique");
  verif(await val(`document.querySelector('.btn-tel').href`) === "tel:+21699453345", "bouton téléphone 99 453 345");
  verif((await val(`document.querySelector('.btn-carte').href`) || "").includes("0x9df9049a18b3af98"), "lien de l'adresse de la boutique");
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
  await val(`document.querySelector('#familles [data-f=""]').click()`); await pause(300);
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
  await val(`document.querySelector("#panier").close()`);
  // « Comment fonctionne ce site ? »
  const comment = await val(`document.querySelector("#comment-corps").textContent`);
  for (const [, attendu] of FONCTIONS) verif(comment.toLowerCase().includes(attendu.toLowerCase()), `explication : « ${attendu} »`);
  verif(await val(`document.documentElement.scrollWidth <= innerWidth`), "rien ne dépasse de l'écran (après les essais)");

  // arabe
  await val(`document.querySelector("#btn-langue").click()`); await pause(500);
  verif(await val(`document.documentElement.dir === "rtl" && document.documentElement.lang === "ar"`), "arabe : page de droite à gauche");
  verif(await val(`document.querySelector("h1").textContent.includes("أسعار")`), "arabe : titre traduit");
  verif(await val(`location.search.includes("lang=ar")`), "arabe : adresse ?lang=ar");
  verif(await val(`document.documentElement.scrollWidth <= innerWidth`), "arabe : rien ne dépasse de l'écran");
  verif(!(await val(chevauche)), "arabe : le nom du site n'est pas coupé par les boutons");
  verif(await val(`getComputedStyle(document.querySelector(".badge-promo") || document.body).direction`) !== "rtl" || !(await val(`!!document.querySelector(".badge-promo")`)), "arabe : remise écrite « −33 % » (de gauche à droite)");
  await val(`window.scrollTo(0, 0)`); await pause(200);
  await capture(`${nom}-arabe`);
  await val(`document.querySelector("#btn-langue").click()`); await pause(300);
  verif(await val(`document.documentElement.dir === "ltr"`), "retour au français");
}
verif(erreurs.length === 0, `aucune erreur JavaScript${erreurs.length ? " : " + erreurs.join(" | ") : ""}`);
chrome.kill(); srv.close(); ws.close();
console.log(`\nCaptures : ${captures}`);
console.log(defauts ? `ÉCHEC : ${defauts} défaut(s)` : "Tous les essais de la page sont verts.");
process.exit(defauts ? 1 : 0);
