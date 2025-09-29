@echo off
echo Killing processes on ports 3000-3005...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    if "%%a" neq "" (
        echo Killing process %%a on port 3000
        taskkill /F /PID %%a >nul 2>&1
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    if "%%a" neq "" (
        echo Killing process %%a on port 3001
        taskkill /F /PID %%a >nul 2>&1
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do (
    if "%%a" neq "" (
        echo Killing process %%a on port 3002
        taskkill /F /PID %%a >nul 2>&1
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3003') do (
    if "%%a" neq "" (
        echo Killing process %%a on port 3003
        taskkill /F /PID %%a >nul 2>&1
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3004') do (
    if "%%a" neq "" (
        echo Killing process %%a on port 3004
        taskkill /F /PID %%a >nul 2>&1
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3005') do (
    if "%%a" neq "" (
        echo Killing process %%a on port 3005
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo Done! All Node.js processes on ports 3000-3005 have been killed.
pause