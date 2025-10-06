@echo off
echo ========================================
echo   Interface Web Maia2
echo ========================================
echo.
echo Verification des dependances...
echo.

REM Check if Flask is installed
python -c "import flask" 2>NUL
if errorlevel 1 (
    echo Flask n'est pas installe. Installation en cours...
    pip install -r requirements-web.txt
) else (
    echo Flask est deja installe.
)

echo.
echo ========================================
echo Demarrage du serveur...
echo ========================================
echo.
echo L'interface sera disponible sur:
echo http://localhost:5000
echo.
echo Appuyez sur CTRL+C pour arreter le serveur
echo.

python app.py

pause

