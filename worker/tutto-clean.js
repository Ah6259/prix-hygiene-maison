// Carnet des prix de la boutique TUTTO CLEAN (Prix Hygiène & Maison, 20/11/2026) — Cloudflare Worker + KV, gratuit.
// GET  /prix               -> liste publique {maj, produits:[{id, ref?, n, m, f, q, p, s, i?}]} (lue par le site, mise en cache 60 s)
// GET  /photo/<id>         -> photo d'un produit propre à la boutique (WebP envoyé par la page privée)
// POST /prix   (en-tête X-Code)  {id, ref?, n, m, f, q, p, s, photo?}  -> ajoute ou modifie un produit ; p = null -> retiré
// POST /verifier (en-tête X-Code) -> {ok:true} si le code est bon
// Le code de la boutique n'est jamais écrit ici : seulement son empreinte SHA-256 (secret CODE_SHA256 du Worker).
const ORIGINES = ["https://hygiene.clicvia.com", "http://127.0.0.1"];
const FAMILLES = ["linge", "vaisselle", "maison", "javel", "desodorisant", "accessoires", "papier", "bebe", "feminine", "corps", "cheveux", "bouche", "soins"];

function entetes(req, extra = {}) {
  const o = req.headers.get("Origin") || "";
  const ok = ORIGINES.some(x => o === x || o.startsWith(x + ":"));
  return { "Access-Control-Allow-Origin": ok ? o : ORIGINES[0], "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Code", "Vary": "Origin", ...extra };
}
const json = (req, d, statut = 200, cache = "no-store") =>
  new Response(JSON.stringify(d), { status: statut, headers: entetes(req, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": cache }) });

async function sha256(t) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, "0")).join("");
}
async function codeBon(req, env) {
  const c = (req.headers.get("X-Code") || "").trim();
  return c.length >= 6 && (await sha256(c)) === env.CODE_SHA256;
}
const texte = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

