# Script para reiniciar la aplicación con los nuevos cambios
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

# Verificar si server.js contiene la configuración de puerto correcta
Write-Host "🔧 Verificando configuración del servidor..." -ForegroundColor Cyan
$serverContent = Get-Content .\server.js -Raw
if ($serverContent -match "PORT\s*=\s*process\.env\.PORT\s*\|\|\s*3009") {
    Write-Host "🔄 Actualizando puerto del servidor a 4000..." -ForegroundColor Yellow
    $serverContent = $serverContent -replace "PORT\s*=\s*process\.env\.PORT\s*\|\|\s*3009", "PORT = process.env.PORT || 4000"
    Set-Content -Path .\server.js -Value $serverContent -Force
    Write-Host "✅ Puerto del servidor actualizado a 4000" -ForegroundColor Green
} else {
    Write-Host "✅ Puerto del servidor ya está configurado correctamente" -ForegroundColor Green
}

# Instalar dependencias (por si acaso)
Write-Host "📦 Verificando dependencias..." -ForegroundColor Cyan
try {
    npm install
    Write-Host "✅ Dependencias verificadas" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al verificar dependencias: $_" -ForegroundColor Red
}

# Iniciar servidor API
Write-Host "🚀 Iniciando servidor API..." -ForegroundColor Cyan
try {
    Start-Process npm -ArgumentList "run server" -WindowStyle Normal
    Write-Host "✅ Servidor API iniciado en puerto 4000" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al iniciar servidor API: $_" -ForegroundColor Red
}

# Esperar un momento para que el servidor inicie
Start-Sleep -Seconds 3

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
Write-Host "- Puerto del servidor API actualizado" -ForegroundColor White
Write-Host "- Puerto de API en configuración frontend actualizado" -ForegroundColor White
Write-Host "- IDs y nombres agregados a campos de formulario" -ForegroundColor White
Write-Host "- Servidores reiniciados" -ForegroundColor White

Write-Host "`n🎉 ¡Proceso completado! La aplicación debería estar ejecutándose sin errores 404." -ForegroundColor Green
Write-Host "   Abre http://localhost:5173 en tu navegador para verificar." -ForegroundColor Cyan
