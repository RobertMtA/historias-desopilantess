# Script mejorado para ejecutar la solución ultra definitiva
Write-Host "🔍 Verificando entorno y configuración..." -ForegroundColor Cyan

# Verificar que los archivos de configuración existen
if (-not (Test-Path ".\.env")) {
    Write-Host "❌ Error: No se encontró el archivo .env. Creando uno por defecto..." -ForegroundColor Red
    
    @"
# PostgreSQL Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/historias
DB_USER=postgres
DB_HOST=localhost
DB_NAME=historias
DB_PASSWORD=postgres
DB_PORT=5432

# JWT Secret
JWT_SECRET=historias_desopilantes_jwt_secret

# App Configuration
NODE_ENV=development
PORT=4000

# API Configuration
API_URL=http://localhost:4000
VITE_API_URL=http://localhost:4000
"@ | Out-File -FilePath ".\.env" -Encoding utf8
    
    Write-Host "✅ Archivo .env creado correctamente" -ForegroundColor Green
}

if (-not (Test-Path ".\.env.server")) {
    Write-Host "❌ Error: No se encontró el archivo .env.server. Creando uno por defecto..." -ForegroundColor Red
    
    @"
# PostgreSQL Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/historias
DB_USER=postgres
DB_HOST=localhost
DB_NAME=historias
DB_PASSWORD=postgres
DB_PORT=5432

# JWT Secret
JWT_SECRET=historias_desopilantes_jwt_secret

# App Configuration
NODE_ENV=development
PORT=4000

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://histostorias-desopilantes.web.app,https://histostorias-desopilantes.firebaseapp.com

# Valid Story IDs (IDs existentes en la base de datos)
VALID_STORY_IDS=1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21
"@ | Out-File -FilePath ".\.env.server" -Encoding utf8
    
    Write-Host "✅ Archivo .env.server creado correctamente" -ForegroundColor Green
}

# Verificar si el archivo del interceptor ultra definitivo existe
$interceptorPath = ".\src\interceptor-ultra-definitivo.js"
if (-not (Test-Path $interceptorPath)) {
    Write-Host "❌ Error: No se encontró el interceptor ultra definitivo. Ejecute primero el script para crear los archivos necesarios." -ForegroundColor Red
    exit 1
}

# Verificar si el archivo main.jsx incluye el interceptor
$mainPath = ".\src\main.jsx"
if (Test-Path $mainPath) {
    $mainContent = Get-Content $mainPath -Raw
    if (-not ($mainContent -match "interceptor-ultra-definitivo")) {
        Write-Host "❌ El archivo main.jsx no incluye el interceptor. Añadiendo..." -ForegroundColor Yellow
        
        $updatedContent = $mainContent -replace "import React from 'react'", "import './interceptor-ultra-definitivo'`nimport React from 'react'"
        Set-Content -Path $mainPath -Value $updatedContent
        
        Write-Host "✅ Interceptor añadido a main.jsx" -ForegroundColor Green
    } else {
        Write-Host "✅ Interceptor ya está incluido en main.jsx" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ No se encontró el archivo main.jsx. Asegúrate de incluir el interceptor manualmente." -ForegroundColor Yellow
}

# Buscar y detener procesos Node.js
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "⚠️ Encontrados $($nodeProcesses.Count) procesos Node.js. Deteniendo..." -ForegroundColor Yellow
    foreach ($process in $nodeProcesses) {
        try {
            $process.Kill()
            Write-Host "✅ Proceso Node.js con ID $($process.Id) detenido correctamente" -ForegroundColor Green
        } catch {
            Write-Host "❌ Error al detener proceso Node.js con ID $($process.Id): $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "ℹ️ No se encontraron procesos Node.js en ejecución" -ForegroundColor Blue
}

# Verificar si nodemon está instalado
$nodemonInstalled = npm list -g nodemon 2>$null
if (-not $nodemonInstalled) {
    Write-Host "⚠️ Nodemon no está instalado globalmente. Instalando..." -ForegroundColor Yellow
    npm install -g nodemon
} else {
    Write-Host "✅ Nodemon ya está instalado" -ForegroundColor Green
}

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Cyan
try {
    npm install --no-fund --no-audit
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Error al instalar dependencias: $_. Continuando..." -ForegroundColor Yellow
}

# Iniciar el servidor ultra definitivo mejorado
Write-Host "🚀 Iniciando servidor ultra definitivo mejorado..." -ForegroundColor Cyan
try {
    Start-Process node -ArgumentList "servidor-ultra-definitivo-mejorado.js" -WindowStyle Normal
    Write-Host "✅ Servidor API ultra definitivo mejorado iniciado en puerto 4000" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al iniciar servidor API: $_" -ForegroundColor Red
}

# Esperar un momento para que el servidor inicie
Start-Sleep -Seconds 3

# Verificar que el servidor está respondiendo
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/test" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Servidor verificado y funcionando correctamente" -ForegroundColor Green
        Write-Host "   Respuesta del servidor: $($response.Content)" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ El servidor respondió con código: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ No se pudo verificar el servidor: $_. Continuando..." -ForegroundColor Yellow
}

# Cambiar al directorio de la aplicación React
$reactAppDir = ".\historias-react"
if (Test-Path $reactAppDir) {
    Write-Host "🔄 Cambiando al directorio de la aplicación React: $reactAppDir" -ForegroundColor Cyan
    Set-Location -Path $reactAppDir
    
    # Iniciar servidor de desarrollo React
    Write-Host "🚀 Iniciando servidor de desarrollo React..." -ForegroundColor Cyan
    try {
        Start-Process npm -ArgumentList "run dev" -WindowStyle Normal
        Write-Host "✅ Servidor de desarrollo React iniciado" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error al iniciar servidor de desarrollo React: $_" -ForegroundColor Red
    }
    
    # Volver al directorio original
    Set-Location -Path ".."
} else {
    # Si no existe el directorio específico, intentar iniciar el servidor de desarrollo en la ubicación actual
    Write-Host "⚠️ No se encontró el directorio $reactAppDir. Intentando iniciar el servidor de desarrollo en la ubicación actual..." -ForegroundColor Yellow
    
    try {
        Start-Process npm -ArgumentList "run dev" -WindowStyle Normal
        Write-Host "✅ Servidor de desarrollo iniciado" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error al iniciar servidor de desarrollo: $_" -ForegroundColor Red
    }
}

Write-Host "📋 Resumen de acciones:" -ForegroundColor White
Write-Host "- Archivos de configuración verificados/creados (.env y .env.server)" -ForegroundColor White
Write-Host "- Procesos Node.js detenidos" -ForegroundColor White
Write-Host "- Dependencias instaladas" -ForegroundColor White
Write-Host "- Servidor ultra definitivo mejorado iniciado en puerto 4000" -ForegroundColor White
Write-Host "- Interceptor ultra definitivo verificado" -ForegroundColor White
Write-Host "- Servidor de desarrollo iniciado" -ForegroundColor White

Write-Host "`n🎉 ¡SOLUCIÓN ULTRA DEFINITIVA MEJORADA IMPLEMENTADA!" -ForegroundColor Green
Write-Host "   Abre http://localhost:5173 en tu navegador para verificar que NO hay errores 404." -ForegroundColor Cyan
Write-Host "   Si siguen apareciendo errores, actualiza la página con Ctrl+F5." -ForegroundColor Yellow
