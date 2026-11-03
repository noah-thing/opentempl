# Installs the OpenTempl desktop app on Windows. In PowerShell:
#
#   irm https://opentempl.org/install.ps1 | iex
#
# It downloads the latest installer from https://github.com/noah-thing/opentempl/releases,
# checks it against the release's SHA256SUMS.txt and installs it for this user, without
# needing administrator rights. Run it again to update.
#
#   $env:OPENTEMPL_VERSION = '0.1.0'   install that version instead of the latest
#   $env:OPENTEMPL_NO_OPEN = '1'       do not start the app afterwards

& {
  $ErrorActionPreference = 'Stop'
  # Windows PowerShell 5 downloads many times slower while it draws a progress bar.
  $ProgressPreference = 'SilentlyContinue'
  [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

  $releases = 'https://github.com/noah-thing/opentempl/releases'

  if (-not [Environment]::Is64BitOperatingSystem) {
    throw 'OpenTempl needs 64 bit Windows. Use https://opentempl.org in the browser instead.'
  }

  $version = $env:OPENTEMPL_VERSION
  if ($version) {
    $version = $version.TrimStart('v')
  } else {
    # /releases/latest redirects to the newest tag. Reading the redirect avoids the API and its hourly limit.
    $req = [Net.HttpWebRequest]::Create("$releases/latest")
    $req.AllowAutoRedirect = $false
    $res = $req.GetResponse()
    $location = $res.Headers['Location']
    $res.Close()
    if ($location -notmatch '/tag/v(\d[^/]*)$') { throw 'Could not find the latest OpenTempl release.' }
    $version = $Matches[1]
  }

  $file = "OpenTempl-$version-win-x64.exe"
  $tmp = Join-Path ([IO.Path]::GetTempPath()) ("opentempl-" + [guid]::NewGuid())
  New-Item -ItemType Directory -Path $tmp | Out-Null
  try {
    $exe = Join-Path $tmp $file
    Write-Host "Downloading $file"
    Invoke-WebRequest -UseBasicParsing -Uri "$releases/download/v$version/$file" -OutFile $exe
    $sums = (Invoke-WebRequest -UseBasicParsing -Uri "$releases/download/v$version/SHA256SUMS.txt").Content
    if ($sums -is [byte[]]) { $sums = [Text.Encoding]::UTF8.GetString($sums) }
    $line = $sums -split "`n" | Where-Object { $_ -match ('^\s*([0-9a-f]{64})\s+\*?' + [regex]::Escape($file) + '\s*$') } | Select-Object -First 1
    if (-not $line) { throw "$file is missing from the checksums." }
    $want = ($line -split '\s+')[0]
    $got = (Get-FileHash -Algorithm SHA256 -Path $exe).Hash.ToLower()
    if ($got -ne $want) { throw "$file does not match its checksum. Nothing was installed." }

    Get-Process -Name OpenTempl -ErrorAction SilentlyContinue | ForEach-Object { Write-Host 'Closing OpenTempl to replace it'; $_.CloseMainWindow() | Out-Null; $_.WaitForExit(5000) | Out-Null }
    Write-Host 'Installing'
    $p = Start-Process -FilePath $exe -ArgumentList '/S' -Wait -PassThru
    if ($p.ExitCode -ne 0) { throw "The installer stopped with code $($p.ExitCode)." }
  } finally {
    Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
  }

  $app = Join-Path $env:LOCALAPPDATA 'Programs\OpenTempl\OpenTempl.exe'
  if (-not (Test-Path $app)) { throw "The installer finished, but $app is not there." }
  Write-Host "Installed OpenTempl $version. It is in the Start menu."
  if (-not $env:OPENTEMPL_NO_OPEN) { Start-Process -FilePath $app }
}
