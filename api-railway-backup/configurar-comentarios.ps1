# Script para configurar endpoints de comentarios y vincular con Railway
param (
    [switch]$SkipDeploy = $false
)

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "      CONFIGURAR Y VINCULAR ENDPOINTS DE COMENTARIOS" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Directorios principales
$workspaceDir = "c:\Users\rober\Desktop\historias-desopilantes-react"
$apiRailwayDir = "$workspaceDir\api-railway"
$commentsFilePath = "$apiRailwayDir\comments-routes.js"
$serverFilePath = "$apiRailwayDir\server.js"

# 1. Verificar archivos necesarios
Write-Host "`n1. Verificando archivos necesarios..." -ForegroundColor Yellow

# Verificar archivo de rutas de comentarios
if (-not (Test-Path $commentsFilePath)) {
    Write-Host "   ❌ No se encontró el archivo comments-routes.js" -ForegroundColor Red
    Write-Host "      Verifica que lo creaste correctamente" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Archivo comments-routes.js encontrado" -ForegroundColor Green

# Verificar server.js
if (-not (Test-Path $serverFilePath)) {
    Write-Host "   ❌ No se encontró el archivo server.js" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Archivo server.js encontrado" -ForegroundColor Green

# 2. Verificar la configuración del servidor
Write-Host "`n2. Verificando configuración del servidor..." -ForegroundColor Yellow

$serverContent = Get-Content -Path $serverFilePath -Raw
$serverUpdated = $false

# Verificar si ya tiene importado el módulo de comentarios
if (-not ($serverContent -match 'require\([''"]\.\/comments-routes[''"]')) {
    Write-Host "   Añadiendo importación de comments-routes..." -ForegroundColor White
    
    # Agregar importación al inicio del archivo
    $serverContent = "const commentsRoutes = require('./comments-routes');" + "`n" + $serverContent
    $serverUpdated = $true
    Write-Host "   ✓ Importación añadida" -ForegroundColor Green
} else {
    Write-Host "   ✓ El módulo ya está importado" -ForegroundColor Green
}

# Verificar si ya tiene inicializado el módulo
if (-not ($serverContent -match 'commentsRoutes\(app\)')) {
    Write-Host "   Añadiendo inicialización de rutas de comentarios..." -ForegroundColor White
    
    # Buscar después de configuración de CORS
    if ($serverContent -match 'app\.use\(cors\([^)]+\)\);') {
        $serverContent = $serverContent -replace '(app\.use\(cors\([^)]+\)\);)', "`$1`n`n// Añadir rutas de comentarios`ncommentsRoutes(app);"
        $serverUpdated = $true
        Write-Host "   ✓ Inicialización añadida después de CORS" -ForegroundColor Green
    }
    # Si no encuentra CORS, intentar añadir después de definir la app
    elseif ($serverContent -match 'const app = express\(\);') {
        $serverContent = $serverContent -replace '(const app = express\(\);.*)', "`$1`n`n// Añadir rutas de comentarios`ncommentsRoutes(app);"
        $serverUpdated = $true
        Write-Host "   ✓ Inicialización añadida después de definir app" -ForegroundColor Green
    }
    # Si todo lo demás falla, añadir antes del primer endpoint
    else {
        $serverContent = $serverContent -replace '(app\.(get|post|put|delete))', "// Añadir rutas de comentarios`ncommentsRoutes(app);`n`n`$1"
        $serverUpdated = $true
        Write-Host "   ✓ Inicialización añadida antes de la primera ruta" -ForegroundColor Green
    }
} else {
    Write-Host "   ✓ Las rutas ya están inicializadas" -ForegroundColor Green
}

# Guardar cambios si hubo modificaciones
if ($serverUpdated) {
    Set-Content -Path $serverFilePath -Value $serverContent
    Write-Host "   ✓ Archivo server.js actualizado" -ForegroundColor Green
} else {
    Write-Host "   ✓ No se requieren cambios en server.js" -ForegroundColor Green
}

# 3. Verificar y vincular Railway
Write-Host "`n3. Verificando conexión con Railway..." -ForegroundColor Yellow

# Cambiar al directorio de la API
Set-Location -Path $apiRailwayDir

# Verificar estado de Railway
try {
    $railwayOutput = railway status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Proyecto de Railway ya vinculado" -ForegroundColor Green
        $railwayOutput | ForEach-Object { Write-Host "     $_" -ForegroundColor White }
    } else {
        throw "No está vinculado"
    }
} catch {
    Write-Host "   ❌ El proyecto no está vinculado a Railway" -ForegroundColor Red
    Write-Host "`n   Es necesario vincular el proyecto. Ejecutando railway link..." -ForegroundColor Yellow
    
    # Verificar si el usuario está autenticado
    try {
        $whoamiOutput = railway whoami 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✓ Usuario autenticado en Railway: $whoamiOutput" -ForegroundColor Green
        } else {
            Write-Host "   ❌ No has iniciado sesión en Railway" -ForegroundColor Red
            Write-Host "`n   Iniciando sesión en Railway (modo sin navegador)..." -ForegroundColor Yellow
            Write-Host "   Se te proporcionará un código y una URL para autenticarte." -ForegroundColor Yellow
            railway login --browserless
            if ($LASTEXITCODE -ne 0) {
                Write-Host "   ❌ Error al iniciar sesión en Railway" -ForegroundColor Red
                Write-Host "   Intenta ejecutar 'railway login --browserless' manualmente" -ForegroundColor Yellow
                exit 1
            }
        }
    } catch {
        Write-Host "   ❌ Error al verificar autenticación: $_" -ForegroundColor Red
        exit 1
    }
    
    # Vincular proyecto
    Write-Host "`n   Vinculando proyecto Railway. Selecciona el proyecto 'historias-desopilantes' cuando se te solicite." -ForegroundColor Yellow
    railway link
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Error al vincular el proyecto Railway" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✓ Proyecto Railway vinculado correctamente" -ForegroundColor Green
}

