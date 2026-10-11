# PHARMASOFT - Demarrage AUTOMATIQUE au boot du serveur (Planificateur Windows).
#
# Cree une tache "PHARMASOFT - Serveur" declenchee AU DEMARRAGE de Windows,
# qui lance l'application (npm run start, ecoute 0.0.0.0:PORT).
# Aucun outil externe a telecharger -> ideal hors-ligne.
#
# A lancer en ADMINISTRATEUR, une seule fois, sur le serveur, APRES `npm run build`.
#
# Usage :
#   powershell -ExecutionPolicy Bypass -File scripts\install-service.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\install-service.ps1 -Port 3000
#
# Desinstaller :  Unregister-ScheduledTask -TaskName "PHARMASOFT - Serveur" -Confirm:$false

param(
  [int]$Port = 3000,
  [string]$TaskName = "PHARMASOFT - Serveur"
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$startScript = Join-Path $scriptDir "start-server.ps1"

if (-not (Test-Path $startScript)) { throw "Introuvable : $startScript" }
if (-not (Test-Path (Join-Path $projectDir ".next"))) {
  Write-Warning "Le dossier .next est absent : avez-vous lance 'npm run build' ?"
}

$arg = "-ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -File `"$startScript`""

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $arg -WorkingDirectory $projectDir
$trigger = New-ScheduledTaskTrigger -AtStartup
# Pas de limite de duree (serveur permanent) + redemarrage si plantage.
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd `
  -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit (New-TimeSpan -Seconds 0)
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Variable d'env PORT pour la tache (via le script start-server.ps1).
$env:PORT = "$Port"

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null

Write-Host "Tache '$TaskName' creee : PHARMASOFT demarrera automatiquement au boot." -ForegroundColor Green
Write-Host "Demarrer maintenant : Start-ScheduledTask -TaskName '$TaskName'"
Write-Host "Etat               : Get-ScheduledTask -TaskName '$TaskName'"
Write-Host ""
Write-Host "NOTE : Node.js doit etre dans le PATH systeme (installer Node 'pour tous les utilisateurs')."