# Script para actualizar la estructura de tablas en Supabase
# Este script adapta las tablas existentes al formato requerido por Supabase
# y configura la seguridad mediante RLS

Write-Host "=== Actualizando estructura de tablas en Supabase ===" -ForegroundColor Cyan
Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

# Verificar si existe el archivo .env
if (-Not (Test-Path ".env")) {
    Write-Host "Creando archivo .env para credenciales de Supabase..." -ForegroundColor Yellow
    
    # Solicitar credenciales de Supabase
    $supabaseUrl = Read-Host "Ingresa tu URL de Supabase (ej: https://tu-proyecto.supabase.co)"
    $supabaseKey = Read-Host "Ingresa tu clave de servicio de Supabase (service_role key)"
    
    # Crear archivo .env
    @"
SUPABASE_URL=$supabaseUrl
SUPABASE_KEY=$supabaseKey
"@ | Out-File -FilePath ".env" -Encoding utf8
    
    Write-Host "Archivo .env creado correctamente" -ForegroundColor Green
}

# Verificar si están instaladas las dependencias necesarias
Write-Host "Verificando dependencias necesarias..." -ForegroundColor Yellow
$packageJson = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
$dependencias = $packageJson.dependencies

if (-Not ($dependencias.'@supabase/supabase-js')) {
    Write-Host "Instalando @supabase/supabase-js..." -ForegroundColor Yellow
    npm install @supabase/supabase-js dotenv --save
} else {
    Write-Host "Dependencia @supabase/supabase-js ya instalada" -ForegroundColor Green
}

# Ejecutar proceso en orden
$opcion = Read-Host "¿Deseas actualizar la estructura de tablas y configurar RLS? (s/n)"

if ($opcion -eq "s") {
    # 1. Actualizar estructura de tablas
    Write-Host "`n1. Actualizando estructura de tablas..." -ForegroundColor Yellow
    node actualizar-estructura-tablas-supabase.js
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al actualizar la estructura de tablas" -ForegroundColor Red
        exit 1
    }
    
    # 2. Configurar RLS
    Write-Host "`n2. Configurando Row Level Security..." -ForegroundColor Yellow
    node habilitar-rls-supabase.js
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al configurar RLS" -ForegroundColor Red
        exit 1
    }
    
    # Mensaje de éxito
    Write-Host "`n✅ Proceso completado correctamente" -ForegroundColor Green
    Write-Host "La estructura de tablas ha sido actualizada y la seguridad RLS configurada" -ForegroundColor Green
    
    Write-Host "`nSiguientes pasos:" -ForegroundColor Cyan
    Write-Host "1. Revisa la documentación en SEGURIDAD-SUPABASE.md" -ForegroundColor Cyan
    Write-Host "2. Actualiza las variables de entorno en tu aplicación" -ForegroundColor Cyan
    Write-Host "3. Prueba que la aplicación funcione correctamente con la nueva estructura" -ForegroundColor Cyan
} else {
    Write-Host "Operación cancelada" -ForegroundColor Yellow
}
