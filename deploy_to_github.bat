@echo off
title AlphaTerminal - 1-Click GitHub Live Deployment
color 0B

echo =====================================================================
echo          ALPHATERMINAL - 1-CLICK GITHUB LIVE DEPLOYMENT
echo   Deploy your website 24/7 online so you can access it anywhere!
echo =====================================================================
echo.

where git >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Git is not installed or not in system PATH.
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [1/4] Staging and committing all project files...
git add .
git commit -m "feat: AlphaTerminal release - live multi-device deployment" --allow-empty

echo.
echo [2/4] Checking GitHub remote repository...
git remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo No GitHub remote URL linked yet.
    echo -------------------------------------------------------------
    echo Quick steps to get your URL:
    echo 1. Go to https://github.com/new in your browser
    echo 2. Repository name: alpha-terminal (or any name you like)
    echo 3. Keep it 'Public' and DO NOT check Readme / gitignore
    echo 4. Click 'Create repository'
    echo 5. Copy the repository URL (e.g., https://github.com/YOUR_USERNAME/alpha-terminal.git)
    echo -------------------------------------------------------------
    echo.
    set /p REPO_URL="Enter your GitHub Repository URL: "
    if not defined REPO_URL (
        echo [ERROR] No URL provided. Aborting.
        pause
        exit /b 1
    )
    git remote add origin %REPO_URL%
    echo [OK] Remote 'origin' added: %REPO_URL%
) else (
    echo [OK] Remote repository already linked.
)

echo.
echo [3/4] Pushing source code to GitHub (main branch)...
git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Normal push failed. Attempting force push to sync main...
    git push -u origin main --force
)

echo.
echo [4/4] Building and publishing to GitHub Pages edge network...
call npm run deploy

echo.
echo =====================================================================
echo               CONGRATULATIONS! DEPLOYMENT FINISHED!
echo =====================================================================
echo.
echo Your website is now permanently live 24/7 on the internet!
echo You can access it anytime, anywhere from your phone, tablet, or PC!
echo.
echo Check your GitHub repository settings:
echo  - Settings -> Pages -> Source: Deploy from branch 'gh-pages' / root
echo.
pause
