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
    return json(req, { erreur: "adresse inconnue" }, 404);
  }
};
