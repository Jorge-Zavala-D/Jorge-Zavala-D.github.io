[CmdletBinding()]
param(
  [string]$OverleafProject = "C:\Users\jzava\Dropbox (Personal)\Apps\Overleaf\CV_Jorge Zavala",
  [string]$CompilerPath
)

$ErrorActionPreference = "Stop"

$texName = "CV_Jorge Zavala_ENG.tex"
$texPath = Join-Path $OverleafProject $texName
$classPath = Join-Path $OverleafProject "resume.cls"
$repoRoot = Split-Path -Parent $PSScriptRoot
$sitePdf = Join-Path $repoRoot "assets\pdf\Jorge_Zavala_CV.pdf"

if (-not (Test-Path -LiteralPath $texPath)) {
  throw "CV source not found: $texPath"
}
if (-not (Test-Path -LiteralPath $classPath)) {
  throw "CV class not found: $classPath"
}

if (-not $CompilerPath) {
  $compiler = Get-Command tectonic, latexmk -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $compiler) {
    throw "Install Tectonic or latexmk, or pass -CompilerPath to the compiler executable."
  }
  $CompilerPath = $compiler.Source
}

$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) "jorge-cv-build"
$buildDir = Join-Path $tempRoot ([guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $buildDir -Force | Out-Null

try {
  Copy-Item -LiteralPath $texPath -Destination (Join-Path $buildDir "cv.tex")
  Copy-Item -LiteralPath $classPath -Destination (Join-Path $buildDir "resume.cls")

  Push-Location $buildDir
  try {
    if ([System.IO.Path]::GetFileNameWithoutExtension($CompilerPath) -eq "latexmk") {
      & $CompilerPath -pdf -interaction=nonstopmode -halt-on-error "cv.tex"
    }
    else {
      & $CompilerPath "cv.tex"
    }

    if ($LASTEXITCODE -ne 0) {
      throw "CV compilation failed with exit code $LASTEXITCODE."
    }
  }
  finally {
    Pop-Location
  }

  $compiledPdf = Join-Path $buildDir "cv.pdf"
  if (-not (Test-Path -LiteralPath $compiledPdf)) {
    throw "Compilation completed without producing the expected PDF: $compiledPdf"
  }

  Copy-Item -LiteralPath $compiledPdf -Destination $sitePdf -Force
  Write-Output "Updated website CV: $sitePdf"
}
finally {
  if (Test-Path -LiteralPath $buildDir) {
    $resolvedBuild = (Resolve-Path -LiteralPath $buildDir).Path
    $resolvedTemp = (Resolve-Path -LiteralPath $tempRoot).Path
    if (-not $resolvedBuild.StartsWith($resolvedTemp + [IO.Path]::DirectorySeparatorChar)) {
      throw "Refusing cleanup outside the CV build directory: $resolvedBuild"
    }
    Remove-Item -LiteralPath $resolvedBuild -Recurse -Force
  }
}
