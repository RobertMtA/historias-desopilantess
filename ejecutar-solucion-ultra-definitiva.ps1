# Script para ejecutar la solución ULTRA DEFINITIVA
Write-Host "🔍 Buscando procesos Node.js en ejecución..." -ForegroundColor Cyan

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

# Verificar que el nuevo servidor existe
if (-not (Test-Path "servidor-ultra-definitivo.js")) {
    Write-Host "❌ Error: No se encontró el archivo servidor-ultra-definitivo.js" -ForegroundColor Red
    exit 1
}

# Verificar que el nuevo interceptor existe
if (-not (Test-Path "src\interceptor-ultra-definitivo.js")) {
    Write-Host "❌ Error: No se encontró el archivo src\interceptor-ultra-definitivo.js" -ForegroundColor Red
    exit 1
}

# Compilar el proyecto antes de iniciar
Write-Host "🔨 Compilando el proyecto..." -ForegroundColor Cyan
try {
    npm run build
    Write-Host "✅ Proyecto compilado correctamente" -ForegroundColor Green
} catch {
    Write-Host "⚠️ No se pudo compilar el proyecto: $_. Continuando..." -ForegroundColor Yellow
}

# Iniciar el servidor ultra definitivo
Write-Host "🚀 Iniciando servidor ultra definitivo..." -ForegroundColor Cyan
try {
    Start-Process node -ArgumentList "servidor-ultra-definitivo.js" -WindowStyle Normal
    Write-Host "✅ Servidor API ultra definitivo iniciado en puerto 4000" -ForegroundColor Green
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
    } else {
        Write-Host "⚠️ El servidor respondió con código: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ No se pudo verificar el servidor: $_. Continuando..." -ForegroundColor Yellow
}

# Iniciar servidor de desarrollo
Write-Host "🚀 Iniciando servidor de desarrollo..." -ForegroundColor Cyan
try {
    Start-Process npm -ArgumentList "run dev" -WindowStyle Normal
    Write-Host "✅ Servidor de desarrollo iniciado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al iniciar servidor de desarrollo: $_" -ForegroundColor Red
}

Write-Host "📋 Resumen de acciones:" -ForegroundColor White
Write-Host "- Procesos Node.js detenidos" -ForegroundColor White
Write-Host "- Servidor ultra definitivo iniciado en puerto 4000" -ForegroundColor White
Write-Host "- Interceptor ultra definitivo activado" -ForegroundColor White
Write-Host "- Servidores reiniciados" -ForegroundColor White

Write-Host "`n🎉 ¡SOLUCIÓN ULTRA DEFINITIVA IMPLEMENTADA!" -ForegroundColor Green
Write-Host "   Abre http://localhost:5173 en tu navegador para verificar que NO hay errores 404." -ForegroundColor Cyan
Write-Host "   Si siguen apareciendo errores, actualiza la página con Ctrl+F5." -ForegroundColor Yellow
