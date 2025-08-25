# Script para solucionar definitivamente errores de conexión PostgreSQL
Write-Host "🚀 Implementando solución definitiva para errores de conexión PostgreSQL..." -ForegroundColor Cyan

# Asegurar que estamos en el directorio correcto
$currentDir = Get-Location
$apiRailwayDir = Join-Path -Path $currentDir -ChildPath "api-railway"

if (-not (Test-Path -Path (Join-Path -Path $apiRailwayDir -ChildPath "server.js"))) {
    Write-Host "❌ Error: No se encontró el directorio api-railway o el archivo server.js" -ForegroundColor Red
    Write-Host "   Directorio actual: $currentDir" -ForegroundColor Yellow
    Write-Host "   Ejecute este script desde el directorio raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

Write-Host "📂 Verificando estructura de directorios..." -ForegroundColor Cyan
$libDir = Join-Path -Path $apiRailwayDir -ChildPath "lib"
if (-not (Test-Path -Path $libDir)) {
    Write-Host "📁 Creando directorio lib..." -ForegroundColor Yellow
    New-Item -Path $libDir -ItemType Directory | Out-Null
}

# Verificar que los archivos necesarios existen
$robustPgPath = Join-Path -Path $libDir -ChildPath "robust-postgres.js"
$implementScriptPath = Join-Path -Path $apiRailwayDir -ChildPath "implement-robust-postgres.js"

if (-not (Test-Path -Path $robustPgPath) -or -not (Test-Path -Path $implementScriptPath)) {
    Write-Host "❌ Error: No se encontraron los archivos necesarios" -ForegroundColor Red
    exit 1
}

# Ejecutar el script de implementación
Write-Host "🔄 Ejecutando script de implementación..." -ForegroundColor Cyan
Set-Location -Path $apiRailwayDir
node implement-robust-postgres.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al ejecutar el script de implementación" -ForegroundColor Red
    Set-Location -Path $currentDir
    exit 1
}

# Agregar cambios a git
Write-Host "📝 Agregando cambios a Git..." -ForegroundColor Cyan
git add server.js lib/robust-postgres.js implement-robust-postgres.js
git commit -m "Implementada solución definitiva para problemas de conexión PostgreSQL"

# Actualizar Railway
Write-Host "🚀 Desplegando en Railway..." -ForegroundColor Cyan
railway up

# Volver al directorio original
Set-Location -Path $currentDir

Write-Host "`n✅ Solución definitiva implementada y desplegada!" -ForegroundColor Green
Write-Host "El servidor ahora manejará automáticamente los problemas de conexión a PostgreSQL" -ForegroundColor Cyan
Write-Host "y continuará funcionando incluso si la base de datos no está disponible." -ForegroundColor Cyan
