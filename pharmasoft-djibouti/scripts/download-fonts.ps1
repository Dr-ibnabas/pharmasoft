# PHARMASOFT - Telechargement des polices en LOCAL (woff2) pour next/font/local.
#
# A lancer UNE SEULE FOIS sur une machine AVEC internet (machine de dev).
# Les fichiers .woff2 sont ecrits dans src/app/fonts/ et commites au repo,
# afin que le BUILD et le RUNTIME fonctionnent ensuite 100% hors-ligne.
#
# Source : google-webfonts-helper (https://gwfh.mranftl.com) - pas de tracking Google.
#
# Usage :  powershell -ExecutionPolicy Bypass -File scripts\download-fonts.ps1

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$fontsDir = Join-Path $projectDir "src\app\fonts"
$tmp = Join-Path $env:TEMP "pharmasoft-fonts"

if (-not (Test-Path $fontsDir)) { New-Item -ItemType Directory -Force $fontsDir | Out-Null }
if (Test-Path $tmp) { Remove-Item -Recurse -Force $tmp }
New-Item -ItemType Directory -Force $tmp | Out-Null

# Famille -> { id, subsets, variants (token gwfh -> nom de sortie) }
$families = @(
  @{ id = "inter";          subsets = "latin";        variants = @{ "regular"="Inter-Regular"; "500"="Inter-Medium"; "600"="Inter-SemiBold"; "700"="Inter-Bold" } },
  @{ id = "jetbrains-mono"; subsets = "latin";        variants = @{ "regular"="JetBrainsMono-Regular"; "500"="JetBrainsMono-Medium"; "600"="JetBrainsMono-SemiBold" } },
  @{ id = "cairo";          subsets = "arabic,latin"; variants = @{ "regular"="Cairo-Regular"; "500"="Cairo-Medium"; "600"="Cairo-SemiBold"; "700"="Cairo-Bold" } }
)

foreach ($f in $families) {
  $id = $f.id
  $variantList = ($f.variants.Keys -join ",")
  $url = "https://gwfh.mranftl.com/api/fonts/$id" + "?download=zip&subsets=$($f.subsets)&variants=$variantList&formats=woff2"
  $zip = Join-Path $tmp "$id.zip"
  Write-Host "Downloading $id ($variantList) ..."
  Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing -TimeoutSec 60

  $extract = Join-Path $tmp $id
  Expand-Archive -Path $zip -DestinationPath $extract -Force

  foreach ($token in $f.variants.Keys) {
    $outName = $f.variants[$token] + ".woff2"
    # gwfh nomme : {id}-v##-{subset}-{token}.woff2  (token = "regular","500",...)
    $match = Get-ChildItem -Path $extract -Filter "*-$token.woff2" | Select-Object -First 1
    if ($null -eq $match) {
      Write-Warning "  introuvable: $id token=$token"
      continue
    }
    Copy-Item $match.FullName (Join-Path $fontsDir $outName) -Force
    Write-Host "  OK $outName"
  }
}

Remove-Item -Recurse -Force $tmp
Write-Host ""
Write-Host "Termine. Polices dans : $fontsDir"
Get-ChildItem $fontsDir -Filter *.woff2 | Select-Object Name, @{N="KB";E={[math]::Round($_.Length/1KB,1)}} | Format-Table -AutoSize