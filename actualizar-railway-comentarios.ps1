# Script para actualizar y redesplegar Railway con soporte de comentarios
Write-Host "🔄 Actualizando servidor de Railway con endpoints de comentarios..." -ForegroundColor Cyan

# Cambiar al directorio de la API Railway
cd "$PSScriptRoot\api-railway"

# Verificar si estamos en el directorio correcto
if (-not (Test-Path "server.js")) {
    Write-Host "❌ Error: No se encontró el archivo server.js en el directorio actual." -ForegroundColor Red
    Write-Host "   Directorio actual: $PWD" -ForegroundColor Yellow
    exit 1
}

Write-Host "📂 Aplicando parche para endpoints de comentarios..." -ForegroundColor Cyan
node update-server-comments.js

# Verificar que el script se ejecutó correctamente
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al ejecutar script de actualización." -ForegroundColor Red
    exit 1
}

# Actualizar Git
Write-Host "📝 Añadiendo cambios a Git..." -ForegroundColor Cyan
git add server.js server-comments.js update-server-comments.js comments-endpoints-patch.js
git commit -m "Añadido soporte para endpoints de comentarios para resolver errores 404"

# Actualizar Railway
Write-Host "🚀 Redesplegando en Railway..." -ForegroundColor Cyan
railway up

Write-Host "`n✅ Proceso completado." -ForegroundColor Green
Write-Host "El servidor de Railway ahora debería manejar correctamente los endpoints de comentarios." -ForegroundColor Cyan
Write-Host "Verifica en el navegador que no haya errores 404 para /api/stories/:id/comments" -ForegroundColor Yellow
