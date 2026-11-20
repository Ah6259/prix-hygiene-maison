/* Page vidéo : « Partager la vidéo » partage le LIEN de cette page (menu du téléphone, sinon WhatsApp) + l'adresse du site ; clic compté. */
(function () {
  "use strict";
  var PAGE = "https://hygiene.clicvia.com/video/", SITE = "https://hygiene.clicvia.com/?v4";   // ?v4 : adresse neuve pour l'aperçu WhatsApp (voir partager() d'app.js)
  function partager() {
    var texte = "Entretien et hygiène, livrés chez vous — Tutto Clean\nLe site : " + SITE + "\nRegardez la vidéo :";
    if (window.goatcounter && goatcounter.count) { try { goatcounter.count({ path: "partage/video", title: "Partage vidéo", event: true }); } catch (e) { /* compteur absent */ } }
    function whatsapp() { window.open("https://wa.me/?text=" + encodeURIComponent(texte + " " + PAGE), "_blank", "noopener"); }
    if (navigator.share) navigator.share({ title: "Prix Hygiène & Maison", text: texte, url: PAGE }).catch(function (e) { if (!e || e.name !== "AbortError") whatsapp(); });
    else whatsapp();
  }
  ["btn-partager", "btn-partager-video"].forEach(function (id) { var b = document.getElementById(id); if (b) b.addEventListener("click", partager); });
  if (window.top !== window.self) { try { window.top.location = window.self.location; } catch (e) { document.body.innerHTML = ""; } }
})();
