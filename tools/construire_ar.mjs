// Page ARABE à sa propre adresse (règle commune § 8 point 9, « une adresse par langue », 21/11/2026) : https://hygiene.clicvia.com/ar/
// Fabriquée à partir de index.html (français) et des textes arabes de app.js (T.ar) : ÉCRITE en arabe dès le serveur (Google la lit),
// lang="ar" dir="rtl", titre / description / canonical / og en arabe, hreflang fr / ar / x-default, <base href="/"> (mêmes fichiers).
// Ne jamais modifier ar/index.html à la main : modifier index.html ou app.js puis `node tools/construire_ar.mjs`.
// `node tools/construire_ar.mjs --verifier` : code 1 si ar/index.html n'est pas à jour (robot tests).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const ADRESSE = "https://hygiene.clicvia.com/";
const TITRE_AR = "أسعار مواد التنظيف والنظافة في تونس — Hygiène & Maison";
const DESC_AR = "قارن مجانًا أسعار مواد التنظيف والنظافة في كارفور وجيان، واطلبها مع التوصيل إلى كامل تونس عبر Tutto Clean.";
const OG_TITRE_AR = "Hygiène & Maison — أسعار مواد التنظيف والنظافة في تونس";
const OG_DESC_AR = "غسيل، جافال، أوانٍ، ورق، حفاظات، صابون، شامبو… أسعار المساحات الكبرى، والطلب مع التوصيل إلى كامل تونس.";

const html = readFileSync(join(RACINE, "index.html"), "utf8");
const js = readFileSync(join(RACINE, "app.js"), "utf8");
const bloc = js.match(/var T = (\{[\s\S]*?\n  \});\n/);
if (!bloc) { console.log("ÉCHEC : dictionnaire T introuvable dans app.js"); process.exit(1); }
const T = Function(`"use strict"; return (${bloc[1]});`)();
const AR = T.ar, manque = [];
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

let h = html;
h = h.replace('<html lang="fr" dir="ltr" translate="no" data-langue-fixe="fr">', '<html lang="ar" dir="rtl" translate="no" data-langue-fixe="ar">');
h = h.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="/">');
h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(TITRE_AR)}</title>`);
h = h.replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(DESC_AR)}"`);
h = h.replace('<link rel="canonical" href="https://hygiene.clicvia.com/">', `<link rel="canonical" href="${ADRESSE}ar/">`);
h = h.replace(/(<meta property="og:title" content=")[^"]*"/, `$1${esc(OG_TITRE_AR)}"`);
h = h.replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(OG_DESC_AR)}"`);
h = h.replace('<meta property="og:url" content="https://hygiene.clicvia.com/">', `<meta property="og:url" content="${ADRESSE}ar/">`);
h = h.replace('<meta property="og:locale" content="fr_FR">\n<meta property="og:locale:alternate" content="ar_AR">', '<meta property="og:locale" content="ar_AR">\n<meta property="og:locale:alternate" content="fr_FR">');
h = h.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n/, "");   // la FAQ JSON-LD est en français : seulement sur la page française
// textes : data-t (texte), data-t-html (HTML), data-t-ph (placeholder)
h = h.replace(/(<[^>]*\sdata-t="([^"]+)"[^>]*>)([^<]*)(<)/g, (m, ouv, cle, txt, fin) => {
  if (typeof AR[cle] !== "string") { manque.push(cle); return m; }
  return ouv + esc(AR[cle]) + fin;
});
h = h.replace(/(<([a-z0-9]+)[^>]*\sdata-t-html="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g, (m, ouv, bal, cle, txt, fin) => {
  if (typeof AR[cle] !== "string") { manque.push(cle); return m; }
  return ouv + AR[cle] + fin;
});
h = h.replace(/(\sdata-t-ph="([^"]+)"[^>]*?\splaceholder=")[^"]*"|(\splaceholder=")[^"]*("[^>]*\sdata-t-ph="([^"]+)")/g, (m, a, cle1, b, c, cle2) => {
  const cle = cle1 || cle2;
  if (typeof AR[cle] !== "string") { manque.push(cle); return m; }
  return a ? a.replace(/placeholder="$/, "") + `placeholder="${esc(AR[cle])}"` : `${b}${esc(AR[cle])}${c}`;
});
// liens internes : ancres et accueil de la page arabe (avec <base href="/">, « #x » mènerait à la page française)
h = h.replace(/href="#([a-z0-9-]+)"/g, 'href="ar/#$1"').replace('<a class="logo" href="./"', '<a class="logo" href="ar/"');
h = h.replace('<button type="button" class="btn-langue" id="btn-langue" lang="ar">العربية</button>', '<button type="button" class="btn-langue" id="btn-langue" lang="fr">Français</button>');
h = h.replace('src="assets/qr/hygiene-fr.svg"', 'src="assets/qr/hygiene-ar.svg"').replace('href="assets/qr/hygiene-fr.png"', 'href="assets/qr/hygiene-ar.png"');
if (manque.length) { console.log("ÉCHEC : textes arabes manquants dans app.js (T.ar) : " + [...new Set(manque)].join(", ")); process.exit(1); }

const sortie = join(RACINE, "ar", "index.html");
if (process.argv.includes("--verifier")) {
  const ok = existsSync(sortie) && readFileSync(sortie, "utf8") === h;
  console.log(ok ? "ok ar/index.html à jour" : "ÉCHEC : ar/index.html n'est pas à jour (lancer node tools/construire_ar.mjs)");
  process.exit(ok ? 0 : 1);
}
mkdirSync(dirname(sortie), { recursive: true });
writeFileSync(sortie, h);
console.log("ar/index.html fabriqué");
