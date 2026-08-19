# check-bom.ps1 — Détection BOM UTF-8 (EF BB BF)
# Compatible CI (GitHub Actions) et exécution interactive locale.
# Usage local : & { .\check-bom.ps1 }
# Usage CI    : automatique via .github/workflows/check-bom.yml

[CmdletBinding()]
param()

$bomFiles = Get-ChildItem -Recurse -Include "*.md","*.ts","*.tsx","*.json" -File |
    Where-Object {
        $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
        $bytes.Length -ge 3 -and
        $bytes[0] -eq 0xEF -and
        $bytes[1] -eq 0xBB -and
        $bytes[2] -eq 0xBF
    }

if ($bomFiles.Count -gt 0) {
    Write-Error "BOM detecte dans $($bomFiles.Count) fichier(s) :"
    $bomFiles | ForEach-Object { Write-Host "  - $($_.FullName)" -ForegroundColor Red }
    # exit 1 en CI pour bloquer le pipeline, return en interactif
    if ($env:CI) { exit 1 } else { return }
}

Write-Host "Aucun BOM detecte." -ForegroundColor Green
if ($env:CI) { exit 0 } else { return }
