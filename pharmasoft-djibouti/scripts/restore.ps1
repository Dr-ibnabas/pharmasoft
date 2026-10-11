# PHARMASOFT - Restauration PostgreSQL en LOCAL (pg_restore, format custom).
#
# DESTRUCTIF : ecrase les donnees actuelles (--clean --if-exists).
#
# Usage :
#   powershell -ExecutionPolicy Bypass -File scripts\restore.ps1 -File "D:\PHARMASOFT-BACKUPS\pharmasoft-20260604-020000.dump"
#   powershell -ExecutionPolicy Bypass -File scripts\restore.ps1 -File ".\backups\pharmasoft-...dump" -Force
#
# Lit DATABASE_URL / PG_BIN_DIR depuis le .env du projet.

param(
  [Parameter(Mandatory = $true)][string]$File,
  [string]$PgBinDir,
  [switch]$Force
)

$ErrorActionPreference = "Stop"
$projectDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

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

if (-not (Test-Path $File)) { throw "Fichier de sauvegarde introuvable : $File" }

$env_file = Join-Path $projectDir ".env"
if (-not (Test-Path $env_file)) { $env_file = Join-Path $projectDir ".env.local" }
$cfg = Read-DotEnv $env_file

$databaseUrl = if ($env:DATABASE_URL) { $env:DATABASE_URL } else { $cfg["DATABASE_URL"] }
if (-not $databaseUrl) { throw "DATABASE_URL introuvable (.env ou variable d'environnement)." }
if (-not $PgBinDir) { $PgBinDir = if ($env:PG_BIN_DIR) { $env:PG_BIN_DIR } else { $cfg["PG_BIN_DIR"] } }

$u = [uri]$databaseUrl
$dbHost = if ($u.Host) { $u.Host } else { "localhost" }
$dbPort = if ($u.Port -gt 0) { $u.Port } else { 5432 }
$dbName = $u.AbsolutePath.TrimStart("/")
$userInfo = $u.UserInfo.Split(":")
$dbUser = [uri]::UnescapeDataString($userInfo[0])
$dbPass = if ($userInfo.Length -gt 1) { [uri]::UnescapeDataString($userInfo[1]) } else { "" }

$pgRestore = if ($PgBinDir) { Join-Path $PgBinDir "pg_restore.exe" } else { "pg_restore" }

if (-not $Force) {
  Write-Host ""
  Write-Host "ATTENTION : la base '$dbName' va etre ECRASEE par : $File" -ForegroundColor Yellow
  $ans = Read-Host "Taper OUI pour confirmer"
  if ($ans -ne "OUI") { Write-Host "Annule."; exit 1 }
}

Write-Host "Restauration de '$dbName' depuis $File ..."
$env:PGPASSWORD = $dbPass
& $pgRestore "-h" $dbHost "-p" $dbPort "-U" $dbUser "-d" $dbName "--clean" "--if-exists" "--no-owner" "--no-privileges" "--single-transaction" $File
$code = $LASTEXITCODE
$env:PGPASSWORD = ""

if ($code -ne 0) { throw "pg_restore a echoue (code $code)." }
Write-Host "OK : base restauree. Redemarrez l'application si necessaire."