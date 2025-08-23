@echo off
echo 🚀 Iniciando servidor persistente...
echo ⚡ Puerto: 3008
echo 🔄 Se reiniciará automáticamente si se cierra

:restart
echo.
echo %time% - Iniciando servidor...
node persistent-server.js
echo %time% - Servidor se cerró, reiniciando en 2 segundos...
timeout /t 2 >nul
goto restart
