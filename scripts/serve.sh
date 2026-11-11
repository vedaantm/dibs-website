#!/usr/bin/env bash
# QA helper: (re)starts `next start` on :3000 in the background (Git Bash on Windows).
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { \$_.CommandLine -match 'next.*start' } | ForEach-Object { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
sleep 1
(npx next start -p 3000 > .next/serve.log 2>&1 &)
for i in $(seq 1 30); do curl -s -o /dev/null http://localhost:3000/ && break; sleep 1; done
echo "serving on :3000"
