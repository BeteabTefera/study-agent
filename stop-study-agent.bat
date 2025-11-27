@echo off
REM ============================================
REM Study Agent - Windows Stop Script
REM ============================================

echo Stopping Study Agent...

REM Change to your project directory
cd /d "C:\Users\bebid\Desktop\Projects\Github\study-agent\study-agent"

REM Stop the container
docker-compose down

echo Study Agent stopped.
timeout /t 3

exit