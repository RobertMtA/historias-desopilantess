# test-render.ps1

Write-Host "🧪 PROBANDO RENDER.COM DEPLOYMENT" -ForegroundColor Cyan

# Reemplaza esta URL con tu URL de Render cuando esté listo
$renderUrl = "https://historias-desopilantes-api-v2.onrender.com"

Write-Host "
ℹ️  Instrucciones:"
Write-Host "1. Ve a render.com y crea el servicio"
Write-Host "2. Copia la URL que te dé Render"
Write-Host "3. Reemplaza la variable $renderUrl en este script"
Write-Host "4. Ejecuta este script para probar"

Write-Host "
🎯 Tests a ejecutar cuando tengas la URL:"
Write-Host "   GET  $renderUrl/api/test"
Write-Host "   GET  $renderUrl/api/stories/1/likes" 
Write-Host "   POST $renderUrl/api/stories/1/like"
Write-Host "   PUT  $renderUrl/api/stories/1/like"

Write-Host "
🔧 Función de prueba automática:"
@'
function Test-RenderEndpoint {
    param($url, $method = "GET", $body = $null, $description)
    
    Write-Host "
🎯 $description" -ForegroundColor Yellow
    try {
        $params = @{ Uri = $url; Method = $method; TimeoutSec = 15 }
        if ($body) {
            $params.Body = ($body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "   ✅ ÉXITO" -ForegroundColor Green
        if ($response.success) { Write-Host "   📊 Success: $($response.success)" }
        if ($response.likes) { Write-Host "   📊 Likes: $($response.likes)" }
        return $true
    } catch {
        Write-Host "   ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Descomenta estas líneas cuando tengas la URL de Render:
# Test-RenderEndpoint "$renderUrl/api/test" "GET" $null "Test básico"
# Test-RenderEndpoint "$renderUrl/api/stories/1/like" "POST" @{} "POST Like"
# Test-RenderEndpoint "$renderUrl/api/stories/1/likes" "GET" $null "GET Likes"
'@

Write-Host "
✅ Script de prueba listo para cuando tengas la URL de Render"
