@echo off
rem Lance le serveur PHARMASOFT (Next.js) avec le Node embarque.
rem Utilise par la tache planifiee "PHARMASOFT-App" (demarrage au boot).
cd /d "%~dp0app"
set NODE_ENV=production
set PORT=3000
set NEXT_TELEMETRY_DISABLED=1
"%~dp0node\node.exe" "node_modules\next\dist\bin\next" start -H 0.0.0.0
