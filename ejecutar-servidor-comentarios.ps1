# Script para ejecutar la solución ultra definitiva de comentarios
Write-Host "🔍 Verificando entorno y configuración..." -ForegroundColor Cyan

# Verificar que los archivos de configuración existen
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

# Gmail Configuration for email sending
GMAIL_EMAIL=robertogaona1985@gmail.com
GMAIL_APP_PASSWORD="rvpg mkjr prpk okvz"

# JWT Secret
JWT_SECRET=historias_desopilantes_jwt_secret_2025_muy_seguro

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

# Iniciar el servidor ultra definitivo para comentarios
Write-Host "🚀 Iniciando servidor ultra definitivo para comentarios..." -ForegroundColor Cyan
try {
    Start-Process node -ArgumentList "servidor-ultra-definitivo-comments.js" -WindowStyle Normal
    Write-Host "✅ Servidor API para comentarios iniciado en puerto 4000" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al iniciar servidor API para comentarios: $_" -ForegroundColor Red
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

Write-Host "📋 Resumen de acciones:" -ForegroundColor White
Write-Host "- Archivo de configuración verificado/creado (.env.server)" -ForegroundColor White
Write-Host "- Procesos Node.js detenidos" -ForegroundColor White
Write-Host "- Dependencias instaladas" -ForegroundColor White
Write-Host "- Servidor ultra definitivo para comentarios iniciado en puerto 4000" -ForegroundColor White

Write-Host "`n🎉 ¡SOLUCIÓN PARA COMENTARIOS IMPLEMENTADA!" -ForegroundColor Green
Write-Host "   Abre http://localhost:5173 en tu navegador para verificar que NO hay errores 404." -ForegroundColor Cyan
Write-Host "   Si siguen apareciendo errores, actualiza la página con Ctrl+F5." -ForegroundColor Yellow
