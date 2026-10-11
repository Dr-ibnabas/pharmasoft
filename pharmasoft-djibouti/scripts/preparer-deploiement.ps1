# PHARMASOFT - Prepare un KIT DE DEPLOIEMENT (cle USB) pour une pharmacie.
#
# Copie le projet PRET A L'EMPLOI (avec node_modules) vers un dossier/cle USB,
# en EXCLUANT les fichiers de developpement (secrets, build local, sauvegardes, .git).
# Le serveur de la pharmacie n'aura alors PAS besoin d'internet pour npm install.
#
# Usage :
#   powershell -ExecutionPolicy Bypass -File scripts\preparer-deploiement.ps1 -Destination "E:\KIT-PHARMASOFT"
#
# Pensez a copier AUSSI sur la cle (a cote) :
#   - l'installeur Node.js LTS (.msi, Windows 64 bits)
#   - l'installeur PostgreSQL 16 (.exe, EnterpriseDB)

param(
  [Parameter(Mandatory = $true)][string]$Destination
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$target = Join-Path $Destination "pharmasoft-djibouti"

Write-Host "Source      : $projectDir"
Write-Host "Destination : $target"
Write-Host "Copie en cours (peut prendre quelques minutes a cause de node_modules)..."

# /E = sous-dossiers (meme vides) ; /XD = dossiers exclus ; /XF = fichiers exclus
# On EXCLUT : .git, .next (sera reconstruit sur le serveur avec la bonne config),
#             backups dev, le .env de dev (secrets/BDD locale), les logs.
# On GARDE  : node_modules (installation hors-ligne), src, prisma, public, scripts,
#             .env.local.example, README, Dockerfile, etc.
$rc = Start-Process robocopy -ArgumentList @(
  "`"$projectDir`"", "`"$target`"", "/E",
  "/XD", ".git", "$projectDir\.next", "$projectDir\backups",
  "/XF", ".env", ".env.local", "*.log",
  "/NFL", "/NDL", "/NP", "/R:1", "/W:1"
) -Wait -PassThru -NoNewWindow
# robocopy : codes 0-7 = succes
if ($rc.ExitCode -ge 8) { throw "robocopy a echoue (code $($rc.ExitCode))." }

# Copie le modele de config a la racine pour rappel
Copy-Item (Join-Path $projectDir ".env.local.example") (Join-Path $target ".env.local.example") -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "OK. Kit pret dans : $target" -ForegroundColor Green
Write-Host ""
Write-Host "A FAIRE ENSUITE sur la cle USB, ajoutez manuellement :"
Write-Host "  [ ] node-vXX-x64.msi        (Node.js LTS, Windows 64 bits)"
Write-Host "  [ ] postgresql-16-windows-x64.exe   (installeur PostgreSQL)"
Write-Host ""
Write-Host "Puis sur le SERVEUR de la pharmacie : voir README section INSTALLATION."
