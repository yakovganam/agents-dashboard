@echo off
echo Starting Agents Dashboard...
echo.

echo Starting backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting frontend...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Dashboard is starting!
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Close the terminal windows to stop the servers
