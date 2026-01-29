@echo off
echo Setting up Agents Dashboard...
echo.

echo Installing backend dependencies...
cd backend
call npm install

if %errorlevel% neq 0 (
    echo Failed to install backend dependencies
    exit /b 1
)

echo Backend dependencies installed
cd ..

echo.
echo Installing frontend dependencies...
cd frontend
call npm install

if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies
    exit /b 1
)

echo Frontend dependencies installed
cd ..

if not exist frontend\.env (
    copy frontend\.env.example frontend\.env
    echo Created frontend\.env file
)

echo.
echo Setup complete!
echo.
echo To start the application:
echo   Backend:  cd backend ^&^& npm run dev
echo   Frontend: cd frontend ^&^& npm run dev
echo.
echo Or run: start.bat
