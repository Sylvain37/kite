$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
$url = "http://127.0.0.1:8000/"
Write-Host "Kite: $url"
if (Get-Command py -ErrorAction SilentlyContinue) {
    & py -3 -m http.server 8000 --bind 127.0.0.1
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    & python -m http.server 8000 --bind 127.0.0.1
} else {
    Write-Error "Python 3 is required only by this local-server helper script."
}
