@echo off
rem Ouvre PHARMASOFT dans une fenetre "application" (Edge), sinon navigateur par defaut.
rem IMPORTANT : on utilise 127.0.0.1 (et PAS localhost) car le serveur ecoute en IPv4
rem (-H 0.0.0.0) ; sur Windows "localhost" pointe d'abord vers l'IPv6 ::1 -> page inaccessible.
set "URL=http://127.0.0.1:3000"
set "EDGE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=C:\Program Files\Microsoft\Edge\Application\msedge.exe"

rem Attendre que le serveur reponde (il peut encore demarrer), max ~60s.
echo Connexion a PHARMASOFT, veuillez patienter...
set /a tries=0
:wait
powershell -NoProfile -Command "try{Invoke-WebRequest http://127.0.0.1:3000/api/auth/session -UseBasicParsing -TimeoutSec 3 | Out-Null; exit 0}catch{exit 1}"
if not errorlevel 1 goto ready
set /a tries+=1
if %tries% GEQ 30 goto ready
timeout /t 2 >nul
goto wait

:ready
if exist "%EDGE%" ( start "" "%EDGE%" --app=%URL% ) else ( start "" "%URL%" )
