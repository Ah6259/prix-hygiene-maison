"""QR code du site (21/11/2026, Ahmed : « ajoute un code à barres pour faciliter le partage du site »). Modèle : Code de la route.
On scanne l'écran (ou l'affiche imprimée en boutique) avec l'appareil photo du téléphone et on arrive sur le site.

Fabrique, dans assets/qr/ : hygiene-fr.svg / .png (https://hygiene.clicvia.com/) et hygiene-ar.svg / .png (…/ar/).
SVG = affiché dans la page (léger, net) ; PNG 1024 px = « Télécharger » (à envoyer sur WhatsApp ou à imprimer pour la boutique).
Noir sur blanc, marge de 4 modules, correction d'erreur « M » : se lit même sur un écran un peu sale ou une affiche abîmée.
Usage : python tools/qr_code.py    (outil `segno`, déjà installé sur le PC ; les images sont dans le dépôt, le robot n'en a pas besoin)."""
import os
import segno

ICI = os.path.dirname(os.path.abspath(__file__))
DOSSIER = os.path.join(os.path.dirname(ICI), "assets", "qr")
ADRESSES = {"fr": "https://hygiene.clicvia.com/", "ar": "https://hygiene.clicvia.com/ar/"}


def main():
    os.makedirs(DOSSIER, exist_ok=True)
    for langue, url in ADRESSES.items():
        qr = segno.make(url, error="m")
        base = os.path.join(DOSSIER, f"hygiene-{langue}")
        qr.save(base + ".svg", scale=8, border=4, dark="#0F3B47", light="#ffffff", xmldecl=False, svgns=True, title=url)
        qr.save(base + ".png", scale=max(1, 1024 // (qr.symbol_size(border=4)[0])), border=4, dark="#0F3B47", light="#ffffff")
        print(f"{langue} : {url} -> {base}.svg / .png ({qr.version}-{qr.error})")


if __name__ == "__main__":
    main()
