$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$utf8 = New-Object Text.UTF8Encoding $false
$h = [IO.File]::ReadAllText("$root\app\index.html")
$h = [regex]::Replace($h, '<script src="\.\./(assets/[^"?]+)[^"]*"></script>', {
  param($m)
  $js = [IO.File]::ReadAllText("$root\" + $m.Groups[1].Value.Replace('/', '\')).TrimStart([char]0xFEFF)
  '<script>' + $js.Replace('</script', '<\/script') + '</script>'
})
$h = [regex]::Replace($h, '<link[^>]*href="\.\./(assets/[^"?]+)[^"]*"[^>]*>', {
  param($m)
  '<style>' + [IO.File]::ReadAllText("$root\" + $m.Groups[1].Value.Replace('/', '\')).TrimStart([char]0xFEFF) + '</style>'
})
$out = "$root\FinOnTop-singolo.html"
[IO.File]::WriteAllText($out, $h, $utf8)
"Creato: $out ($([math]::Round((Get-Item $out).Length/1KB)) KB)"
