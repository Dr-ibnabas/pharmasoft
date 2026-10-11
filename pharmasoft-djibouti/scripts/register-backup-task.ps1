# PHARMASOFT - Planifie une SAUVEGARDE AUTOMATIQUE quotidienne (Planificateur Windows).
#
# A lancer en tant qu'ADMINISTRATEUR, une seule fois, sur le serveur.
#
# Usage :
#   powershell -ExecutionPolicy Bypass -File scripts\register-backup-task.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\register-backup-task.ps1 -At "02:00" -BackupDir "D:\PHARMASOFT-BACKUPS"
#
# Cree une tache "PHARMASOFT - Sauvegarde quotidienne" qui execute scripts\backup.ps1.

param(
  [string]$At = "02:00",
  [string]$BackupDir,
  [int]$KeepDays = 30,
  [string]$TaskName = "PHARMASOFT - Sauvegarde quotidienne"
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backupScript = Join-Path $scriptDir "backup.ps1"

if (-not (Test-Path $backupScript)) { throw "Introuvable : $backupScript" }

# Arguments passes a backup.ps1
$inner = "-ExecutionPolicy Bypass -NoProfile -File `"$backupScript`" -KeepDays $KeepDays"
if ($BackupDir) { $inner += " -BackupDir `"$BackupDir`"" }

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $inner
$trigger = New-ScheduledTaskTrigger -Daily -At $At
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -RestartCount 2 -RestartInterval (New-TimeSpan -Minutes 5)
# Compte SYSTEM : la tache tourne meme sans session ouverte.
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null

Write-Host "Tache planifiee creee : '$TaskName' (tous les jours a $At)."
Write-Host "Verifier : Get-ScheduledTask -TaskName '$TaskName'"
Write-Host "Lancer maintenant pour tester : Start-ScheduledTask -TaskName '$TaskName'"