# test-endpoints-completo.ps1
Write-Host "🧪 PROBANDO TODOS LOS ENDPOINTS DE LIKES..." -ForegroundColor Cyan

$baseUrl = "https://historias-desopilantes-production.up.railway.app"
$testStories = @(1, 2, 3)

foreach ($storyId in $testStories) {
    Write-Host "
🔍 Probando historia ID: $storyId" -ForegroundColor Yellow
    
    # Probar GET /likes
    try {
        Write-Host "  📊 GET /api/stories/$storyId/likes"
        $response = Invoke-RestMethod -Uri "$baseUrl/api/stories/$storyId/likes" -Method GET -TimeoutSec 10
        Write-Host "  ✅ GET exitoso - Likes: $($response.likes)" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Error en GET: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Esperar un poco entre requests
    Start-Sleep -Seconds 1
    
    # Probar POST /like
    try {
        Write-Host "  👍 POST /api/stories/$storyId/like"
        $response = Invoke-RestMethod -Uri "$baseUrl/api/stories/$storyId/like" -Method POST -ContentType "application/json" -TimeoutSec 10
        Write-Host "  ✅ POST exitoso - Nuevos likes: $($response.likes)" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Error en POST: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 1
}

Write-Host "
�� PRUEBAS COMPLETADAS!" -ForegroundColor Green
Write-Host "🌐 Si todos los tests pasaron, el problema está solucionado"
