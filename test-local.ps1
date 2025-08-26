# test-local.ps1 - Probar app.js localmente

Write-Host "🧪 PROBANDO APP.JS LOCALMENTE" -ForegroundColor Cyan

if (Test-Path "app.js") {
    Write-Host "✅ app.js encontrado"
    
    # Verificar que tiene todos los endpoints
    $content = Get-Content "app.js" -Raw
    
    $endpoints = @(
        "app.get('/api/test'",
        "app.post('/api/stories/:id/like'",
        "app.put('/api/stories/:id/like'"
    )
    
    Write-Host "
🔍 Verificando endpoints en app.js:"
    foreach ($endpoint in $endpoints) {
        if ($content -match [regex]::Escape($endpoint)) {
            Write-Host "   ✅ $endpoint" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $endpoint" -ForegroundColor Red
        }
    }
    
    Write-Host "
📊 Estadísticas del archivo:"
    Write-Host "   📏 Líneas: $((Get-Content 'app.js').Count)"
    Write-Host "   💾 Tamaño: $([math]::Round((Get-Item 'app.js').Length / 1KB, 2)) KB"
    
} else {
    Write-Host "❌ app.js no encontrado"
}
