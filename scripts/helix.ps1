# HELIX thin Windows PowerShell entrypoint (ADR-001). checkout は source、package は dist。
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root "src\cli.ts"

if (Test-Path $source) {
    & node (Join-Path $root "node_modules\tsx\dist\cli.mjs") $source @args
    exit $LASTEXITCODE
}

& (Join-Path $root "dist\helix.exe") @args
exit $LASTEXITCODE
