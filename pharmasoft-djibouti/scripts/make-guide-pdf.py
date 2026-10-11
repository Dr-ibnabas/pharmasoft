# -*- coding: utf-8 -*-
"""
PHARMASOFT - Genere le guide imprimable du pharmacien (PDF A4, francais).
Usage : python scripts/make-guide-pdf.py
Sortie : docs/Guide-Pharmacien-PHARMASOFT.pdf
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    KeepTogether,
)

SKY = colors.HexColor("#0EA5E9")
SKY_DK = colors.HexColor("#0284C7")
SKY_50 = colors.HexColor("#E0F2FE")
INK = colors.HexColor("#0F172A")
MUTED = colors.HexColor("#475569")
AMBER_50 = colors.HexColor("#FEF3C7")
AMBER = colors.HexColor("#B45309")
GREEN_50 = colors.HexColor("#DCFCE7")
GREEN = colors.HexColor("#15803D")
BORDER = colors.HexColor("#CBD5E1")

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.dirname(HERE)
OUT_DIR = os.path.join(PROJECT, "docs")
os.makedirs(OUT_DIR, exist_ok=True)
OUT = os.path.join(OUT_DIR, "Guide-Pharmacien-PHARMASOFT.pdf")

styles = getSampleStyleSheet()
H2 = ParagraphStyle("H2", parent=styles["Heading2"], textColor=SKY_DK, fontSize=13,
                    spaceBefore=10, spaceAfter=4, leading=16)
BODY = ParagraphStyle("Body", parent=styles["Normal"], textColor=INK, fontSize=10,
                      leading=14, alignment=TA_LEFT)
SMALL = ParagraphStyle("Small", parent=BODY, fontSize=8.5, textColor=MUTED, leading=11)
LI = ParagraphStyle("LI", parent=BODY, leftIndent=10, bulletIndent=0, spaceAfter=2)
CELL = ParagraphStyle("Cell", parent=BODY, fontSize=9, leading=12)
CELLB = ParagraphStyle("CellB", parent=CELL, textColor=SKY_DK, fontName="Helvetica-Bold")


def box(text, bg, fg, border):
    p = Paragraph(text, ParagraphStyle("box", parent=BODY, textColor=fg, fontSize=9.5, leading=13))
    t = Table([[p]], colWidths=[170 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 0.8, border),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def bullets(items):
    flow = []
    for it in items:
        flow.append(Paragraph("&bull;&nbsp;&nbsp;" + it, LI))
    return flow


def section(title):
    return Paragraph(title, H2)


def simple_table(data, col_widths, header=True):
    t = Table(data, colWidths=col_widths, hAlign="LEFT")
    ts = [
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
    if header:
        ts += [("BACKGROUND", (0, 0), (-1, 0), SKY),
               ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
               ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
               ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")])]
    t.setStyle(TableStyle(ts))
    return t


def header_footer(canvas, doc):
    canvas.saveState()
    w, h = A4
    # Bandeau haut
    canvas.setFillColor(SKY)
    canvas.rect(0, h - 26 * mm, w, 26 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 20)
    canvas.drawString(18 * mm, h - 14 * mm, "PHARMASOFT")
    canvas.setFont("Helvetica", 10.5)
    canvas.drawString(18 * mm, h - 20 * mm, "Guide rapide du pharmacien - utilisation quotidienne")
    canvas.setFont("Helvetica", 9)
    canvas.drawRightString(w - 18 * mm, h - 16 * mm, "Logiciel de gestion de pharmacie")
    # Pied de page
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(18 * mm, 14 * mm, w - 18 * mm, 14 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(18 * mm, 9 * mm,
                      "Support technique : TECHCARE IT Solutions - techcareitaisolutions@gmail.com")
    canvas.drawRightString(w - 18 * mm, 9 * mm, "Page %d" % doc.page)
    canvas.restoreState()


def build():
    doc = BaseDocTemplate(
        OUT, pagesize=A4,
        leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=32 * mm, bottomMargin=18 * mm,
        title="PHARMASOFT - Guide du pharmacien", author="TECHCARE IT Solutions",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin,
                  doc.width, doc.height, id="main")
    doc.addPageTemplates([PageTemplate(id="all", frames=[frame], onPage=header_footer)])

    S = []

    S.append(Paragraph(
        "Ce guide explique l'utilisation au quotidien de PHARMASOFT. Il s'adresse a l'equipe "
        "de la pharmacie (titulaire, vendeurs, caissiers). Aucune connaissance technique requise.",
        BODY))
    S.append(Spacer(1, 4))
    S.append(box("<b>L'application fonctionne sans internet.</b> Tout est sur le serveur de la "
                 "pharmacie. Il n'y a rien a payer en ligne, rien a synchroniser.",
                 GREEN_50, GREEN, GREEN))

    # 1
    S.append(section("1. Chaque jour - allumage"))
    S.extend(bullets([
        "Le <b>PC serveur</b> (celui qui contient l'application) reste <b>allume en permanence</b>. "
        "Ne pas l'eteindre le soir.",
        "Verifier que l'<b>onduleur</b> du serveur est branche et charge (securite coupures de courant).",
        "Allumer simplement les postes de travail (comptoir, caisses) et ouvrir le navigateur.",
    ]))

    # 2
    S.append(section("2. Se connecter"))
    S.extend(bullets([
        "Ouvrir le navigateur (Chrome / Edge) sur le poste.",
        "Aller a l'adresse du serveur (a noter ci-dessous) :",
    ]))
    addr = Table([[Paragraph("Adresse de l'application :", CELL),
                   Paragraph("http://___________________ : 3000", CELLB)]],
                 colWidths=[55 * mm, 115 * mm])
    addr.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.8, SKY),
        ("BACKGROUND", (0, 0), (-1, -1), SKY_50),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    S.append(addr)
    S.append(Spacer(1, 4))
    S.extend(bullets([
        "Saisir son <b>email</b> et son <b>mot de passe</b>, puis valider.",
        "Conseil : creer un <b>raccourci</b> vers cette adresse sur le bureau de chaque poste.",
    ]))

    # 3 roles
    S.append(section("3. Les 4 roles"))
    roles = [
        [Paragraph("Role", CELL), Paragraph("A quoi il sert", CELL)],
        [Paragraph("<b>Super Admin</b>", CELL), Paragraph("Technique : utilisateurs, parametres, sauvegardes, journal d'activite.", CELL)],
        [Paragraph("<b>Pharmacien titulaire</b>", CELL), Paragraph("Acces complet : ventes, stock, clients, ordonnances, achats, rapports, prix d'achat.", CELL)],
        [Paragraph("<b>Vendeur</b>", CELL), Paragraph("Ventes au comptoir, catalogue, clients (sans voir les prix d'achat).", CELL)],
        [Paragraph("<b>Caissier</b>", CELL), Paragraph("Caisse et encaissement uniquement (validation par le titulaire pour les ordonnances).", CELL)],
    ]
    S.append(simple_table(roles, [45 * mm, 125 * mm]))

    # 4 usage
    S.append(section("4. Utilisation rapide"))
    S.extend(bullets([
        "<b>Vendre</b> : menu <b>Point de vente</b> -> chercher le medicament -> l'ajouter au panier -> "
        "choisir le mode de paiement (especes, carte, D-Money, Waafi, assurance, credit) -> <b>Encaisser</b>. "
        "Le ticket s'imprime.",
        "<b>Ordonnance</b> : pour un medicament sur ordonnance vendu par un caissier, l'application demande "
        "le <b>code PIN</b> du pharmacien titulaire pour valider.",
        "<b>Caisse</b> : menu <b>Caisse</b> -> <b>Ouvrir</b> en debut de journee (fond de caisse) -> "
        "<b>Cloturer</b> le soir (compter les especes, l'ecart s'affiche).",
        "<b>Langue et theme</b> : en haut a droite, on change la langue (Francais / Arabe / Anglais) "
        "et le mode clair / sombre.",
    ]))

    # 5 sauvegarde
    S.append(section("5. Sauvegarde - tres important"))
    S.append(box("<b>Une pharmacie sans sauvegarde risque de tout perdre</b> (panne de disque, vol, "
                 "incendie). Prendre l'habitude ci-dessous.", AMBER_50, AMBER, AMBER))
    S.append(Spacer(1, 4))
    S.extend(bullets([
        "Une <b>sauvegarde automatique</b> a lieu chaque nuit (vers 2h) sur le serveur.",
        "<b>Sauvegarde manuelle</b> : menu <b>Parametres</b> -> <b>Sauvegarde</b> -> "
        "bouton <b>Sauvegarder maintenant</b>.",
        "<b>Chaque semaine</b> : brancher la <b>cle USB</b>, cliquer <b>Telecharger</b> sur la derniere "
        "sauvegarde, et garder la cle <b>en dehors</b> de la pharmacie.",
    ]))

    # 6 problemes
    S.append(section("6. En cas de probleme"))
    probs = [
        [Paragraph("Situation", CELL), Paragraph("Que faire", CELL)],
        [Paragraph("La page semble bloquee", CELL), Paragraph("Appuyer sur <b>F5</b> (rafraichir). Reessayer.", CELL)],
        [Paragraph("Un poste ne se connecte pas", CELL), Paragraph("Verifier que le <b>PC serveur est allume</b> et le cable reseau branche. Tester l'adresse sur un autre poste.", CELL)],
        [Paragraph("Aucun poste ne fonctionne", CELL), Paragraph("Redemarrer le <b>PC serveur</b>. L'application redemarre toute seule (patienter 1-2 min).", CELL)],
        [Paragraph("Coupure de courant", CELL), Paragraph("L'onduleur prend le relais. Si le serveur s'eteint, le <b>rallumer en premier</b>, avant les postes.", CELL)],
        [Paragraph("Imprimante ticket", CELL), Paragraph("Verifier papier et cable USB. Reimprimer depuis l'historique de vente.", CELL)],
    ]
    S.append(simple_table(probs, [55 * mm, 115 * mm]))

    # 7 panne grave
    S.append(section("7. Panne grave / restauration"))
    S.extend(bullets([
        "En cas de panne du serveur ou de donnees corrompues, <b>ne pas manipuler la base</b> soi-meme.",
        "Contacter le support technique (en bas de page). La derniere sauvegarde permet de tout restaurer.",
        "Restauration depuis l'application : <b>Parametres -> Sauvegarde -> Restaurer</b> "
        "(reserve au titulaire / admin - <b>remplace</b> les donnees actuelles).",
    ]))

    S.append(Spacer(1, 6))
    S.append(box("<b>En resume :</b> serveur toujours allume - onduleur branche - sauvegarde sur cle USB "
                 "chaque semaine. Avec ces trois reflexes, vos donnees sont protegees.",
                 SKY_50, SKY_DK, SKY))

    doc.build(S)
    print("PDF genere :", OUT)


if __name__ == "__main__":
    build()
