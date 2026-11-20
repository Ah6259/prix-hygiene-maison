/* Espace Tutto Clean (page privée, 20/11/2026) : la boutique tape SES prix à côté des produits relevés chez Carrefour et Géant,
   ou ajoute ses propres produits (photo prise au téléphone). Enregistrement dans le carnet Cloudflare (api-hygiene.clicvia.com),
   protégé par le code de la boutique (jamais écrit dans le site : seule son empreinte est chez Cloudflare). */
(function () {
  "use strict";
  var API = (document.querySelector('meta[name="hm-api"]') || {}).content || "https://api-hygiene.clicvia.com";   // les tests la changent
  var CLE_CODE = "tutto_code";
  var PAR_PAGE = 30;
  var FAMILLES = [["linge", "Lessive & linge"], ["vaisselle", "Vaisselle"], ["maison", "Sols & surfaces"], ["javel", "Javel & WC"],
    ["desodorisant", "Désodorisants"], ["accessoires", "Éponges & sacs"], ["papier", "Papier & mouchoirs"], ["bebe", "Bébé"],
    ["feminine", "Hygiène féminine"], ["corps", "Savon & douche"], ["cheveux", "Cheveux"], ["bouche", "Dents"], ["soins", "Déodorant & rasage"]];
  var NOMS_ENS = { carrefour: "Carrefour", geant: "Géant" };
  var $ = function (id) { return document.getElementById(id); };
  var code = "", catalogue = [], miens = {}, fam = "", texte = "", seulement = false, montres = PAR_PAGE;
  var commandes = [], filtreEtat = "a-traiter";
  var ETATS = [["nouvelle", "Nouvelle"], ["confirmee", "Confirmée"], ["livree", "Livrée"], ["annulee", "Annulée"]];
  var NOMS_MAG = { carrefour: "Carrefour", geant: "Géant", tutto: "Tutto Clean" };

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function dt(v) { return v == null ? "" : Number(v).toFixed(3).replace(".", ","); }
  function prixLu(s) { var v = parseFloat(String(s || "").replace(/\s/g, "").replace(",", ".")); return v > 0 && v < 10000 ? Math.round(v * 1000) / 1000 : null; }

  function appel(chemin, corps) {
    return fetch(API + chemin, { method: corps ? "POST" : "GET", headers: corps ? { "Content-Type": "application/json", "X-Code": code } : { "X-Code": code },
      body: corps ? JSON.stringify(corps) : undefined, cache: "no-store" })
      .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.erreur || ("erreur " + r.status)); return d; }); });
  }

  /* ---------- code */
  function ouvrir(c, garder) {
    code = c;
    return fetch(API + "/verifier", { method: "POST", headers: { "X-Code": c } }).then(function (r) {
      if (!r.ok) throw new Error("code");
      try { if (garder) localStorage.setItem(CLE_CODE, c); } catch (e) { /* téléphone sans stockage : code à retaper */ }
      $("ecran-code").hidden = true; $("espace").hidden = false; $("btn-sortir").hidden = false;
      return Promise.all([fetch("../data/produits.json", { cache: "no-cache" }).then(function (r) { return r.json(); }), appel("/prix")]);
    }).then(function (res) {
      catalogue = res[0].produits || [];
      catalogue.forEach(function (p) { p._cle = window.sonRecherche ? sonRecherche.cle([p.m, p.n, p.q].join(" ")) : " " + [p.m, p.n].join(" ").toLowerCase() + " "; });
      miens = {}; (res[1].produits || []).forEach(function (p) { miens[p.id] = p; });
      afficherTout();
      chargerCommandes();
    });
  }
  function sortir() { try { localStorage.removeItem(CLE_CODE); } catch (e) { /* rien */ } location.reload(); }

  /* ---------- affichage */
  function liste() {
    var propres = Object.keys(miens).filter(function (id) { return id.indexOf("tc:") === 0; }).map(function (id) {
      var p = miens[id]; return { id: id, n: p.n, m: p.m, f: p.f, q: p.q, propre: true, _cle: window.sonRecherche ? sonRecherche.cle([p.m, p.n, p.q].join(" ")) : " " + (p.m + " " + p.n).toLowerCase() + " " };
    });
    var r = propres.concat(catalogue).filter(function (p) {
      if (fam && p.f !== fam) return false;
      if (seulement && !miens[p.id]) return false;
      if (texte && !(window.sonRecherche ? sonRecherche.trouve(p._cle, texte) : p._cle.indexOf(texte.toLowerCase()) >= 0)) return false;
      return true;
    });
    return r.sort(function (a, b) { return (miens[b.id] ? 1 : 0) - (miens[a.id] ? 1 : 0) || (a.m || "~").localeCompare(b.m || "~", "fr") || a.n.localeCompare(b.n, "fr"); });
  }
  function ligne(p) {
    var m = miens[p.id], img = p.propre ? (m && m.i ? API + "/photo/" + encodeURIComponent(p.id) : "") : (p.i ? "../" + p.i : "");
    var ref = p.propre ? "Votre produit" : "Vu chez " + (NOMS_ENS[p.e] || p.e) + " : " + dt(p.p) + " DT" + (p.q ? " · " + p.q : "");
    return '<li class="ligne' + (m ? " a-prix" : "") + '" data-id="' + esc(p.id) + '">' +
      (img ? '<img src="' + esc(img) + '" alt="" loading="lazy">' : '<span class="sans">🧴</span>') +
      '<div class="txt">' + (p.m ? '<div class="marque">' + esc(p.m) + "</div>" : "") + '<div class="nom">' + esc(p.n) + '</div><div class="ref">' + esc(ref) + "</div></div>" +
      '<div class="saisie"><input type="text" inputmode="decimal" aria-label="Mon prix en DT" placeholder="Mon prix" value="' + (m ? dt(m.p) : "") + '"> DT' +
      '<label><input type="checkbox" class="stock"' + (!m || m.s !== false ? " checked" : "") + "> En stock</label>" +
      '<button type="button" class="enr">Enregistrer</button>' + (m ? '<button type="button" class="ret">Retirer</button>' : "") +
      '<span class="etat" aria-live="polite"></span></div></li>';
  }
  function afficherTout() {
    var nb = Object.keys(miens).length, enStock = Object.keys(miens).filter(function (k) { return miens[k].s !== false; }).length;
    $("resume").innerHTML = "<b>" + nb + "</b> produit" + (nb > 1 ? "s" : "") + " avec votre prix sur le site (" + enStock + " en stock). " +
      '<a href="../" target="_blank" rel="noopener">Voir le site</a>';
    var compte = {}; catalogue.forEach(function (p) { compte[p.f] = (compte[p.f] || 0) + 1; });
    $("familles").innerHTML = '<button type="button" class="famille" data-f="" aria-pressed="' + (fam === "") + '"><b>Tout</b></button>' +
      FAMILLES.map(function (f) { return '<button type="button" class="famille" data-f="' + f[0] + '" aria-pressed="' + (fam === f[0]) + '"><b>' + esc(f[1]) + "</b><small>" + (compte[f[0]] || 0) + "</small></button>"; }).join("");
    var r = liste();
    $("compte").textContent = r.length + " produit" + (r.length > 1 ? "s" : "");
    $("lignes").innerHTML = r.slice(0, montres).map(ligne).join("") || '<li class="vide">Aucun produit. Ajoutez-le avec « Ajouter un produit qui n\'est pas dans la liste ».</li>';
    $("btn-plus").hidden = r.length <= montres;
  }

  /* ---------- enregistrer */
  function produitDe(id) {
    if (id.indexOf("tc:") === 0) return miens[id];
    for (var i = 0; i < catalogue.length; i++) if (catalogue[i].id === id) return catalogue[i];
    return null;
  }
  function enregistrer(li, retirer) {
    var id = li.getAttribute("data-id"), p = produitDe(id), etat = li.querySelector(".etat");
    var prix = retirer ? null : prixLu(li.querySelector("input[type=text]").value);
    if (!retirer && prix == null) { etat.className = "etat err"; etat.textContent = "Prix illisible (ex. 9,500)"; return; }
    etat.className = "etat"; etat.textContent = "…";
    appel("/prix", { id: id, n: p.n, m: p.m, f: p.f, q: p.q, p: prix, s: li.querySelector(".stock").checked })
      .then(function () {
        if (prix == null) delete miens[id]; else miens[id] = { id: id, n: p.n, m: p.m, f: p.f, q: p.q, p: prix, s: li.querySelector(".stock").checked, i: (miens[id] || {}).i };
        li.outerHTML = ligne(id.indexOf("tc:") === 0 ? { id: id, n: p.n, m: p.m, f: p.f, q: p.q, propre: true } : p);
        var n = document.querySelector('.ligne[data-id="' + id.replace(/"/g, "") + '"] .etat');
        if (n) { n.className = "etat ok"; n.textContent = prix == null ? "Retiré du site ✓" : "Enregistré ✓"; }
      })
      .catch(function (e) { etat.className = "etat err"; etat.textContent = e.message === "code" ? "Code refusé : rouvrez la page" : "Pas enregistré (" + e.message + ")"; });
  }

  /* ---------- ajouter un produit propre (photo réduite dans le téléphone : WebP 320 px) */
  function photoReduite(fichier) {
    return new Promise(function (ok) {
      if (!fichier) return ok(null);
      var img = new Image(), u = URL.createObjectURL(fichier);
      img.onload = function () {
        var k = Math.min(1, 320 / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        var g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(u);
        var d = c.toDataURL("image/webp", 0.75); ok(d.indexOf("data:image/webp") === 0 ? d : c.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = function () { ok(null); };
      img.src = u;
    });
  }
  function ajouter(ev) {
    ev.preventDefault();
    var f = $("form-ajout"), err = $("erreur-ajout"), prix = prixLu(f.p.value);
    if (!f.n.value.trim() || !f.f.value || prix == null) { err.textContent = "Remplissez le nom, la famille et un prix (ex. 9,500)."; err.hidden = false; return; }
    err.hidden = true;
    var id = "tc:" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    photoReduite(f.photo.files[0]).then(function (photo) {
      return appel("/prix", { id: id, n: f.n.value.trim(), m: f.m.value.trim().toUpperCase(), f: f.f.value, q: f.q.value.trim(), p: prix, s: true, photo: photo });
    }).then(function () {
      miens[id] = { id: id, n: f.n.value.trim(), m: f.m.value.trim().toUpperCase(), f: f.f.value, q: f.q.value.trim(), p: prix, s: true, i: f.photo.files.length ? 1 : 0 };
      f.reset(); err.textContent = "Ajouté sur le site ✓"; err.style.color = "var(--vert)"; err.hidden = false;
      seulement = false; fam = ""; texte = ""; $("q").value = ""; afficherTout();
    }).catch(function (e) { err.style.color = ""; err.textContent = "Pas ajouté (" + e.message + ")"; err.hidden = false; });
  }

  /* ---------- « Mes commandes » (21/11/2026) : commandes préparées sur le site, état noté par la boutique */
  function chargerCommandes() {
    return fetch(API + "/commandes", { headers: { "X-Code": code }, cache: "no-store" }).then(function (r) { return r.ok ? r.json() : { commandes: [] }; })
      .then(function (d) { commandes = (d.commandes || []).filter(function (c) { return c.c !== "HM-000000-TEST"; }); afficherCommandes(); })
      .catch(function () { $("liste-cmd").innerHTML = '<li class="vide">Commandes injoignables pour le moment : réessayez avec « Actualiser ».</li>'; });
  }
  function total(c) { return c.t != null ? c.t : c.l.reduce(function (s, x) { return s + (x.p || 0) * x.q; }, 0); }
  function aTraiter(c) { return c.s === "nouvelle" || c.s === "confirmee"; }
  function afficherCommandes() {
    var nbAT = commandes.filter(aTraiter).length;
    $("nb-a-traiter").hidden = !nbAT; $("nb-a-traiter").textContent = nbAT;
    var mois = new Date().toISOString().slice(0, 7), duMois = commandes.filter(function (c) { return c.d.slice(0, 7) === mois; });
    var livrees = duMois.filter(function (c) { return c.s === "livree"; });
    $("chiffres-cmd").innerHTML = [[nbAT, "à traiter"], [duMois.length, "ce mois-ci"], [livrees.length, "livrées ce mois"],
      [dt(livrees.reduce(function (s, c) { return s + total(c); }, 0)), "DT livrés ce mois"]]
      .map(function (x) { return "<div><b>" + esc(x[0]) + "</b><span>" + esc(x[1]) + "</span></div>"; }).join("");
    document.querySelectorAll("#filtres-cmd .puce").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-etat") === filtreEtat)); });
    var l = commandes.filter(function (c) { return filtreEtat === "a-traiter" ? aTraiter(c) : !filtreEtat || c.s === filtreEtat; });
    $("liste-cmd").innerHTML = l.length ? l.map(function (c) {
      var d = new Date(c.d), n = c.l.reduce(function (a, x) { return a + x.q; }, 0);
      return '<li class="cmd" data-s="' + esc(c.s) + '" data-k="' + esc(c.k) + '"><div class="cmd-tete"><span class="num">' + esc(c.c) + '</span><span class="quand">' +
        esc(d.toLocaleDateString("fr-FR") + " " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })) + "</span>" +
        (c.g ? '<span class="gouv">' + esc(c.g) + "</span>" : "") + '<span class="tot">' + n + " art. · " + esc(dt(total(c))) + " DT</span></div><ul>" +
        c.l.map(function (x) { return "<li>" + x.q + " × " + esc((x.m ? x.m + " " : "") + x.n) + (x.qt ? " (" + esc(x.qt) + ")" : "") + " — " + esc(dt(x.p)) + " DT " + esc(x.tc ? "(votre prix)" : "(" + (NOMS_MAG[x.e] || x.e || "") + ")") + "</li>"; }).join("") +
        '</ul><div class="etats">' + ETATS.map(function (e) { return '<button type="button" data-etat="' + e[0] + '" aria-pressed="' + (c.s === e[0]) + '">' + e[1] + "</button>"; }).join("") +
        '</div><span class="etat-msg" aria-live="polite"></span></li>';
    }).join("") : '<li class="vide">' + (filtreEtat === "a-traiter" ? "Aucune commande à traiter. 👍" : "Aucune commande ici.") + "</li>";
  }
  function changerEtat(li, etat) {
    var k = li.getAttribute("data-k"), msg = li.querySelector(".etat-msg");
    msg.textContent = "…";
    appel("/commande-etat", { k: k, s: etat }).then(function () {
      commandes.forEach(function (c) { if (c.k === k) c.s = etat; });
      afficherCommandes();
    }).catch(function (e) { msg.textContent = "Pas enregistré (" + e.message + ")"; msg.style.color = "var(--rouge)"; });
  }
  function montrerOnglet(lequel) {
    var cmd = lequel === "commandes";
    $("onglet-commandes").hidden = !cmd; $("onglet-prix").hidden = cmd;
    $("onglet-btn-commandes").setAttribute("aria-pressed", String(cmd)); $("onglet-btn-prix").setAttribute("aria-pressed", String(!cmd));
    if (cmd) chargerCommandes();
  }

  /* ---------- démarrage */
  function demarrer() {
    $("ajout-famille").innerHTML = '<option value="">Choisir…</option>' + FAMILLES.map(function (f) { return '<option value="' + f[0] + '">' + esc(f[1]) + "</option>"; }).join("");
    $("form-code").addEventListener("submit", function (ev) {
      ev.preventDefault();
      ouvrir($("code").value.trim(), $("souvenir").checked).catch(function () { $("erreur-code").textContent = "Code incorrect."; $("erreur-code").hidden = false; });
    });
    $("btn-sortir").addEventListener("click", sortir);
    $("onglet-btn-prix").addEventListener("click", function () { montrerOnglet("prix"); });
    $("onglet-btn-commandes").addEventListener("click", function () { montrerOnglet("commandes"); });
    $("filtres-cmd").addEventListener("click", function (ev) { var b = ev.target.closest(".puce"); if (b) { filtreEtat = b.getAttribute("data-etat"); afficherCommandes(); } });
    $("btn-actualiser").addEventListener("click", chargerCommandes);
    $("liste-cmd").addEventListener("click", function (ev) { var b = ev.target.closest("[data-etat]"); if (b) changerEtat(b.closest(".cmd"), b.getAttribute("data-etat")); });
    $("form-ajout").addEventListener("submit", ajouter);
    $("familles").addEventListener("click", function (ev) { var b = ev.target.closest(".famille"); if (!b) return; fam = b.getAttribute("data-f"); montres = PAR_PAGE; afficherTout(); });
    var t; $("q").addEventListener("input", function () { clearTimeout(t); t = setTimeout(function () { texte = $("q").value.trim(); montres = PAR_PAGE; afficherTout(); }, 200); });
    $("seulement-miens").addEventListener("change", function () { seulement = $("seulement-miens").checked; montres = PAR_PAGE; afficherTout(); });
    $("btn-plus").addEventListener("click", function () { montres += PAR_PAGE; afficherTout(); });
    $("lignes").addEventListener("click", function (ev) {
      var li = ev.target.closest(".ligne"); if (!li) return;
      if (ev.target.classList.contains("enr")) enregistrer(li, false);
      if (ev.target.classList.contains("ret")) enregistrer(li, true);
    });
    $("lignes").addEventListener("keydown", function (ev) { if (ev.key === "Enter" && ev.target.matches("input[type=text]")) enregistrer(ev.target.closest(".ligne"), false); });
    var garde = null; try { garde = localStorage.getItem(CLE_CODE); } catch (e) { /* rien */ }
    if (garde) ouvrir(garde, true).catch(function () { try { localStorage.removeItem(CLE_CODE); } catch (e) { /* rien */ } });
  }
  if (window.top !== window.self) { try { window.top.location = window.self.location; } catch (e) { document.body.innerHTML = ""; } }
  demarrer();
})();
