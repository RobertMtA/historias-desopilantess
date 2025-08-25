Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Solución ULTRA DEFINITIVA COMPLETA para Despliegue" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Ir al directorio del proyecto
Set-Location -Path "c:\Users\rober\Desktop\historias-desopilantes-react"

# 1. VERIFICAR Y ACTUALIZAR API EN RAILWAY
Write-Host "`n1. Verificando y actualizando API en Railway..." -ForegroundColor Yellow

# Ejecutar el script de solución para endpoints 404
Write-Host "   ⚙️ Aplicando solución para endpoints 404..." -ForegroundColor White
node solucionar-endpoints-404.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Error al ejecutar el script de corrección." -ForegroundColor Red
    exit 1
}

# Desplegar a Railway
Write-Host "   🚀 Desplegando a Railway..." -ForegroundColor White
Set-Location -Path "c:\Users\rober\Desktop\historias-desopilantes-react\api-railway"
railway up
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Error al desplegar a Railway." -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ API desplegada correctamente en Railway" -ForegroundColor Green

# Verificar que la API está funcionando
Write-Host "   🔍 Verificando estado de la API..." -ForegroundColor White
railway run node check-status.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠️ Advertencia: Posibles problemas con la API." -ForegroundColor Yellow
}

# Volver al directorio principal
Set-Location -Path "c:\Users\rober\Desktop\historias-desopilantes-react"

# 2. ACTUALIZAR CONFIGURACIÓN DEL FRONTEND
Write-Host "`n2. Actualizando configuración del frontend..." -ForegroundColor Yellow

# Obtener la URL de Railway
$railwayUrl = "historias-desopilantes-production.up.railway.app"
Write-Host "   📋 URL de Railway detectada: $railwayUrl" -ForegroundColor White

# Buscar y actualizar la configuración de API en el frontend
$configFiles = @(
    "src\config\api.js",
    "src\services\api.js",
    "src\config\apiConfig.js",
    "src\config\config.js",
    "src\api\config.js"
)

$configFound = $false

foreach ($configFile in $configFiles) {
    $fullPath = "c:\Users\rober\Desktop\historias-desopilantes-react\$configFile"
    if (Test-Path $fullPath) {
        Write-Host "   📄 Archivo de configuración encontrado: $configFile" -ForegroundColor White
        $configFound = $true
        
        # Leer el contenido actual
        $content = Get-Content $fullPath -Raw
        
        # Verificar si la URL de Railway está presente
        if ($content -match $railwayUrl) {
            Write-Host "   ✅ URL de Railway ya configurada correctamente" -ForegroundColor Green
        } else {
            # Buscar patrones comunes de URL de API
            $updated = $false
            
            # Patrón 1: Object con production
            if ($content -match "production:.*['\"]https?://[^'\"]+['\"]") {
                $newContent = $content -replace "(production:.*['\"])https?://[^'\"]+(['\"]\s*)", "`$1https://$railwayUrl`$2"
                Set-Content $fullPath $newContent
                $updated = $true
            }
            # Patrón 2: VITE_API_URL o similar
            elseif ($content -match "API_URL.*=.*['\"]https?://[^'\"]+['\"]") {
                $newContent = $content -replace "(API_URL.*=.*['\"])https?://[^'\"]+(['\"]\s*)", "`$1https://$railwayUrl`$2"
                Set-Content $fullPath $newContent
                $updated = $true
            }
            # Patrón 3: baseURL
            elseif ($content -match "baseURL:.*['\"]https?://[^'\"]+['\"]") {
                $newContent = $content -replace "(baseURL:.*['\"])https?://[^'\"]+(['\"]\s*)", "`$1https://$railwayUrl`$2"
                Set-Content $fullPath $newContent
                $updated = $true
            }
            
            if ($updated) {
                Write-Host "   ✅ URL de API actualizada en $configFile" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️ No se pudo actualizar automáticamente la URL en $configFile" -ForegroundColor Yellow
                Write-Host "      Por favor, actualiza manualmente la URL a: https://$railwayUrl" -ForegroundColor Yellow
            }
        }
    }
}

