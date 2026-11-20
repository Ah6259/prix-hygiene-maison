/* Page privée d'Ahmed : les commandes préparées sur le site (21/11/2026, « je veux juste être capable de voir les commandes si je veux »).
   Lit le carnet Cloudflare (GET /commandes, en-tête X-Code = code d'Ahmed, différent de celui de la boutique). Ne prévient personne. */
(function () {
  "use strict";
  var API = (document.querySelector('meta[name="hm-api"]') || {}).content || "https://api-hygiene.clicvia.com";
  var CLE = "hm_admin_code";
  var $ = function (id) { return document.getElementById(id); };
  var code = "", toutes = [];
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function dt(v) { return v == null ? "—" : Number(v).toFixed(3).replace(".", ",") + " DT"; }
  function quand(iso) { var d = new Date(iso); return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }) + " à " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); }
  var NOMS = { carrefour: "Carrefour", geant: "Géant", tutto: "Tutto Clean" };

  function charger() {
    return fetch(API + "/commandes", { headers: { "X-Code": code }, cache: "no-store" }).then(function (r) {
      if (r.status === 403) throw new Error("code");
      if (!r.ok) throw new Error("carnet injoignable (" + r.status + ")");
      return r.json();
    }).then(function (d) { toutes = (d.commandes || []).filter(function (c) { return c.c !== "HM-000000-TEST"; }); afficher(); });
  }
  function afficher() {
    var p = $("periode").value, depuis = p === "tout" ? 0 : Date.now() - Number(p) * 864e5;
    var l = toutes.filter(function (c) { return new Date(c.d).getTime() >= depuis; });
    var total = l.reduce(function (s, c) { return s + (c.t || 0); }, 0), articles = l.reduce(function (s, c) { return s + c.l.reduce(function (a, x) { return a + x.q; }, 0); }, 0);
    var aujourdHui = toutes.filter(function (c) { return new Date(c.d).toDateString() === new Date().toDateString(); }).length;
    var gouv = {}; l.forEach(function (c) { if (c.g) gouv[c.g] = (gouv[c.g] || 0) + 1; });
    var top = Object.keys(gouv).sort(function (a, b) { return gouv[b] - gouv[a]; })[0];
    $("chiffres").innerHTML = [
      [l.length, "commandes sur la période"], [aujourdHui, "aujourd'hui"], [articles, "articles"],
      [dt(total).replace(" DT", ""), "DT (total indicatif)"], [top || "—", "gouvernorat le plus fréquent"]
    ].map(function (x) { return '<div class="chiffre"><b>' + esc(x[0]) + "</b><span>" + esc(x[1]) + "</span></div>"; }).join("");
    $("commandes").innerHTML = l.length ? l.map(function (c) {
      var n = c.l.reduce(function (a, x) { return a + x.q; }, 0);
      return "<li><details><summary><span class=\"num\">" + esc(c.c) + '</span><span class="quand">' + esc(quand(c.d)) + "</span>" +
        (c.g ? '<span class="gouv">' + esc(c.g) + "</span>" : "") + "<span>" + n + " article" + (n > 1 ? "s" : "") + '</span><span class="tot">' + esc(dt(c.t)) + "</span></summary><table>" +
        c.l.map(function (x) {
          return '<tr><td class="q">' + x.q + " ×</td><td>" + esc((x.m ? x.m + " " : "") + x.n) + (x.qt ? " <small>(" + esc(x.qt) + ")</small>" : "") +
            '</td><td class="p">' + esc(dt(x.p)) + "<br><small>" + esc(x.tc ? "prix Tutto Clean" : (NOMS[x.e] || x.e || "")) + "</small></td></tr>";
        }).join("") + "</table></details></li>";
    }).join("") : '<li class="vide">Aucune commande sur cette période.</li>';
  }
  function ouvrir(c, garder) {
    code = c;
    return charger().then(function () {
      try { if (garder) localStorage.setItem(CLE, c); } catch (e) { /* appareil sans stockage : code à retaper */ }
      $("ecran-code").hidden = true; $("espace").hidden = false; $("btn-sortir").hidden = false;
    });
  }
  $("form-code").addEventListener("submit", function (ev) {
    ev.preventDefault();
    ouvrir($("code").value.trim(), $("souvenir").checked).catch(function (e) {
      $("erreur-code").textContent = e.message === "code" ? "Code incorrect." : "Problème : " + e.message; $("erreur-code").hidden = false;
    });
  });
  $("periode").addEventListener("change", afficher);
  $("btn-maj").addEventListener("click", function () { charger().catch(function () { /* garde l'affichage */ }); });
  $("btn-sortir").addEventListener("click", function () { try { localStorage.removeItem(CLE); } catch (e) { /* rien */ } location.reload(); });
  if (window.top !== window.self) { try { window.top.location = window.self.location; } catch (e) { document.body.innerHTML = ""; } }
  var garde = null; try { garde = localStorage.getItem(CLE); } catch (e) { /* rien */ }
  if (garde) ouvrir(garde, true).catch(function () { try { localStorage.removeItem(CLE); } catch (e) { /* rien */ } });
})();
