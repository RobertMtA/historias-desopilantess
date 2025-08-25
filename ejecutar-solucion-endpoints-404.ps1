Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Solución DEFINITIVA para errores 404 en la API" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Ir al directorio del proyecto
Set-Location -Path "c:\Users\rober\Desktop\historias-desopilantes-react"

Write-Host "`n1. Ejecutando script de corrección..." -ForegroundColor Yellow
node solucionar-endpoints-404.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n   ❌ Error al ejecutar el script de corrección. Revisa los mensajes anteriores." -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Reiniciando servidor local..." -ForegroundColor Yellow
$serverProcess = Start-Process -FilePath "powershell" -ArgumentList "-Command `"node servidor-ultra-robusto.js`"" -PassThru -WindowStyle Normal
Write-Host "   ✅ Servidor iniciado con PID: $($serverProcess.Id)" -ForegroundColor Green
Write-Host "   📋 El servidor está ejecutándose en http://localhost:4000" -ForegroundColor White

Write-Host "`n3. Desplegando a Railway..." -ForegroundColor Yellow
Set-Location -Path "c:\Users\rober\Desktop\historias-desopilantes-react\api-railway"
railway up
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n   ❌ Error al desplegar a Railway. Revisa los mensajes anteriores." -ForegroundColor Red
} else {
    Write-Host "`n   ✅ Desplegado correctamente a Railway" -ForegroundColor Green
}

# Volver al directorio principal
Set-Location -Path "c:\Users\rober\Desktop\historias-desopilantes-react"

Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "¡Solución implementada!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "`nPuedes verificar ambos entornos:" -ForegroundColor White
Write-Host "- Local: http://localhost:5173/historias" -ForegroundColor Yellow
Write-Host "- Producción: https://histostorias-desopilantes.web.app/historias" -ForegroundColor Yellow
Write-Host "`nPara detener el servidor local, cierra la ventana de PowerShell donde se ejecuta." -ForegroundColor White
