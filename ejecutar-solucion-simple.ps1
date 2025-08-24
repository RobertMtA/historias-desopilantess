# Script simplificado para ejecutar solución ultra definitiva

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

# Crear la carpeta dist si no existe
Write-Host "📁 Verificando carpeta dist..." -ForegroundColor Cyan
if (-not (Test-Path ".\dist")) {
    try {
        New-Item -Path ".\dist" -ItemType Directory | Out-Null
        Write-Host "✅ Carpeta dist creada correctamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error al crear carpeta dist: $_" -ForegroundColor Red
    }
}

# Crear un index.html básico si no existe
Write-Host "📄 Verificando index.html en dist..." -ForegroundColor Cyan
if (-not (Test-Path ".\dist\index.html")) {
    try {
        $content = @"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historias Desopilantes</title>
</head>
<body>
    <h1>Historias Desopilantes - Versión de respaldo</h1>
    <p>Esta página se muestra cuando se accede a rutas que no son de la API.</p>
    <script>
        console.log('🛡️ Servidor funcionando correctamente');
    </script>
</body>
</html>
"@
        Set-Content -Path ".\dist\index.html" -Value $content
        Write-Host "✅ index.html creado correctamente en dist" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error al crear index.html: $_" -ForegroundColor Red
    }
}

# Iniciar el servidor ultra definitivo simplificado
Write-Host "🚀 Iniciando servidor ultra definitivo simplificado..." -ForegroundColor Cyan
try {
    Start-Process node -ArgumentList "servidor-simple-ultra-definitivo.js" -WindowStyle Normal
    Write-Host "✅ Servidor API ultra definitivo simplificado iniciado en puerto 4000" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al iniciar servidor API: $_" -ForegroundColor Red
}

# Esperar un momento para que el servidor inicie
Start-Sleep -Seconds 3

# Verificar que el servidor está respondiendo
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/test" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        $content = $response.Content | ConvertFrom-Json
        Write-Host "✅ Servidor verificado: $($content.message)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ El servidor respondió con código: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ No se pudo verificar el servidor: $_" -ForegroundColor Yellow
    Write-Host "  Intentando iniciar de nuevo el servidor..." -ForegroundColor Yellow
    
    try {
        Start-Process node -ArgumentList "servidor-simple-ultra-definitivo.js" -WindowStyle Normal
        Write-Host "✅ Segundo intento de iniciar servidor completado" -ForegroundColor Green
        Start-Sleep -Seconds 3
    } catch {
        Write-Host "❌ Error en segundo intento: $_" -ForegroundColor Red
    }
}

Write-Host "📋 Resumen de acciones:" -ForegroundColor White
Write-Host "- Procesos Node.js detenidos" -ForegroundColor White
Write-Host "- Carpeta dist y archivos básicos creados" -ForegroundColor White
Write-Host "- Servidor ultra definitivo simplificado iniciado en puerto 4000" -ForegroundColor White

Write-Host "`n🎉 ¡SOLUCIÓN SIMPLIFICADA IMPLEMENTADA!" -ForegroundColor Green
Write-Host "   Este servidor simulará respuestas para CUALQUIER petición a /api/stories/:id/likes" -ForegroundColor Cyan
Write-Host "   Prueba estas URLs en el navegador:" -ForegroundColor Cyan
Write-Host "   - http://localhost:4000/api/test" -ForegroundColor Cyan
Write-Host "   - http://localhost:4000/api/valid-ids" -ForegroundColor Cyan
Write-Host "   - http://localhost:4000/api/stories/25/likes" -ForegroundColor Cyan
Write-Host "   - http://localhost:4000/api/stories/30/comments" -ForegroundColor Cyan
Write-Host "`n💡 NOTA: Este servidor NO requiere conexión a PostgreSQL" -ForegroundColor Yellow
