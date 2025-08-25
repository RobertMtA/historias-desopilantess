Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Solución para errores 404 en endpoints de comentarios" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Ir al directorio de la API de Railway
Set-Location -Path "c:\Users\rober\Desktop\historias-desopilantes-react\api-railway"

Write-Host "`n1. Ejecutando script de corrección..." -ForegroundColor Yellow
node fix-404-comments.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n   ❌ Error al ejecutar el script de corrección. Revisa los mensajes anteriores." -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Desplegando la aplicación actualizada a Railway..." -ForegroundColor Yellow
railway up
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n   ❌ Error al desplegar a Railway. Revisa los mensajes anteriores." -ForegroundColor Red
    exit 1
}

Write-Host "`n3. Verificando estado de la API..." -ForegroundColor Yellow
railway run node check-status.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n   ⚠️ Advertencia: Problemas con el estado de la API." -ForegroundColor Yellow
}

Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "¡Solución implementada!" -ForegroundColor Green
Write-Host "Los errores 404 en /api/stories/:id/comments deberían estar resueltos." -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "`nPuedes verificar visitando tu aplicación en:" -ForegroundColor White
Write-Host "https://histostorias-desopilantes.web.app/historias" -ForegroundColor Yellow
