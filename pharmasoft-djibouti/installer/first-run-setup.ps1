# PHARMASOFT - Configuration automatique apres installation (lancee par l'installeur).
# Initialise PostgreSQL (service), cree la base, applique migrations + seed,
# enregistre le demarrage auto de l'app et ouvre le pare-feu.
# Idempotent : peut etre relancee sans casser une installation existante.

param(
  [Parameter(Mandatory = $true)][string]$AppDir,
  [int]$Port = 3000,
  [string]$PharmacyName = "Pharmacie"
)

$ErrorActionPreference = "Stop"
$log = Join-Path $AppDir "install.log"
function Log($m) { $ts = (Get-Date).ToString("HH:mm:ss"); Add-Content -Path $log -Value "$ts  $m"; Write-Host $m }

try {
  Log "================ Configuration PHARMASOFT ================"
  $node   = Join-Path $AppDir "node\node.exe"
  $pgbin  = Join-Path $AppDir "pgsql\bin"
  $pgdata = Join-Path $AppDir "pgdata"
  $appdir = Join-Path $AppDir "app"
  $backup = Join-Path $AppDir "backups"
  $pgPass = "pharmasoft"
  $pgPort = 5432
  $svc    = "PHARMASOFT-PostgreSQL"
  $dbUrl  = "postgresql://postgres:$pgPass@localhost:$pgPort/pharmasoft?schema=public"
  New-Item -ItemType Directory -Force $backup | Out-Null

  # 1) Cluster PostgreSQL --------------------------------------------------
  if (-not (Test-Path (Join-Path $pgdata "PG_VERSION"))) {
    Log "Initialisation de la base (initdb)..."
    $pwf = Join-Path $AppDir "pw.tmp"
    Set-Content -Path $pwf -Value $pgPass -NoNewline -Encoding ascii
    & "$pgbin\initdb.exe" -D $pgdata -U postgres -A scram-sha-256 --pwfile=$pwf -E UTF8 --locale=C *>> $log
    Remove-Item $pwf -Force
  } else { Log "Cluster PostgreSQL deja initialise." }

  # 2) Service PostgreSQL --------------------------------------------------
  if (-not (Get-Service $svc -ErrorAction SilentlyContinue)) {
    Log "Enregistrement du service Windows $svc..."
    & "$pgbin\pg_ctl.exe" register -N $svc -D $pgdata -S auto -o "-p $pgPort" *>> $log
    Start-Sleep -Seconds 2
  }
  Log "Demarrage du service PostgreSQL..."
  Start-Service $svc -ErrorAction SilentlyContinue
  for ($i = 0; $i -lt 30; $i++) {
    & "$pgbin\pg_isready.exe" -h localhost -p $pgPort *> $null
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 1
  }

  # 3) Base de donnees -----------------------------------------------------
  $env:PGPASSWORD = $pgPass
  $exists = & "$pgbin\psql.exe" -U postgres -h localhost -p $pgPort -t -A -c "SELECT 1 FROM pg_database WHERE datname='pharmasoft';" 2>$null
  if (-not ("$exists".Trim() -eq "1")) {
    Log "Creation de la base 'pharmasoft'..."
    & "$pgbin\createdb.exe" -U postgres -h localhost -p $pgPort pharmasoft *>> $log
  } else { Log "Base 'pharmasoft' deja presente." }

  # 4) Fichier .env.local --------------------------------------------------
  $envLocal = Join-Path $appdir ".env.local"
  if (-not (Test-Path $envLocal)) {
    Log "Generation de la configuration (.env.local)..."
    $secret = & $node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
    $content = @"
DATABASE_URL="$dbUrl"
AUTH_SECRET="$secret"
BCRYPT_ROUNDS="12"
PORT="$Port"
PG_BIN_DIR="$pgbin"
BACKUP_DIR="$backup"
NEXT_PUBLIC_DEFAULT_LOCALE="fr"
NEXT_PUBLIC_TIMEZONE="Africa/Djibouti"
NEXT_PUBLIC_PHARMACY_NAME="$PharmacyName"
NEXT_TELEMETRY_DISABLED="1"
"@
    Set-Content -Path $envLocal -Value $content -Encoding UTF8
  } else { Log ".env.local deja present (conserve)." }

  # 5) Migrations + donnees initiales -------------------------------------
  Set-Location $appdir
  $env:DATABASE_URL = $dbUrl
  Log "Application des migrations de la base..."
  & $node "node_modules\prisma\build\index.js" migrate deploy *>> $log
  # Compter les utilisateurs via un fichier SQL (les guillemets de "User" sont
  # perdus si on passe la requete en ligne -c via PowerShell -> faux positif).
  $countSql = Join-Path $AppDir "count.sql"
  Set-Content -Path $countSql -Value 'SELECT count(*) FROM "User";' -Encoding ascii
  $userCount = & "$pgbin\psql.exe" -U postgres -h localhost -p $pgPort -d pharmasoft -t -A -f $countSql 2>$null
  Remove-Item $countSql -Force -ErrorAction SilentlyContinue
  if ([int]("$userCount".Trim()) -eq 0) {
    Log "Chargement des donnees initiales (seed)..."
    & $node "node_modules\tsx\dist\cli.mjs" "prisma\seed.ts" *>> $log
  } else { Log "Donnees deja presentes (seed ignore)." }

  # 6) Demarrage automatique de l'application -----------------------------
  Log "Configuration du demarrage automatique (tache planifiee)..."
  $runner   = Join-Path $AppDir "run-server.cmd"
  $action   = New-ScheduledTaskAction -Execute $runner
  $trigger  = New-ScheduledTaskTrigger -AtStartup
  $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd `
    -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1)
  Register-ScheduledTask -TaskName "PHARMASOFT-App" -Action $action -Trigger $trigger `
    -Principal $principal -Settings $settings -Force | Out-Null

  # 7) Pare-feu (acces depuis les autres postes) --------------------------
  if (-not (Get-NetFirewallRule -DisplayName "PHARMASOFT $Port" -ErrorAction SilentlyContinue)) {
    Log "Ouverture du port $Port dans le pare-feu..."
    New-NetFirewallRule -DisplayName "PHARMASOFT $Port" -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow | Out-Null
  }

  # 8) Demarrage immediat de l'application ---------------------------------
  Log "Demarrage de l'application..."
  Start-ScheduledTask -TaskName "PHARMASOFT-App"

  Log "================ Configuration terminee ! ================"
  exit 0
}
catch {
  Log "ERREUR: $($_.Exception.Message)"
  Log $_.ScriptStackTrace
  exit 1
}
