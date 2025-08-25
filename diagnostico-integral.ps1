Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Diagnóstico Integral Frontend/Backend - Historias Desopilantes" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Ir al directorio del proyecto
Set-Location -Path "c:\Users\rober\Desktop\historias-desopilantes-react"

# 1. VERIFICAR CONFIGURACIÓN BACKEND
Write-Host "`n1. Analizando configuración del servidor..." -ForegroundColor Yellow
$serverFile = ".\server.js"
$serverContent = Get-Content $serverFile -Raw

# Verificar importaciones esenciales
$importaciones = @{
    "path" = $serverContent -match "const\s+path\s*=\s*require\s*\(\s*['`"]path['`"]\s*\)"
    "fs" = $serverContent -match "const\s+fs\s*=\s*require\s*\(\s*['`"]fs['`"]\s*\)"
    "cors" = $serverContent -match "const\s+cors\s*=\s*require\s*\(\s*['`"]cors['`"]\s*\)"
    "express" = $serverContent -match "const\s+express\s*=\s*require\s*\(\s*['`"]express['`"]\s*\)"
}

foreach ($key in $importaciones.Keys) {
    if ($importaciones[$key]) {
        Write-Host "   ✓ Importación de $key: OK" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Importación de $key: FALTA" -ForegroundColor Red
    }
}

# Verificar middleware
$middleware = @{
    "cors" = $serverContent -match "app\.use\s*\(\s*cors\s*\(\s*"
    "express.json" = $serverContent -match "app\.use\s*\(\s*express\.json\s*\(\s*\)\s*\)"
}

Write-Host "`n   Configuración de middleware:" -ForegroundColor Yellow
foreach ($key in $middleware.Keys) {
    if ($middleware[$key]) {
        Write-Host "   ✓ Middleware $key: OK" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Middleware $key: FALTA" -ForegroundColor Red
    }
}

# 2. VERIFICAR ENDPOINTS
Write-Host "`n2. Analizando configuración de rutas y endpoints..." -ForegroundColor Yellow

$endpoints = @{
    "/api/health" = $serverContent -match "/api/health"
    "/api/historias" = $serverContent -match "/api/historias"
    "/api/comentarios" = $serverContent -match "/api/comentarios"
    "/api/likes" = $serverContent -match "/api/likes"
}

foreach ($key in $endpoints.Keys) {
    if ($endpoints[$key]) {
        Write-Host "   ✓ Endpoint $key: OK" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Endpoint $key: No encontrado" -ForegroundColor Red
    }
}

# 3. VERIFICAR FRONTEND
Write-Host "`n3. Analizando configuración del frontend..." -ForegroundColor Yellow

# Buscar archivo de configuración API
$apiConfigFiles = @(
    ".\src\api.js",
    ".\src\services\api.js",
    ".\src\config\api.js",
    ".\src\utils\api.js"
)

$apiConfigFound = $false
$apiConfig = $null
$apiBaseUrl = $null

foreach ($file in $apiConfigFiles) {
    if (Test-Path $file) {
        $apiConfigFound = $true
        $apiConfig = Get-Content $file -Raw
        
        # Extraer URL base
        if ($apiConfig -match "baseURL\s*:\s*['`"]([^'`"]+)['`"]") {
            $apiBaseUrl = $Matches[1]
        }
        elseif ($apiConfig -match "BASE_URL\s*=\s*['`"]([^'`"]+)['`"]") {
            $apiBaseUrl = $Matches[1]
        }
        
        Write-Host "   ✓ Archivo de configuración API encontrado: $file" -ForegroundColor Green
        break
    }
}

if (-not $apiConfigFound) {
    Write-Host "   ❌ No se encontró archivo de configuración API" -ForegroundColor Red
}
else {
    if ($apiBaseUrl) {
        Write-Host "   ✓ URL base de la API: $apiBaseUrl" -ForegroundColor Green
        
        # Verificar si la URL apunta a Railway
        if ($apiBaseUrl -match "railway\.app") {
            Write-Host "   ✓ La URL de la API apunta a Railway" -ForegroundColor Green
        }
        else {
            Write-Host "   ❌ La URL de la API NO apunta a Railway" -ForegroundColor Red
        }
    }
    else {
        Write-Host "   ❌ No se pudo determinar la URL base de la API" -ForegroundColor Red
    }
}

