$ErrorActionPreference = "Stop"

$bat = Join-Path $PSScriptRoot "start-server.bat"
if (-not (Test-Path $bat)) {
  throw "未找到启动脚本: $bat"
}

$startup = [Environment]::GetFolderPath("Startup")
$linkPath = Join-Path $startup "MyWebCommentServer.lnk"

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($linkPath)
$shortcut.TargetPath = "cmd.exe"
$shortcut.Arguments = "/c `"$bat`""
$shortcut.WorkingDirectory = Split-Path -Parent $bat
$shortcut.WindowStyle = 7
$shortcut.Description = "Start My Web Comment Server"
$shortcut.Save()

Write-Host "已创建开机启动项：$linkPath"
