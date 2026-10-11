# PHARMASOFT - Nettoyage a la desinstallation (lance par l'installeur).
# Arrete et supprime la tache de l'app, le service PostgreSQL et la regle pare-feu.

param([Parameter(Mandatory = $true)][string]$AppDir, [int]$Port = 3000)
$ErrorActionPreference = "SilentlyContinue"

# 1) Tache de l'application
Stop-ScheduledTask -TaskName "PHARMASOFT-App"
Unregister-ScheduledTask -TaskName "PHARMASOFT-App" -Confirm:$false

# 2) Arreter les processus node (serveur de l'app)
Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
  Where-Object { $_.CommandLine -like "*$AppDir*" } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }

# 3) Service PostgreSQL
$svc = "PHARMASOFT-PostgreSQL"
if (Get-Service $svc -ErrorAction SilentlyContinue) {
  Stop-Service $svc -Force
  $pgctl = Join-Path $AppDir "pgsql\bin\pg_ctl.exe"
  if (Test-Path $pgctl) { & $pgctl unregister -N $svc }
  & sc.exe delete $svc | Out-Null
}

# 4) Regle pare-feu
Remove-NetFirewallRule -DisplayName "PHARMASOFT $Port"

Start-Sleep -Seconds 2
exit 0
