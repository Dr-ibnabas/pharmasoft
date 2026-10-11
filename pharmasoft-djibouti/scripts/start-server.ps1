# PHARMASOFT - Demarre le serveur de production (ecoute sur tout le reseau local).
#
# Usage :  powershell -ExecutionPolicy Bypass -File scripts\start-server.ps1
#
# Equivaut a `npm run start` (next start -H 0.0.0.0) avec NODE_ENV=production.
# Le serveur ecoute sur 0.0.0.0:PORT -> accessible depuis les autres postes.

$ErrorActionPreference = "Stop"
$projectDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $projectDir

$env:NODE_ENV = "production"
if (-not $env:PORT) { $env:PORT = "3000" }

# Affiche les IP locales pour configurer les postes clients.
Write-Host "PHARMASOFT demarre sur le port $($env:PORT)." -ForegroundColor Cyan
Write-Host "Adresses d'acces depuis les autres postes :" -ForegroundColor Cyan
Get-NetIPaddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
  ForEach-Object { Write-Host ("  http://{0}:{1}" -f $_.IPAddress, $env:PORT) }

npm run start