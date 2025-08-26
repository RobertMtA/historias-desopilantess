# test-endpoints-like.ps1
Write-Host "🧪 PROBANDO ENDPOINTS DE LIKES..." -ForegroundColor Cyan

# Endpoint de prueba
$baseUrl = "https://historias-desopilantes-production.up.railway.app"
$storyId = 1

Write-Host "🔍 Probando POST $baseUrl/api/stories/$storyId/like"

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/stories/$storyId/like" -Method POST -ContentType "application/json"
    Write-Host "✅ POST exitoso: " -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error en POST: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "
⏳ Esperando 30 segundos para que Railway termine el deploy..."
Start-Sleep -Seconds 30

Write-Host "
🔍 Probando GET $baseUrl/api/stories/$storyId/likes"
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/stories/$storyId/likes" -Method GET
    Write-Host "✅ GET exitoso: " -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error en GET: $($_.Exception.Message)" -ForegroundColor Red
}
