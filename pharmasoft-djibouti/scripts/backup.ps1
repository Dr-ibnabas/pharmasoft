# PHARMASOFT - Sauvegarde PostgreSQL en LOCAL (pg_dump, format custom -Fc).
#
# Usage :
#   powershell -ExecutionPolicy Bypass -File scripts\backup.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\backup.ps1 -BackupDir "D:\PHARMASOFT-BACKUPS" -KeepDays 30
#
# Le script lit DATABASE_URL / PG_BIN_DIR / BACKUP_DIR depuis le fichier .env
# du projet (sauf si fournis en parametre). 100% hors-ligne.

param(
  [string]$BackupDir,
  [string]$PgBinDir,
  [int]$KeepDays = 30
)

$ErrorActionPreference = "Stop"
$projectDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# --- Lecture du .env (KEY="VALUE") -------------------------------------------
function Read-DotEnv {
  param([string]$Path)
  $map = @{}
  if (Test-Path $Path) {
    foreach ($line in Get-Content $Path) {
      $t = $line.Trim()
      if ($t -eq "" -or $t.StartsWith("#")) { continue }
      $i = $t.IndexOf("=")
      if ($i -lt 1) { continue }
      $k = $t.Substring(0, $i).Trim()
      $v = $t.Substring($i + 1).Trim().Trim('"').Trim("'")
      $map[$k] = $v
    }
  }
  return $map
}

$env_file = Join-Path $projectDir ".env"
if (-not (Test-Path $env_file)) { $env_file = Join-Path $projectDir ".env.local" }
$cfg = Read-DotEnv $env_file

$databaseUrl = if ($env:DATABASE_URL) { $env:DATABASE_URL } else { $cfg["DATABASE_URL"] }
if (-not $databaseUrl) { throw "DATABASE_URL introuvable (.env ou variable d'environnement)." }

if (-not $BackupDir) { $BackupDir = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { $cfg["BACKUP_DIR"] } }
if (-not $BackupDir) { $BackupDir = Join-Path $projectDir "backups" }

if (-not $PgBinDir) { $PgBinDir = if ($env:PG_BIN_DIR) { $env:PG_BIN_DIR } else { $cfg["PG_BIN_DIR"] } }

# --- Analyse de DATABASE_URL -------------------------------------------------
$u = [uri]$databaseUrl
$dbHost = if ($u.Host) { $u.Host } else { "localhost" }
$dbPort = if ($u.Port -gt 0) { $u.Port } else { 5432 }
$dbName = $u.AbsolutePath.TrimStart("/")
$userInfo = $u.UserInfo.Split(":")
$dbUser = [uri]::UnescapeDataString($userInfo[0])
$dbPass = if ($userInfo.Length -gt 1) { [uri]::UnescapeDataString($userInfo[1]) } else { "" }

# --- Localisation de pg_dump -------------------------------------------------
$pgDump = if ($PgBinDir) { Join-Path $PgBinDir "pg_dump.exe" } else { "pg_dump" }

# --- Sauvegarde --------------------------------------------------------------
if (-not (Test-Path $BackupDir)) { New-Item -ItemType Directory -Force $BackupDir | Out-Null }
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$target = Join-Path $BackupDir "pharmasoft-$stamp.dump"

Write-Host "Sauvegarde de '$dbName' ($dbHost`:$dbPort) -> $target"
$env:PGPASSWORD = $dbPass
& $pgDump "-h" $dbHost "-p" $dbPort "-U" $dbUser "-d" $dbName "-Fc" "-f" $target
$code = $LASTEXITCODE
$env:PGPASSWORD = ""

if ($code -ne 0) { throw "pg_dump a echoue (code $code)." }
$size = [math]::Round((Get-Item $target).Length / 1KB, 1)
Write-Host "OK : $target ($size Ko)"

# --- Rotation : suppression des sauvegardes trop anciennes -------------------
if ($KeepDays -gt 0) {
  $limit = (Get-Date).AddDays(-$KeepDays)
  Get-ChildItem $BackupDir -Filter "pharmasoft-*.dump" |
    Where-Object { $_.LastWriteTime -lt $limit } |
    ForEach-Object {
      Write-Host "Rotation : suppression $($_.Name)"
      Remove-Item $_.FullName -Force
    }
}

Write-Host "Termine."