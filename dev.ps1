# Starts the Next.js dev server using the portable Node on D:.
$ErrorActionPreference = "Stop"

# Node lives on D: — a real drive (not a sandboxed AppData folder).
$nodeDir = "D:\node-portable\node-v24.18.0-win-x64"

# Fallback for older installs.
if (-not (Test-Path (Join-Path $nodeDir "node.exe"))) {
  $alt = "C:\Users\pc\AppData\Local\nodejs\node-v24.18.0-win-x64"
  if (Test-Path (Join-Path $alt "node.exe")) { $nodeDir = $alt }
}

if (-not (Test-Path (Join-Path $nodeDir "node.exe"))) {
  Write-Host "ERROR: Node not found at $nodeDir" -ForegroundColor Red
  Read-Host "Press Enter to close"
  exit 1
}

$env:Path = "$nodeDir;$env:Path"
Set-Location $PSScriptRoot
Write-Host ("Using Node " + (& (Join-Path $nodeDir "node.exe") --version) + " from " + $nodeDir) -ForegroundColor Green
Write-Host "Starting... open http://localhost:3000 when you see 'Ready'" -ForegroundColor Cyan
& (Join-Path $nodeDir "npm.cmd") run dev