if (-not $configFound) {
    Write-Host "   ⚠️ No se encontró archivo de configuración de API" -ForegroundColor Yellow
    Write-Host "   Creando archivo de configuración básico..." -ForegroundColor White
    
    # Crear directorio si no existe
    if (-not (Test-Path "c:\Users\rober\Desktop\historias-desopilantes-react\src\config")) {
        New-Item -ItemType Directory -Path "c:\Users\rober\Desktop\historias-desopilantes-react\src\config" -Force
    }
    
    # Crear archivo de configuración
    $configContent = @"
/**
 * Configuración de API
 * Generado automáticamente
 */

const API_CONFIG = {
  development: 'http://localhost:4000',
  production: 'https://$railwayUrl',
};

// Determinar ambiente actual
const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';

// Exportar URL base de API según ambiente
export const API_URL = isProduction ? API_CONFIG.production : API_CONFIG.development;

export default {
  apiUrl: API_URL,
  timeout: 10000,
  withCredentials: false,
};
"@
    
    Set-Content -Path "c:\Users\rober\Desktop\historias-desopilantes-react\src\config\api.js" -Value $configContent
    Write-Host "   ✅ Archivo de configuración creado: src\config\api.js" -ForegroundColor Green
}

# 3. RECOMPILAR Y DESPLEGAR FRONTEND
Write-Host "`n3. Recompilando y desplegando frontend..." -ForegroundColor Yellow

# Instalar dependencias (por si acaso)
Write-Host "   📦 Verificando dependencias..." -ForegroundColor White
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠️ Advertencia al instalar dependencias, continuando..." -ForegroundColor Yellow
}

# Construir la aplicación
Write-Host "   🔨 Construyendo la aplicación..." -ForegroundColor White
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Error al construir la aplicación." -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Aplicación construida correctamente" -ForegroundColor Green

# Desplegar a Firebase
Write-Host "   🚀 Desplegando a Firebase..." -ForegroundColor White
firebase deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Error al desplegar a Firebase." -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Frontend desplegado correctamente en Firebase" -ForegroundColor Green

# 4. LIMPIAR CACHÉ DEL NAVEGADOR
Write-Host "`n4. Recomendaciones para limpiar caché..." -ForegroundColor Yellow
Write-Host "   ⚠️ Es importante que limpies la caché de tu navegador:" -ForegroundColor White
Write-Host "   - Chrome: Ctrl+Shift+Del -> Marcar 'Imágenes y archivos en caché' -> Borrar datos" -ForegroundColor White
Write-Host "   - Firefox: Ctrl+Shift+Del -> Marcar 'Caché' -> Borrar" -ForegroundColor White
Write-Host "   - Edge: Ctrl+Shift+Del -> Marcar 'Datos y archivos almacenados en caché' -> Borrar" -ForegroundColor White

# Resumen final
Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "¡Despliegue ULTRA DEFINITIVO COMPLETO Finalizado!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

Write-Host "`nPasos completados:" -ForegroundColor White
Write-Host "✅ API actualizada y desplegada en Railway" -ForegroundColor Green
Write-Host "✅ Configuración del frontend actualizada" -ForegroundColor Green
Write-Host "✅ Frontend reconstruido y desplegado en Firebase" -ForegroundColor Green

Write-Host "`nPara verificar:" -ForegroundColor White
Write-Host "1. Abre una ventana de navegación privada/incógnito" -ForegroundColor Yellow
Write-Host "2. Visita: https://histostorias-desopilantes.web.app/historias" -ForegroundColor Yellow
Write-Host "3. Abre la consola del navegador (F12) y verifica que no hay errores 404" -ForegroundColor Yellow

Write-Host "`nSi sigues teniendo problemas:" -ForegroundColor White
Write-Host "1. Verifica la consola del navegador para errores específicos" -ForegroundColor Yellow
Write-Host "2. Comprueba los logs de Railway para problemas en el backend" -ForegroundColor Yellow
Write-Host "3. Asegúrate que la URL de API en el frontend apunta a: https://$railwayUrl" -ForegroundColor Yellow
