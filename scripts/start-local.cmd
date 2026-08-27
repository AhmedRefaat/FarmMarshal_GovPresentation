@echo off
REM ---------------------------------------------------------------------------
REM  Farm Marshal — start a local server for the presentation.
REM
REM  For rehearsing over HTTP with the access gate active. To present from a
REM  USB stick, you do not need this — open dist-offline\index.html directly.
REM ---------------------------------------------------------------------------

cd /d "%~dp0.."

echo.
echo   Farm Marshal presentation
echo   -------------------------
echo   Starting on http://127.0.0.1:8080
echo   Press Ctrl+C to stop.
echo.

npx --yes http-server . -p 8080 -c-1

if errorlevel 1 (
  echo.
  echo   Could not start the server. Is Node.js installed?
  echo   To present without a server, run scripts\build-presentation.cmd
  echo   and open dist-offline\index.html in Chrome or Edge.
  echo.
  pause
)
