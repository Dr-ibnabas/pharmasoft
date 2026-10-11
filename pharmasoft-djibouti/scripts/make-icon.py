# -*- coding: utf-8 -*-
"""Genere l'icone PHARMASOFT (.ico multi-tailles) : croix de pharmacie
blanche sur fond bleu ciel arrondi. Sortie : public/pharmasoft.ico"""
import os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.dirname(HERE)
OUT = os.path.join(PROJECT, "public", "pharmasoft.ico")
os.makedirs(os.path.dirname(OUT), exist_ok=True)

SKY = (14, 165, 233, 255)   # #0EA5E9
SKY_DK = (2, 132, 199, 255)  # #0284C7
WHITE = (255, 255, 255, 255)


def render(size):
    # Supersampling x4 pour des bords nets
    s = size * 4
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pad = int(s * 0.06)
    radius = int(s * 0.22)
    # Fond arrondi degrade simple (deux rectangles superposes)
    d.rounded_rectangle([pad, pad, s - pad, s - pad], radius=radius, fill=SKY)
    d.rounded_rectangle([pad, int(s * 0.52), s - pad, s - pad], radius=radius, fill=SKY_DK)
    d.rounded_rectangle([pad, pad, s - pad, s - pad], radius=radius, outline=None, fill=None)
    # Re-dessine le haut pour un effet de bandeau plus clair
    d.rounded_rectangle([pad, pad, s - pad, int(s * 0.60)], radius=radius, fill=SKY)
    # Croix de pharmacie blanche, centree
    cx, cy = s // 2, s // 2
    arm = int(s * 0.30)   # longueur d'un bras
    thick = int(s * 0.115)  # demi-epaisseur
    r = int(s * 0.04)
    # barre verticale
    d.rounded_rectangle([cx - thick, cy - arm, cx + thick, cy + arm], radius=r, fill=WHITE)
    # barre horizontale
    d.rounded_rectangle([cx - arm, cy - thick, cx + arm, cy + thick], radius=r, fill=WHITE)
    return img.resize((size, size), Image.LANCZOS)


sizes = [256, 128, 64, 48, 32, 16]
imgs = [render(z) for z in sizes]
imgs[0].save(OUT, format="ICO", sizes=[(z, z) for z in sizes], append_images=imgs[1:])
print("Icone generee :", OUT, os.path.getsize(OUT), "octets")
