# Script PowerShell para verificar el estado de los servicios en Railway
# Autor: GitHub Copilot

# Colores para los mensajes
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Yellow = [System.ConsoleColor]::Yellow
$Cyan = [System.ConsoleColor]::Cyan

function Write-ColorMessage {
    param (
        [string]$Message,
        [System.ConsoleColor]$Color = [System.ConsoleColor]::White
    )
    
    Write-Host $Message -ForegroundColor $Color
}

function Check-CommandExists {
    param (
        [string]$Command
    )
    
    $exists = Get-Command $Command -ErrorAction SilentlyContinue
    return $null -ne $exists
}

# Verificar que Railway CLI esté instalado
if (-not (Check-CommandExists "railway")) {
    Write-ColorMessage "❌ Railway CLI no está instalado. Instalándolo..." $Red
    npm install -g @railway/cli
    
    # Verificar de nuevo
    if (-not (Check-CommandExists "railway")) {
        Write-ColorMessage "❌ No se pudo instalar Railway CLI. Asegúrate de tener Node.js y npm instalados." $Red
        exit 1
    }
}

# Banner de inicio
Write-ColorMessage "`n==================================================" $Cyan
Write-ColorMessage "🔍 VERIFICACIÓN DE ESTADO DE SERVICIOS EN RAILWAY" $Cyan
Write-ColorMessage "==================================================" $Cyan
Write-ColorMessage "Este script comprueba el estado de los servicios en Railway." $Cyan
Write-ColorMessage "==================================================" $Cyan

# Verificar si estamos conectados a Railway
Write-ColorMessage "`n🔍 Verificando conexión con Railway..." $Yellow
$railwayStatus = railway whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "`n⚠️ No estás conectado a Railway. Iniciando sesión..." $Yellow
    railway login
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorMessage "❌ Error al iniciar sesión en Railway." $Red
        exit 1
    }
}

Write-ColorMessage "✅ Conectado a Railway correctamente" $Green

# Verificar y seleccionar el proyecto
Write-ColorMessage "`n🔍 Verificando proyectos en Railway..." $Yellow
railway projects

Write-ColorMessage "`n⚙️ Seleccionando proyecto..." $Yellow
railway link

if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "❌ Error al seleccionar el proyecto. Asegúrate de que tienes al menos un proyecto en Railway." $Red
    exit 1
}

Write-ColorMessage "✅ Proyecto seleccionado correctamente" $Green

# Verificar el estado de los servicios
Write-ColorMessage "`n🔍 Verificando estado de los servicios..." $Yellow
railway status

# Verificar las variables de entorno
Write-ColorMessage "`n📋 Variables de entorno configuradas:" $Yellow
railway variables

# Verificar los logs recientes
Write-ColorMessage "`n📊 Logs recientes:" $Yellow
railway logs --limit 10

# Ofrecer probar la conexión a la base de datos
Write-ColorMessage "`n⚠️ ¿Deseas probar la conexión a la base de datos? (S/N)" $Yellow
$testDb = Read-Host

if ($testDb -eq "S" -or $testDb -eq "s") {
    Write-ColorMessage "`n🔧 Ejecutando prueba de conexión a la base de datos..." $Yellow
    railway run node test-db-connection.js
}

# Ofrecer abrir la URL del servicio en el navegador
Write-ColorMessage "`n⚠️ ¿Deseas abrir la URL del servicio en el navegador? (S/N)" $Yellow
$openUrl = Read-Host

if ($openUrl -eq "S" -or $openUrl -eq "s") {
    Write-ColorMessage "`n🌐 Abriendo URL del servicio..." $Yellow
    railway open
}

# Instrucciones finales
Write-ColorMessage "`n==================================================" $Cyan
Write-ColorMessage "✅ VERIFICACIÓN COMPLETADA" $Green
Write-ColorMessage "==================================================" $Cyan
Write-ColorMessage "📋 Comandos útiles de Railway:" $Cyan
Write-ColorMessage "   railway logs              - Ver logs" $Cyan
Write-ColorMessage "   railway up                - Redesplegar" $Cyan
Write-ColorMessage "   railway open              - Abrir URL" $Cyan
Write-ColorMessage "   railway run [comando]     - Ejecutar comando" $Cyan
Write-ColorMessage "==================================================" $Cyan

Write-Host "`nPresiona cualquier tecla para finalizar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
