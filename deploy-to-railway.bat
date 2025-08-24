@echo off
echo ======================================
echo Desplegando API a Railway
echo ======================================

cd /d c:\Users\rober\Desktop\historias-desopilantes-react\api-railway

echo.
echo 1. Desplegando la aplicación...
railway up

echo.
echo 2. Ejecutando script para crear tablas...
railway run node create-tables.js

echo.
echo ======================================
echo Despliegue completado!
echo ======================================