async function lire(env) { return (await env.TUTTO.get("prix", "json")) || { maj: null, produits: [] }; }

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { headers: entetes(req) });
    if (req.method === "GET" && url.pathname === "/prix") {
      const d = await lire(env);
      return json(req, { maj: d.maj, produits: d.produits.filter(p => p.p != null) }, 200, "public, max-age=60");
    }
    if (req.method === "GET" && url.pathname.startsWith("/photo/")) {
      const img = await env.TUTTO.get("photo:" + url.pathname.slice(7), "arrayBuffer");
      if (!img) return new Response("absente", { status: 404, headers: entetes(req) });
      return new Response(img, { headers: entetes(req, { "Content-Type": "image/webp", "Cache-Control": "public, max-age=86400" }) });
    }
    if (req.method === "POST" && url.pathname === "/verifier") {
      return json(req, { ok: await codeBon(req, env) }, (await codeBon(req, env)) ? 200 : 403);
    }
    if (req.method === "POST" && url.pathname === "/prix") {
      if (!(await codeBon(req, env))) return json(req, { erreur: "code" }, 403);
      let b;
      try { b = await req.json(); } catch { return json(req, { erreur: "illisible" }, 400); }
      const id = texte(b.id, 60);
      if (!/^(cf|ge|tc):[\w.-]{1,50}$/.test(id)) return json(req, { erreur: "identifiant" }, 400);
      const p = b.p == null || b.p === "" ? null : Math.round(Number(String(b.p).replace(",", ".")) * 1000) / 1000;
      if (p != null && !(p > 0 && p < 10000)) return json(req, { erreur: "prix" }, 400);
      const d = await lire(env);
      const i = d.produits.findIndex(x => x.id === id);
      if (p == null) {                                              // produit retiré
        if (i >= 0) d.produits.splice(i, 1);
        if (id.startsWith("tc:")) await env.TUTTO.delete("photo:" + id);
      } else {
        const f = FAMILLES.includes(b.f) ? b.f : null;
        const prod = { id, n: texte(b.n, 120), m: texte(b.m, 40), f, q: texte(b.q, 40), p, s: b.s === false ? false : true, d: new Date().toISOString().slice(0, 10) };
        if (!prod.n || !f) return json(req, { erreur: "nom ou famille" }, 400);
        if (b.photo && id.startsWith("tc:")) {                       // photo prise par la boutique (WebP en base64, 300 Ko au plus)
          const bin = Uint8Array.from(atob(String(b.photo).replace(/^data:image\/\w+;base64,/, "")), c => c.charCodeAt(0));
          if (bin.length > 300000) return json(req, { erreur: "photo trop lourde" }, 400);
          await env.TUTTO.put("photo:" + id, bin);
          prod.i = 1;
        } else if (i >= 0 && d.produits[i].i) prod.i = 1;
        if (i >= 0) d.produits[i] = prod; else d.produits.push(prod);
      }
      if (d.produits.length > 3000) return json(req, { erreur: "trop de produits" }, 400);
      d.maj = new Date().toISOString();
      await env.TUTTO.put("prix", JSON.stringify(d));
      return json(req, { ok: true, nombre: d.produits.length });
    }
    // ---- commandes (21/11/2026, Ahmed : « mon ami gère les commandes, moi je veux juste pouvoir les voir si je veux »)
    // Le site note chaque commande PRÉPARÉE (le client ouvre WhatsApp ; on ne sait pas s'il l'envoie) : numéro, date, gouvernorat,
    // produits, total. JAMAIS le nom, le téléphone ni l'adresse du client (données personnelles : décision d'Ahmed à prendre).
    if (req.method === "POST" && url.pathname === "/commande") {
      let b;
      try { b = JSON.parse(await req.text()); } catch { return json(req, { erreur: "illisible" }, 400); }
      const num = texte(b.c, 20);
      if (!/^HM-\d{6}-[A-Z0-9]{4}$/.test(num)) return json(req, { erreur: "numéro" }, 400);
      const lignes = (Array.isArray(b.l) ? b.l : []).slice(0, 60).map(l => ({
        n: texte(l.n, 120), m: texte(l.m, 40), qt: texte(l.qt, 40), q: Math.max(1, Math.min(99, parseInt(l.q, 10) || 1)),
        p: Number(l.p) > 0 && Number(l.p) < 10000 ? Math.round(Number(l.p) * 1000) / 1000 : null, e: texte(l.e, 12), tc: !!l.tc }));
      if (!lignes.length) return json(req, { erreur: "vide" }, 400);
      const quand = new Date().toISOString();
      const cmd = { c: num, d: quand, g: texte(b.g, 30), l: lignes, t: Math.round(lignes.reduce((s, l) => s + (l.p || 0) * l.q, 0) * 1000) / 1000, langue: b.lang === "ar" ? "ar" : "fr" };
      await env.TUTTO.put("cmd:" + quand.slice(0, 10) + ":" + num, JSON.stringify(cmd), { expirationTtl: 60 * 60 * 24 * 400 });
      return json(req, { ok: true });
    }
    if (req.method === "GET" && url.pathname === "/commandes") {
      const c = (req.headers.get("X-Code") || "").trim();
      if (c.length < 6 || (await sha256(c)) !== env.ADMIN_SHA256) return json(req, { erreur: "code" }, 403);
      const cles = [];
      let curseur;
      do {
        const l = await env.TUTTO.list({ prefix: "cmd:", cursor: curseur });
        cles.push(...l.keys.map(k => k.name)); curseur = l.list_complete ? null : l.cursor;
      } while (curseur && cles.length < 3000);
      const recents = cles.sort().reverse().slice(0, 400);
      const cmds = (await Promise.all(recents.map(k => env.TUTTO.get(k, "json")))).filter(Boolean);
      return json(req, { total: cles.length, commandes: cmds });
    }
    return json(req, { erreur: "adresse inconnue" }, 404);
  }
};