# 4. Desplegar en Railway
if (-not $SkipDeploy) {
    Write-Host "`n4. Desplegando en Railway..." -ForegroundColor Yellow
    Write-Host "   Este proceso puede tardar varios minutos..." -ForegroundColor White
    
    railway up
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Error al desplegar en Railway" -ForegroundColor Red
    } else {
        Write-Host "   ✓ Despliegue en Railway completado exitosamente" -ForegroundColor Green
    }
} else {
    Write-Host "`n4. Despliegue en Railway omitido (se especificó -SkipDeploy)" -ForegroundColor Yellow
}

# 5. Verificar la API desplegada
Write-Host "`n5. Verificando API desplegada..." -ForegroundColor Yellow

$apiUrl = "https://historias-desopilantes-react-production.up.railway.app/api/stories/1/comments"
try {
    $response = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing -TimeoutSec 15
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ API de comentarios responde correctamente (status: $($response.StatusCode))" -ForegroundColor Green
        Write-Host "   ✓ Endpoint de comentarios funcionando: $apiUrl" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ API responde con código: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   ❌ Error al verificar API: HTTP $statusCode" -ForegroundColor Red
    Write-Host "   Es posible que el despliegue aún no haya terminado o que la ruta no existe" -ForegroundColor Red
}

# Resumen final
Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "              CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

Write-Host "`nPróximos pasos:" -ForegroundColor White
Write-Host "1. Verifica el funcionamiento de los endpoints de comentarios:" -ForegroundColor Yellow
Write-Host "   $apiUrl" -ForegroundColor White
Write-Host "`n2. Si continúas viendo errores 404, utiliza la solución del lado del cliente:" -ForegroundColor Yellow
Write-Host "   Abre $workspaceDir\solucionar-404-comments.html en tu navegador" -ForegroundColor White
Write-Host "`n3. Para verificar que la configuración se ha aplicado correctamente, ejecuta:" -ForegroundColor Yellow
Write-Host "   .\diagnostico-integral.ps1" -ForegroundColor White

# Volver al directorio principal
Set-Location -Path $workspaceDir
