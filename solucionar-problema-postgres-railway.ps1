Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Solución para el error de conexión a PostgreSQL en Railway" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# Ir al directorio de la API de Railway
Set-Location -Path "c:\Users\rober\Desktop\historias-desopilantes-react\api-railway"

Write-Host "`n1. Verificando cambios realizados..." -ForegroundColor Yellow
$serverContent = Get-Content -Path "server.js" -Raw
if ($serverContent -match "const path = require\('path'\);") {
    Write-Host "   ✅ El módulo path ya está importado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ El módulo path no está importado correctamente. Revisa el archivo." -ForegroundColor Red
    exit 1
}

if ($serverContent -match "const fs = require\('fs'\);") {
    Write-Host "   ✅ El módulo fs ya está importado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ El módulo fs no está importado correctamente. Revisa el archivo." -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Desplegando a Railway..." -ForegroundColor Yellow
railway up
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n   ❌ Error al desplegar a Railway. Revisa los mensajes anteriores." -ForegroundColor Red
    exit 1
}

Write-Host "`n3. Verificando configuración de DATABASE_URL..." -ForegroundColor Yellow
railway run node check-database-url.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n   ⚠️ Advertencia: Problemas al verificar DATABASE_URL." -ForegroundColor Yellow
}

Write-Host "`n4. Verificando conexión a PostgreSQL..." -ForegroundColor Yellow
railway run node verify-database.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n   ⚠️ Advertencia: Problemas con la verificación de la base de datos." -ForegroundColor Yellow
}

Write-Host "`n5. Verificando estado general de la API..." -ForegroundColor Yellow
railway run node check-status.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n   ⚠️ Advertencia: Problemas con el estado de la API." -ForegroundColor Yellow
}

Write-Host "`n===================================================" -ForegroundColor Cyan
Write-Host "¡Solución implementada! El error de conexión debería estar resuelto." -ForegroundColor Green
Write-Host "Verifica en el dashboard de Railway que todo funciona correctamente." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
