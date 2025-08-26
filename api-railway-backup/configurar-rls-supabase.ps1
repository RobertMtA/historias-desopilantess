# Script para configurar RLS en Supabase
# Configuración de Row Level Security para las tablas stories, comments, likes y subscribers

Write-Host "=== Configurando seguridad RLS en Supabase ===" -ForegroundColor Cyan
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

# Verificar si está instalada la dependencia @supabase/supabase-js
Write-Host "Verificando dependencias necesarias..." -ForegroundColor Yellow
$packageJson = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
$dependencias = $packageJson.dependencies

if (-Not ($dependencias.'@supabase/supabase-js')) {
    Write-Host "Instalando @supabase/supabase-js..." -ForegroundColor Yellow
    npm install @supabase/supabase-js dotenv --save
} else {
    Write-Host "Dependencia @supabase/supabase-js ya instalada" -ForegroundColor Green
}

# Ejecutar script de habilitación de RLS
Write-Host "`nEjecutando script de configuración de RLS..." -ForegroundColor Yellow
node habilitar-rls-supabase.js

# Verificar resultado
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Configuración de RLS completada correctamente" -ForegroundColor Green
    Write-Host "Se ha habilitado Row Level Security en las siguientes tablas:" -ForegroundColor Green
    Write-Host "- stories" -ForegroundColor Green
    Write-Host "- comments" -ForegroundColor Green
    Write-Host "- likes" -ForegroundColor Green
    Write-Host "- subscribers" -ForegroundColor Green
} else {
    Write-Host "`n❌ Error al configurar RLS en Supabase. Revisa los mensajes anteriores." -ForegroundColor Red
}

Write-Host "`nRecuerda:" -ForegroundColor Cyan
Write-Host "1. Verifica en el panel de Supabase que RLS esté habilitado para tus tablas" -ForegroundColor Cyan
Write-Host "2. Revisa las políticas creadas y ajústalas según sea necesario" -ForegroundColor Cyan
Write-Host "3. Prueba tu aplicación para asegurarte de que todo funciona correctamente" -ForegroundColor Cyan
