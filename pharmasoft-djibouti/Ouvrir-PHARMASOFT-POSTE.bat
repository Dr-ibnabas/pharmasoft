@echo off
chcp 65001 >nul
title PHARMASOFT

rem ============================================================
rem  PHARMASOFT - Raccourci pour un POSTE CLIENT (caisse, comptoir)
rem  Ouvre l'application dans une fenetre style "application".
rem
rem  >>> A PERSONNALISER une seule fois : <<<
rem  Remplacez l'adresse IP ci-dessous par celle du SERVEUR.
rem ============================================================

set SERVEUR=192.168.1.10
set PORT=3000

rem Ouvre Microsoft Edge en mode application (sans barre d'adresse).
start msedge --app=http://%SERVEUR%:%PORT%

rem Si Edge n'est pas disponible, ouvre le navigateur par defaut :
rem start "" "http://%SERVEUR%:%PORT%"
