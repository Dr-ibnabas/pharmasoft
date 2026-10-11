# PHARMASOFT - Mise en route HORS-LIGNE sur le serveur de la pharmacie.
#
# Enchaine : install deps -> prisma generate -> migrate deploy -> seed -> build.
# A lancer UNE FOIS apres avoir copie .env.local et installe PostgreSQL + Node.
#
# Usage :
#   powershell -ExecutionPolicy Bypass -File scripts\setup-offline.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\setup-offline.ps1 -SkipSeed   (ne pas recharger les donnees demo)

param(
  [switch]$SkipSeed,
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"
$projectDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $projectDir

Write-Host "=== PHARMASOFT - Setup hors-ligne ===" -ForegroundColor Cyan
Write-Host "Projet : $projectDir"

if (-not (Test-Path (Join-Path $projectDir ".env.local")) -and -not (Test-Path (Join-Path $projectDir ".env"))) {
  throw "Aucun .env.local trouve. Copiez .env.local.example vers .env.local et ajustez-le d'abord."
}

if (-not $SkipInstall) {
  Write-Host "`n[1/5] Installation des dependances (npm ci)..." -ForegroundColor Green
  if (Test-Path (Join-Path $projectDir "package-lock.json")) {
    npm ci
  } else {
    npm install
  }
  if ($LASTEXITCODE -ne 0) { throw "npm install a echoue." }
}

Write-Host "`n[2/5] Generation du client Prisma..." -ForegroundColor Green
npx prisma generate
if ($LASTEXITCODE -ne 0) { throw "prisma generate a echoue." }

Write-Host "`n[3/5] Application des migrations (prisma migrate deploy)..." -ForegroundColor Green
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) { throw "prisma migrate deploy a echoue (PostgreSQL demarre ? DATABASE_URL correct ?)." }

if (-not $SkipSeed) {
  Write-Host "`n[4/5] Chargement des donnees de demonstration (seed)..." -ForegroundColor Green
  npx prisma db seed
  if ($LASTEXITCODE -ne 0) { Write-Warning "Le seed a echoue ou a deja ete applique - on continue." }
} else {
  Write-Host "`n[4/5] Seed ignore (-SkipSeed)." -ForegroundColor Yellow
}

Write-Host "`n[5/5] Build de production (npm run build)..." -ForegroundColor Green
npm run build
if ($LASTEXITCODE -ne 0) { throw "Le build a echoue." }

Write-Host "`n=== Termine ! ===" -ForegroundColor Cyan
Write-Host "Lancer le serveur :   npm run start    (ou scripts\start-server.ps1)"
Write-Host "Demarrage auto au boot : scripts\install-service.ps1 (NSSM) ou PM2."