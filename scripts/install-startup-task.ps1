$ErrorActionPreference = "Stop"

$taskName = "MyWebCommentServer"
$bat = Join-Path $PSScriptRoot "start-server.bat"

if (-not (Test-Path $bat)) {
  throw "未找到启动脚本: $bat"
}

$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"`"$bat`"`""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Force | Out-Null

Write-Host "已创建开机自启任务: $taskName"
Write-Host "可用下面命令删除：Unregister-ScheduledTask -TaskName $taskName -Confirm:`$false"
