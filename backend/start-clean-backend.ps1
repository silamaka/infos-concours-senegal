param(
    [int]$Port = 8000,
    [string]$HostName = "127.0.0.1",
    [string]$PythonExe = "C:/Python313/python.exe",
    [switch]$NoRun
)

$ErrorActionPreference = "Stop"

Set-Location -Path $PSScriptRoot

Write-Host "[backend] Checking listeners on port $Port..."

$listeningPids = @()
try {
    $listeningPids = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique
} catch {
    $listeningPids = @()
}

if (-not $listeningPids -or $listeningPids.Count -eq 0) {
    $netstatLines = netstat -ano | Select-String ":$Port"
    foreach ($line in $netstatLines) {
        $parts = ($line.ToString().Trim() -split "\s+")
        if ($parts.Count -ge 5 -and $parts[3] -eq "LISTENING") {
            $pidValue = 0
            if ([int]::TryParse($parts[4], [ref]$pidValue)) {
                $listeningPids += $pidValue
            }
        }
    }
    $listeningPids = $listeningPids | Select-Object -Unique
}

foreach ($listenerPid in $listeningPids) {
    if ($listenerPid -gt 0 -and $listenerPid -ne $PID) {
        Write-Host "[backend] Stopping old process PID=$listenerPid on port $Port"
        Stop-Process -Id $listenerPid -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "[backend] Running Django checks..."
& $PythonExe manage.py check
if ($LASTEXITCODE -ne 0) {
    Write-Error "Django check failed."
    exit $LASTEXITCODE
}

if ($NoRun) {
    Write-Host "[backend] Check complete (NoRun mode)."
    exit 0
}

Write-Host "[backend] Starting server at http://$HostName`:$Port"
& $PythonExe manage.py runserver "$HostName`:$Port" --noreload
