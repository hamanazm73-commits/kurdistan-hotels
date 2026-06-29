# ===================================================================
# سێرڤەرێکی سادە بۆ پیشاندانی ماڵپەڕ (بەبێ Node/Python پێویست)
# بەکارهێنان:  کلیک-ڕاست لەسەر ئەم فایلە → Run with PowerShell
#          یان:  powershell -ExecutionPolicy Bypass -File serve.ps1
# پاشان لە وێبگەڕدا بکەرەوە:  http://localhost:8000/
# ===================================================================
param([int]$Port = 8000)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "هۆتێلەکانی کوردستان — http://localhost:$Port/  (Ctrl+C بۆ وەستان)"
$mime = @{
  ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8";
  ".js"="text/javascript; charset=utf-8"; ".json"="application/json; charset=utf-8";
  ".svg"="image/svg+xml"; ".png"="image/png"; ".jpg"="image/jpeg";
  ".jpeg"="image/jpeg"; ".ico"="image/x-icon"; ".woff2"="font/woff2"
}
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $path = [System.Uri]::UnescapeDataString($ctx.Request.Url.LocalPath.TrimStart('/'))
    if ([string]::IsNullOrEmpty($path)) { $path = "login.html" }
    $file = Join-Path $root $path
    if (Test-Path $file -PathType Leaf) {
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      if ($mime.ContainsKey($ext)) { $ctx.Response.ContentType = $mime[$ext] }
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("Not found: $path")
      $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
    }
    $ctx.Response.OutputStream.Close()
  } catch {
    Write-Host "err: $($_.Exception.Message)"
  }
}
