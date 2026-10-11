# PHARMASOFT - Cree un raccourci "PHARMASOFT" sur le Bureau (avec icone).
#
# Sur le PC SERVEUR (demarre le serveur + ouvre l'app) :
#   powershell -ExecutionPolicy Bypass -File scripts\creer-raccourci-bureau.ps1
#
# Sur un POSTE CLIENT (ouvre seulement l'app, serveur distant) :
#   powershell -ExecutionPolicy Bypass -File scripts\creer-raccourci-bureau.ps1 -Poste -ServeurIP 192.168.1.10 -Port 3000

param(
  [switch]$Poste,
  [string]$ServeurIP = "192.168.1.10",
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$icon = Join-Path $projectDir "public\pharmasoft.ico"
$desktop = [Environment]::GetFolderPath("Desktop")
$ws = New-Object -ComObject WScript.Shell

if ($Poste) {
  # Raccourci POSTE : ouvre Edge en mode application vers le serveur distant.
  $lnk = Join-Path $desktop "PHARMASOFT.lnk"
  $sc = $ws.CreateShortcut($lnk)
  $edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
  if (-not (Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
  $sc.TargetPath = $edge
  $sc.Arguments = "--app=http://$ServeurIP`:$Port"
  $sc.IconLocation = "$icon,0"
  $sc.Description = "Ouvrir PHARMASOFT (serveur $ServeurIP)"
  $sc.Save()
  Write-Host "Raccourci POSTE cree : $lnk  -> http://$ServeurIP`:$Port"
}
else {
  # Raccourci SERVEUR : lance le serveur puis ouvre l'app.
  $lnk = Join-Path $desktop "PHARMASOFT.lnk"
  $sc = $ws.CreateShortcut($lnk)
  $sc.TargetPath = Join-Path $projectDir "Lancer-PHARMASOFT-SERVEUR.bat"
  $sc.WorkingDirectory = $projectDir
  $sc.IconLocation = "$icon,0"
  $sc.Description = "Demarrer et ouvrir PHARMASOFT"
  $sc.WindowStyle = 7  # demarre minimise
  $sc.Save()
  Write-Host "Raccourci SERVEUR cree : $lnk"
}
