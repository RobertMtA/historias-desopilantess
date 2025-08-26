# monitor-railway.ps1
Write-Host "🔍 Verificando Railway..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "https://historias-desopilantes-production.up.railway.app/api/test" -TimeoutSec 10
    Write-Host "🎉 ¡SERVIDOR FUNCIONANDO!" -ForegroundColor Green
    Write-Host "   📅 Timestamp: $($response.timestamp)"
    Write-Host "   📝 Version: $($response.version)"
    
    # Test likes
    try {
        $likeTest = Invoke-RestMethod -Uri "https://historias-desopilantes-production.up.railway.app/api/stories/1/like" -Method POST -ContentType "application/json"
        Write-Host "🎯 ¡LIKES FUNCIONAN! Nuevos likes: $($likeTest.likes)" -ForegroundColor Green
        Write-Host "✅ PROBLEMA RESUELTO COMPLETAMENTE" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Servidor funciona pero likes aún fallan: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Servidor aún no responde: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "⏳ Continúa configurando en Railway Dashboard"
}
