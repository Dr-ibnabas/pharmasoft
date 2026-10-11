@echo off
chcp 65001 >nul
title PHARMASOFT - Serveur

rem ============================================================
rem  PHARMASOFT - Lanceur du SERVEUR (PC serveur de la pharmacie)
rem  Double-cliquez pour demarrer l'application.
rem  Laissez la fenetre OUVERTE pendant les heures de travail
rem  (la fermer ARRETE le serveur).
rem ============================================================

cd /d "%~dp0"

rem --- Choix automatique d'un port libre (3000 en priorite) ---
for /f %%P in ('powershell -NoProfile -Command "$ports=3000,3001,3002,3005,3009,3010; foreach($p in $ports){ if(-not (Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue)){ $p; break } }"') do set PORT=%%P
if not defined PORT set PORT=3000

echo.
echo   PHARMASOFT - demarrage du serveur (port %PORT%)...
echo   (ne fermez pas cette fenetre)
echo.

rem Demarre le serveur Next.js (ecoute 0.0.0.0 = accessible par les autres postes)
set NODE_ENV=production
set NEXT_TELEMETRY_DISABLED=1
start "PHARMASOFT (serveur)" /min cmd /c "set PORT=%PORT%&& npm run start"

echo   Patientez pendant le demarrage...
:attendre
timeout /t 2 >nul
powershell -NoProfile -Command "try { Invoke-WebRequest http://127.0.0.1:%PORT%/api/auth/session -UseBasicParsing -TimeoutSec 3 | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 goto attendre

echo   Pret ! Ouverture de l'application...
start msedge --app=http://127.0.0.1:%PORT%

echo.
echo   ------------------------------------------------------------
echo   Application demarree sur le port %PORT%.
echo   Depuis les AUTRES postes, ouvrez le navigateur a :
echo        http://[adresse-IP-de-ce-PC]:%PORT%
echo   (pour connaitre l'IP : invite de commandes, tapez  ipconfig )
echo   ------------------------------------------------------------
echo.
echo   Reduisez cette fenetre. Fermez-la pour ARRETER le serveur.
pause >nul
