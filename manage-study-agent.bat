@echo off
REM ============================================
REM Study Agent - Management Script
REM ============================================

cd /d "C:\Users\bebid\Desktop\Projects\Github\study-agent\study-agent"

:menu
cls
echo ========================================
echo    Study Agent - Management Menu
echo ========================================
echo.
echo 1. Start Study Agent
echo 2. Stop Study Agent
echo 3. Restart Study Agent
echo 4. View Logs
echo 5. Check Status
echo 6. Rebuild Container
echo 7. Open in Browser
echo 8. Exit
echo.
set /p choice="Choose an option (1-8): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto logs
if "%choice%"=="5" goto status
if "%choice%"=="6" goto rebuild
if "%choice%"=="7" goto browser
if "%choice%"=="8" goto end
goto menu

:start
echo Starting Study Agent...
docker-compose up -d
echo Done!
timeout /t 3
goto menu

:stop
echo Stopping Study Agent...
docker-compose down
echo Done!
timeout /t 3
goto menu

:restart
echo Restarting Study Agent...
docker-compose restart
echo Done!
timeout /t 3
goto menu

:logs
echo Showing logs (Press Ctrl+C to exit)...
docker-compose logs -f study-agent
goto menu

:status
echo Checking status...
docker ps | findstr "study-agent"
echo.
echo Container details:
docker inspect study-agent-app --format='{{.State.Status}}'
timeout /t 5
goto menu

:rebuild
echo Rebuilding container...
docker-compose up -d --build
echo Done!
timeout /t 3
goto menu

:browser
echo Opening in browser...
start http://localhost:3001
timeout /t 2
goto menu

:end
exit