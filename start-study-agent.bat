@echo off
REM ============================================
REM Study Agent - Windows Startup Script
REM ============================================

echo Starting Study Agent...

REM Change to your project directory
cd /d "C:\Users\bebid\Desktop\Projects\Github\study-agent\study-agent"

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not running. Starting Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo Waiting for Docker to start...
    timeout /t 30 /nobreak >nul
)

REM Start the application
echo Starting Study Agent container...
docker-compose up -d

REM Check if container started successfully
docker ps | findstr "study-agent-app"
if %errorlevel% equ 0 (
    echo ✓ Study Agent is running!
    echo Access it at: http://localhost:3001
) else (
    echo × Failed to start Study Agent
    echo Check logs with: docker-compose logs
)

REM Keep window open for 5 seconds to see messages
timeout /t 5

exit