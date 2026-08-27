@echo off
REM ---------------------------------------------------------------------------
REM  Farm Marshal — build the offline USB package.
REM
REM  Produces dist-offline\ and FarmMarshal-Offline.zip.
REM  Copy the whole dist-offline folder to the stick and open index.html.
REM ---------------------------------------------------------------------------

cd /d "%~dp0.."

echo.
echo   Farm Marshal — building offline package
echo   ---------------------------------------
echo.

call npm run validate
if errorlevel 1 goto :failed

call npm test
if errorlevel 1 goto :failed

call node scripts/build-offline.mjs
if errorlevel 1 goto :failed

call node scripts/verify-build.mjs dist-offline
if errorlevel 1 goto :failed

echo.
echo   Done. Copy the dist-offline folder to the USB stick.
echo   Rehearse on the presenting laptop before the meeting, not after.
echo.
pause
exit /b 0

:failed
echo.
echo   BUILD FAILED — do not copy this to the stick.
echo   Read the output above.
echo.
pause
exit /b 1