# 4. VERIFICAR CONFIGURACIÓN CORS
Write-Host "`n4. Analizando configuración CORS..." -ForegroundColor Yellow

if ($serverContent -match "cors\s*\(\s*\{") {
    Write-Host "   ✓ Configuración CORS detallada encontrada" -ForegroundColor Green
    
    if ($serverContent -match "origin\s*:\s*\[[^\]]*histostorias-desopilantes\.web\.app") {
        Write-Host "   ✓ URL de Firebase configurada en CORS" -ForegroundColor Green
    }
    else {
        Write-Host "   ❌ URL de Firebase NO configurada en CORS" -ForegroundColor Red
    }
}
else {
    if ($middleware["cors"]) {
        Write-Host "   ⚠️ Configuración CORS básica encontrada (puede causar problemas)" -ForegroundColor Yellow
    }
    else {
        Write-Host "   ❌ No se encontró configuración CORS" -ForegroundColor Red
    }
}

# 5. VERIFICAR CONFIGURACIÓN DE LA BASE DE DATOS
Write-Host "`n5. Analizando configuración de la base de datos..." -ForegroundColor Yellow

$dbConfig = @{
    "pg" = $serverContent -match "require\s*\(\s*['`"]pg['`"]\s*\)"
    "connectionString" = $serverContent -match "connectionString|DATABASE_URL|POSTGRES"
    "errorHandling" = $serverContent -match "catch\s*\(\s*error\s*\)\s*\{"
}

foreach ($key in $dbConfig.Keys) {
    if ($dbConfig[$key]) {
        Write-Host "   ✓ Configuración DB - $key: OK" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Configuración DB - $key: FALTA" -ForegroundColor Red
    }
}

# 6. GENERAR HERRAMIENTAS DE VERIFICACIÓN
Write-Host "`n6. Generando herramientas de verificación..." -ForegroundColor Yellow

# Generar verificador HTML
Write-Host "   Generando verificador de endpoints HTML..." -ForegroundColor White
node generar-verificador-endpoints.js
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Verificador de endpoints generado" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error al generar verificador de endpoints" -ForegroundColor Red
}

# 7. RESUMEN Y RECOMENDACIONES
Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "RESUMEN Y RECOMENDACIONES" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Detectar si hay problemas
$problemasCriticos = 0
$problemasLeves = 0

# Problemas de importaciones
foreach ($key in $importaciones.Keys) {
    if (-not $importaciones[$key]) {
        $problemasCriticos++
    }
}

# Problemas de middleware
foreach ($key in $middleware.Keys) {
    if (-not $middleware[$key]) {
        $problemasCriticos++
    }
}

# Problemas de endpoints
foreach ($key in $endpoints.Keys) {
    if (-not $endpoints[$key]) {
        $problemasLeves++
    }
}

# Mostrar resumen
Write-Host "`nProblemas detectados:" -ForegroundColor White
Write-Host "- Críticos: $problemasCriticos" -ForegroundColor Yellow
Write-Host "- Leves: $problemasLeves" -ForegroundColor Yellow

if ($problemasCriticos -gt 0 -or $problemasLeves -gt 0) {
    Write-Host "`nSe recomienda ejecutar los siguientes scripts de solución:" -ForegroundColor Yellow
    
    if ($problemasCriticos -gt 0) {
        Write-Host "1. Ejecutar '.\ejecutar-diagnostico-y-correccion.ps1'" -ForegroundColor Yellow
    }
    
    Write-Host "`nPara verificar la API y limpiar caché:" -ForegroundColor Yellow
    Write-Host "1. Abrir 'verificador-endpoints.html' en tu navegador" -ForegroundColor Yellow
    Write-Host "2. Abrir 'limpiar-cache.html' para eliminar caché" -ForegroundColor Yellow
} else {
    Write-Host "`n✅ ¡No se detectaron problemas significativos!" -ForegroundColor Green
    Write-Host "Para verificar la conectividad frontend-backend:" -ForegroundColor Yellow
    Write-Host "1. Abrir 'verificador-endpoints.html' en tu navegador" -ForegroundColor Yellow
    Write-Host "2. Visitar el sitio en modo incógnito: https://histostorias-desopilantes.web.app/historias" -ForegroundColor Yellow
}

# Volver al directorio principal
Set-Location -Path "c:\Users\rober\Desktop\historias-desopilantes-react"
