@echo off
rem npm install
if not exist ../../node_modules\nul (
  call npm install
)

rem SET FilePath=%~dp0
for %%I in (.) do set DIRNAME=%%~nI%%~xI

cd /d %~dp0
npx gulp --file %DIRNAME%
