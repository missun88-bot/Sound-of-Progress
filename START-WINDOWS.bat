@echo off
setlocal
cd /d "%~dp0"

if not exist node_modules (
  echo Installing required packages...
  call npm install
  if errorlevel 1 (
    echo.
    echo Installation failed. Please check Node.js and your internet connection.
    pause
    exit /b 1
  )
)

echo.
echo Starting The Sound of Progress locally...
echo Keep this window open while viewing the story.
echo.
call npm run dev

pause
