@echo off
cd /d "%~dp0"
echo Kite: http://127.0.0.1:8000/
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 -m http.server 8000 --bind 127.0.0.1
  goto :eof
)
where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server 8000 --bind 127.0.0.1
  goto :eof
)
echo Python 3 is required only by this local-server helper script.
exit /b 1
