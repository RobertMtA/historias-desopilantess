# Script para reiniciar la aplicación
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

# Aplicar el parche al archivo index.html
Write-Host "🔧 Aplicando parche al archivo index.html..." -ForegroundColor Cyan
try {
    node aplicar-parche-index.js
} catch {
    Write-Host "❌ Error al aplicar el parche: $_" -ForegroundColor Red
}

# Instalar dependencias (por si acaso)
Write-Host "📦 Verificando dependencias..." -ForegroundColor Cyan
try {
    npm install
    Write-Host "✅ Dependencias verificadas" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al verificar dependencias: $_" -ForegroundColor Red
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
Write-Host "- Parche aplicado a index.html" -ForegroundColor White
Write-Host "- Dependencias verificadas" -ForegroundColor White
Write-Host "- Servidor de desarrollo reiniciado" -ForegroundColor White

Write-Host "`n🎉 ¡Proceso completado! La aplicación debería estar ejecutándose sin errores 404." -ForegroundColor Green
Write-Host "   Abre http://localhost:5173 en tu navegador para verificar." -ForegroundColor Cyan
