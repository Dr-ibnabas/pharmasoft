# PHARMASOFT - Construit l'installeur unique PHARMASOFT-Setup.exe (Inno Setup).
#
# A lancer sur la machine de DEV (avec internet la 1re fois, pour Node/PostgreSQL/VC++).
# Resultat : <BuildDir>\out\PHARMASOFT-Setup.exe
#
# Prerequis : Inno Setup 6 installe (https://jrsoftware.org/isdl.php), Node + npm, Python (icone).
#
# Usage : powershell -ExecutionPolicy Bypass -File installer\build-installer.ps1

param(
  [string]$BuildDir = "C:\PHARMASOFT-BUILD",
  [string]$NodeVersion = "v20.18.1",
  [string]$PgBinariesUrl = "https://get.enterprisedb.com/postgresql/postgresql-16.6-1-windows-x64-binaries.zip"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$proj = Split-Path -Parent $scriptDir
$bundle = Join-Path $BuildDir "bundle"
New-Item -ItemType Directory -Force $bundle | Out-Null
New-Item -ItemType Directory -Force (Join-Path $BuildDir "out") | Out-Null

function RC($src, $dst) { robocopy $src $dst /E /NFL /NDL /NP /NJH /NJS /R:1 /W:1 | Out-Null }

$iscc = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if (-not (Test-Path $iscc)) { $iscc = "C:\Program Files\Inno Setup 6\ISCC.exe" }
if (-not (Test-Path $iscc)) { throw "Inno Setup 6 introuvable. Installez-le depuis https://jrsoftware.org/isdl.php" }

Write-Host "[1/6] Build de l'application (npm run build)..." -ForegroundColor Cyan
Push-Location $proj
$env:NEXT_TELEMETRY_DISABLED = "1"
npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "npm run build a echoue." }
Pop-Location

Write-Host "[2/6] Icone..." -ForegroundColor Cyan
if (-not (Test-Path (Join-Path $proj "public\pharmasoft.ico"))) {
  python (Join-Path $proj "scripts\make-icon.py")
}

Write-Host "[3/6] Copie de l'application (avec node_modules + .next)..." -ForegroundColor Cyan
RC $proj (Join-Path $bundle "app")
# Retirer ce qui ne doit pas etre embarque (best-effort)
foreach ($x in ".git", "backups", ".next\cache") {
  $p = Join-Path $bundle "app\$x"
  if (Test-Path $p) { cmd /c rmdir /s /q "`"$p`"" 2>$null }
}
foreach ($f in ".env", ".env.local") {
  $p = Join-Path $bundle "app\$f"
  if (Test-Path $p) { Remove-Item $p -Force }
}

Write-Host "[4/6] Node.js portable ($NodeVersion)..." -ForegroundColor Cyan
if (-not (Test-Path (Join-Path $bundle "node\node.exe"))) {
  $z = Join-Path $BuildDir "node.zip"
  Invoke-WebRequest "https://nodejs.org/dist/$NodeVersion/node-$NodeVersion-win-x64.zip" -OutFile $z -UseBasicParsing
  Expand-Archive $z (Join-Path $BuildDir "node-x") -Force
  $inner = (Get-ChildItem (Join-Path $BuildDir "node-x") -Directory | Select-Object -First 1).FullName
  RC $inner (Join-Path $bundle "node")
}

Write-Host "[5/6] PostgreSQL portable (bin + lib + share)..." -ForegroundColor Cyan
if (-not (Test-Path (Join-Path $bundle "pg\bin\initdb.exe"))) {
  $z = Join-Path $BuildDir "pg.zip"
  Invoke-WebRequest $PgBinariesUrl -OutFile $z -UseBasicParsing
  Expand-Archive $z (Join-Path $BuildDir "pg-x") -Force   # -> pgsql\
  foreach ($s in "bin", "lib", "share") {
    RC (Join-Path $BuildDir "pg-x\pgsql\$s") (Join-Path $bundle "pg\$s")
  }
}
# VC++ redist
if (-not (Test-Path (Join-Path $bundle "vc_redist.x64.exe"))) {
  Invoke-WebRequest "https://aka.ms/vs/17/release/vc_redist.x64.exe" -OutFile (Join-Path $bundle "vc_redist.x64.exe") -UseBasicParsing
}

Write-Host "[6/6] Compilation Inno Setup..." -ForegroundColor Cyan
& $iscc (Join-Path $scriptDir "PHARMASOFT.iss")
if ($LASTEXITCODE -ne 0) { throw "ISCC a echoue (code $LASTEXITCODE)." }

$exe = Join-Path $BuildDir "out\PHARMASOFT-Setup.exe"
Write-Host ""
Write-Host "TERMINE -> $exe" -ForegroundColor Green
if (Test-Path $exe) { Write-Host ("Taille : {0} Mo" -f [math]::Round((Get-Item $exe).Length/1MB,0)) }
