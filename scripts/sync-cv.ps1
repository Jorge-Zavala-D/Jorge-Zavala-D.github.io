[CmdletBinding()]
param(
  [string]$OverleafProject = 'C:\Users\jzava\Dropbox (Personal)\Apps\Overleaf\CV_Jorge Zavala',
  [string]$CompilerPath
)

$ErrorActionPreference = 'Stop'
$sources = [ordered]@{
  'Jorge_Zavala_Academic_CV.pdf' = Join-Path $OverleafProject 'CV_Jorge Zavala_ACADEMIC_ENG.tex'
  'Jorge_Zavala_CV.pdf' = Join-Path $OverleafProject 'CV_Jorge Zavala_ENG.tex'
}
$classPath = Join-Path $OverleafProject 'resume.cls'
$repoRoot = Split-Path -Parent $PSScriptRoot
foreach ($source in (@($sources.Values) + $classPath)) {
  if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "CV source not found: $source" }
}
if (-not $CompilerPath) {
  # Prefer the working MiKTeX installation over an incomplete TinyTeX on PATH.
  $miktex = Join-Path $env:LOCALAPPDATA 'Programs\MiKTeX\miktex\bin\x64\miktex-pdflatex.exe'
  if (Test-Path -LiteralPath $miktex) { $CompilerPath = $miktex }
  else {
    $compiler = Get-Command pdflatex, latexmk, tectonic -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $compiler) { throw 'No TeX compiler found. Install MiKTeX or pass -CompilerPath.' }
    $CompilerPath = $compiler.Source
  }
}
if (-not (Test-Path -LiteralPath $CompilerPath -PathType Leaf)) { throw "Compiler not found: $CompilerPath" }
$compilerName = [IO.Path]::GetFileNameWithoutExtension($CompilerPath)
if ($compilerName -notin @('pdflatex', 'miktex-pdflatex', 'latexmk', 'tectonic')) { throw "Unsupported CV compiler: $compilerName" }
$buildRoot = Join-Path $repoRoot ('output\cv-build\' + [guid]::NewGuid().ToString('N'))
$compiled = @{}
foreach ($filename in $sources.Keys) {
  $buildDir = Join-Path $buildRoot ([IO.Path]::GetFileNameWithoutExtension($filename))
  New-Item -ItemType Directory -Path $buildDir -Force | Out-Null
  Copy-Item -LiteralPath $sources[$filename] -Destination (Join-Path $buildDir 'cv.tex')
  if ($filename -eq 'Jorge_Zavala_CV.pdf') {
    Copy-Item -LiteralPath $classPath -Destination (Join-Path $buildDir 'resume.cls')
  }
  Push-Location $buildDir
  try {
    if ($compilerName -eq 'tectonic') {
      & $CompilerPath --untrusted --keep-logs cv.tex
      if ($LASTEXITCODE -ne 0) { throw "CV compilation failed; logs retained in $buildDir" }
    } elseif ($compilerName -eq 'latexmk') {
      & $CompilerPath -pdf -interaction=nonstopmode -halt-on-error -no-shell-escape cv.tex
      if ($LASTEXITCODE -ne 0) { throw "CV compilation failed; logs retained in $buildDir" }
    } else {
      foreach ($pass in 1..2) {
        & $CompilerPath -interaction=nonstopmode -halt-on-error -no-shell-escape cv.tex
        if ($LASTEXITCODE -ne 0) { throw "CV compilation failed on pass $pass; logs retained in $buildDir" }
      }
    }
    $compiled[$filename] = Join-Path $buildDir 'cv.pdf'
    $bytes = [IO.File]::ReadAllBytes($compiled[$filename])
    if ($bytes.Length -lt 1000 -or [Text.Encoding]::ASCII.GetString($bytes, 0, 5) -ne '%PDF-') { throw "Compiler output is not a valid PDF: $filename" }
  } finally { Pop-Location }
}

# Do not replace either public PDF until both compilations have succeeded.
foreach ($filename in $sources.Keys) {
  $sitePdf = Join-Path $repoRoot "assets\pdf\$filename"
  $replacement = "$sitePdf.$([IO.Path]::GetFileName($buildRoot)).new"
  [IO.File]::Copy($compiled[$filename], $replacement, $false)
  if (Test-Path -LiteralPath $sitePdf) { [IO.File]::Replace($replacement, $sitePdf, (Join-Path $buildRoot "previous-$filename")) }
  else { [IO.File]::Move($replacement, $sitePdf) }
  Write-Output "Updated CV: $sitePdf"
}
Write-Output "Builds retained for review: $buildRoot"
