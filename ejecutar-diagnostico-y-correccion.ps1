Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Diagnóstico y Corrección DEFINITIVA de Endpoints" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Ir al directorio del proyecto
Set-Location -Path "c:\Users\rober\Desktop\historias-desopilantes-react"

# 1. EJECUTAR DIAGNÓSTICO
Write-Host "`n1. Ejecutando diagnóstico de endpoints..." -ForegroundColor Yellow
Set-Location -Path "c:\Users\rober\Desktop\historias-desopilantes-react\api-railway"
node diagnostico-endpoints.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n   ❌ Error al ejecutar el diagnóstico." -ForegroundColor Red
    exit 1
}

# Preguntar si desea continuar con la solución
Write-Host "`n¿Deseas aplicar la solución automatizada para los problemas detectados? (S/N)" -ForegroundColor Yellow
$respuesta = Read-Host
if ($respuesta -ne "S" -and $respuesta -ne "s") {
    Write-Host "`nOperación cancelada por el usuario." -ForegroundColor Yellow
    exit 0
}

# 2. APLICAR SOLUCIÓN
Write-Host "`n2. Aplicando solución a los problemas detectados..." -ForegroundColor Yellow
Set-Location -Path "c:\Users\rober\Desktop\historias-desopilantes-react"
node solucionar-endpoints-404.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n   ❌ Error al aplicar la solución." -ForegroundColor Red
    exit 1
}

# 3. DESPLEGAR A RAILWAY
Write-Host "`n3. Desplegando cambios a Railway..." -ForegroundColor Yellow
Set-Location -Path "c:\Users\rober\Desktop\historias-desopilantes-react\api-railway"
railway up
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n   ❌ Error al desplegar a Railway." -ForegroundColor Red
    exit 1
}

# 4. VERIFICAR DESPLIEGUE
Write-Host "`n4. Verificando el despliegue..." -ForegroundColor Yellow
Write-Host "   ⏳ Esperando a que se complete el despliegue (30 segundos)..." -ForegroundColor White
Start-Sleep -Seconds 30

node diagnostico-endpoints.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n   ⚠️ Advertencia al verificar el despliegue." -ForegroundColor Yellow
}

# 5. LIMPIAR CACHÉ DEL NAVEGADOR
Write-Host "`n5. Recomendaciones finales:" -ForegroundColor Yellow
Write-Host "   ⚠️ Es importante que limpies la caché de tu navegador:" -ForegroundColor White
Write-Host "   - Chrome: Ctrl+Shift+Del -> Marcar 'Imágenes y archivos en caché' -> Borrar datos" -ForegroundColor White
Write-Host "   - Firefox: Ctrl+Shift+Del -> Marcar 'Caché' -> Borrar" -ForegroundColor White
Write-Host "   - Edge: Ctrl+Shift+Del -> Marcar 'Datos y archivos almacenados en caché' -> Borrar" -ForegroundColor White

# Volver al directorio principal
Set-Location -Path "c:\Users\rober\Desktop\historias-desopilantes-react"

# RESUMEN FINAL
Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "¡Diagnóstico y Corrección Completados!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

Write-Host "`nPara verificar los cambios:" -ForegroundColor White
Write-Host "1. Abre una ventana de navegación privada/incógnito" -ForegroundColor Yellow
Write-Host "2. Visita: https://histostorias-desopilantes.web.app/historias" -ForegroundColor Yellow
Write-Host "3. Abre la consola del navegador (F12) y verifica que no hay errores 404" -ForegroundColor Yellow
