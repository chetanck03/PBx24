@echo off
echo Killing any process on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a 2>nul
)
echo Port 3000 is now free!
echo.
echo Starting server...
npm start
