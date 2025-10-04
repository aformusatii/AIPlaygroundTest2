@echo off
setlocal enabledelayedexpansion


rem set /p FILECONTENT=powershell -Command "Get-Content MyVaultPromptForCodex.md -Raw
rem codex -a never < cat 

set "content="
for /f "usebackq delims=" %%A in ("input.txt") do (
    set "content=!content! %%A"
)

"%content%"