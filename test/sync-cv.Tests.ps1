$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$pdf = Join-Path $repoRoot 'assets\pdf\Jorge_Zavala_CV.pdf'
$before = (Get-FileHash -LiteralPath $pdf -Algorithm SHA256).Hash
$failed = $false
try { & (Join-Path $repoRoot 'scripts\sync-cv.ps1') -CompilerPath (Join-Path $repoRoot 'missing-compiler.exe') }
catch { $failed = $true }
if (-not $failed) { throw 'A missing compiler must fail.' }
if ((Get-FileHash -LiteralPath $pdf -Algorithm SHA256).Hash -ne $before) { throw 'A failed build replaced the public CV.' }
Write-Output 'CV failure protection passed.'
$failed = $false
try { & (Join-Path $repoRoot 'scripts\sync-cv.ps1') -OverleafProject (Join-Path $PSScriptRoot 'fixtures\invalid-cv') }
catch { $failed = $true }
if (-not $failed) { throw 'Invalid TeX must fail.' }
if ((Get-FileHash -LiteralPath $pdf -Algorithm SHA256).Hash -ne $before) { throw 'A TeX failure replaced the public CV.' }
Write-Output 'CV compilation-failure protection passed.'
