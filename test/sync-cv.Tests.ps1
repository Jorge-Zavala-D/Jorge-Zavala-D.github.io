$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$pdfs = @('Jorge_Zavala_CV.pdf', 'Jorge_Zavala_Academic_CV.pdf') | ForEach-Object {
  Join-Path $repoRoot "assets\pdf\$_"
}
$before = (Get-FileHash -LiteralPath $pdfs -Algorithm SHA256).Hash
$failed = $false
try { & (Join-Path $repoRoot 'scripts\sync-cv.ps1') -CompilerPath (Join-Path $repoRoot 'missing-compiler.exe') }
catch { if ($_.Exception.Message -notlike 'Compiler not found:*') { throw }; $failed = $true }
if (-not $failed) { throw 'A missing compiler must fail.' }
if (Compare-Object $before (Get-FileHash -LiteralPath $pdfs -Algorithm SHA256).Hash) { throw 'A failed build replaced a public CV.' }
Write-Output 'CV failure protection passed.'
$failed = $false
try { & (Join-Path $repoRoot 'scripts\sync-cv.ps1') -OverleafProject (Join-Path $PSScriptRoot 'fixtures\invalid-cv') }
catch { if ($_.Exception.Message -notlike 'CV compilation failed*') { throw }; $failed = $true }
if (-not $failed) { throw 'Invalid TeX must fail.' }
if (Compare-Object $before (Get-FileHash -LiteralPath $pdfs -Algorithm SHA256).Hash) { throw 'A TeX failure replaced a public CV.' }
Write-Output 'CV compilation-failure protection passed.'
