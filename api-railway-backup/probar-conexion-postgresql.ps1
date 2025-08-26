# Script para probar la conexión a PostgreSQL en Railway
# Autor: GitHub Copilot
# Fecha: 25 de agosto de 2023

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

# Banner de inicio
Write-ColorMessage "`n==================================================" $Cyan
Write-ColorMessage "🔍 PRUEBA DE CONEXIÓN POSTGRESQL EN RAILWAY" $Cyan
Write-ColorMessage "==================================================" $Cyan
Write-ColorMessage "Este script prueba la conexión a PostgreSQL con diferentes" $Cyan
Write-ColorMessage "configuraciones SSL para diagnosticar problemas." $Cyan
Write-ColorMessage "==================================================" $Cyan

# Verificar si Node.js está instalado
Write-ColorMessage "`n🔍 Verificando Node.js..." $Yellow
$nodeVersion = node -v 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "❌ Node.js no está instalado o no está en el PATH." $Red
    Write-ColorMessage "Por favor, instala Node.js desde https://nodejs.org/" $Red
    exit 1
}

Write-ColorMessage "✅ Node.js detectado: $nodeVersion" $Green

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
Write-ColorMessage "`n⚙️ Seleccionando proyecto..." $Yellow
railway link

if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "❌ Error al seleccionar el proyecto." $Red
    exit 1
}

Write-ColorMessage "✅ Proyecto seleccionado correctamente" $Green

# Verificar si el archivo de prueba existe
$testFile = "test-postgresql-connection.js"
if (-not (Test-Path $testFile)) {
    Write-ColorMessage "`n❌ No se encuentra el archivo $testFile" $Red
    Write-ColorMessage "⚠️ Por favor, asegúrate de que este archivo exista en el directorio actual." $Yellow
    exit 1
}

# Verificar dependencias de Node.js
Write-ColorMessage "`n🔍 Verificando dependencias..." $Yellow

# Verificar si pg está instalado
$pgInstalled = npm list pg | Select-String "pg@"
if (-not $pgInstalled) {
    Write-ColorMessage "📥 Instalando el paquete 'pg' para PostgreSQL..." $Yellow
    npm install pg --no-save
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorMessage "❌ Error al instalar el paquete 'pg'." $Red
        exit 1
    }
}

Write-ColorMessage "✅ Dependencias verificadas correctamente" $Green

# Ejecutar prueba de conexión local
Write-ColorMessage "`n🔍 Ejecutando prueba de conexión con variables locales..." $Yellow

# Recuperar variables de Railway para PostgreSQL
Write-ColorMessage "📥 Obteniendo variables de PostgreSQL de Railway..." $Yellow

$pgUser = railway variables get PGUSER 2>&1
$pgPassword = railway variables get PGPASSWORD 2>&1
$pgHost = railway variables get PGHOST 2>&1
$pgPort = railway variables get PGPORT 2>&1
$pgDatabase = railway variables get PGDATABASE 2>&1
$databaseUrl = railway variables get DATABASE_URL 2>&1

# Verificar si se pudieron obtener las variables
$hasVariables = $true

if ($LASTEXITCODE -ne 0 -or $pgUser -match "Variable .* not found") {
    Write-ColorMessage "⚠️ No se pudo obtener PGUSER desde Railway" $Yellow
    $hasVariables = $false
}

if ($LASTEXITCODE -ne 0 -or $pgPassword -match "Variable .* not found") {
    Write-ColorMessage "⚠️ No se pudo obtener PGPASSWORD desde Railway" $Yellow
    $hasVariables = $false
}

if ($LASTEXITCODE -ne 0 -or $pgHost -match "Variable .* not found") {
    Write-ColorMessage "⚠️ No se pudo obtener PGHOST desde Railway" $Yellow
    $hasVariables = $false
}

if ($LASTEXITCODE -ne 0 -or $pgPort -match "Variable .* not found") {
    Write-ColorMessage "⚠️ No se pudo obtener PGPORT desde Railway" $Yellow
    $pgPort = "5432" # Valor por defecto
}

if ($LASTEXITCODE -ne 0 -or $pgDatabase -match "Variable .* not found") {
    Write-ColorMessage "⚠️ No se pudo obtener PGDATABASE desde Railway" $Yellow
    $hasVariables = $false
}

if ($LASTEXITCODE -ne 0 -or $databaseUrl -match "Variable .* not found") {
    Write-ColorMessage "⚠️ No se pudo obtener DATABASE_URL desde Railway" $Yellow
    # DATABASE_URL es opcional si se tienen las otras variables
}

if (-not $hasVariables) {
    Write-ColorMessage "`n⚠️ Algunas variables de PostgreSQL no están configuradas en Railway." $Yellow
    Write-ColorMessage "¿Deseas ingresar los valores manualmente? (S/N)" $Yellow
    $manualInput = Read-Host

    if ($manualInput -eq "S" -or $manualInput -eq "s") {
        # Solicitar información manualmente
        $pgUser = Read-Host "Usuario de PostgreSQL (default: postgres)"
        if ([string]::IsNullOrEmpty($pgUser)) { $pgUser = "postgres" }
        
        $securePassword = Read-Host "Contraseña de PostgreSQL" -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
        $pgPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
        
        $pgHost = Read-Host "Host de PostgreSQL (default: localhost)"
        if ([string]::IsNullOrEmpty($pgHost)) { $pgHost = "localhost" }
        
        $pgPort = Read-Host "Puerto de PostgreSQL (default: 5432)"
        if ([string]::IsNullOrEmpty($pgPort)) { $pgPort = "5432" }
        
        $pgDatabase = Read-Host "Nombre de la base de datos (default: railway)"
        if ([string]::IsNullOrEmpty($pgDatabase)) { $pgDatabase = "railway" }
        
        # Construir DATABASE_URL
        $escapedPassword = [Uri]::EscapeDataString($pgPassword)
        $databaseUrl = "postgresql://${pgUser}:${escapedPassword}@${pgHost}:${pgPort}/${pgDatabase}"
    } else {
        Write-ColorMessage "⚠️ Se utilizarán variables predeterminadas para la prueba, pero es probable que fallen." $Yellow
    }
}

Write-ColorMessage "`n🔧 Ejecutando prueba de conexión a PostgreSQL..." $Yellow
Write-ColorMessage "Este proceso puede tardar unos segundos..." $Yellow

# Configurar variables de entorno para la prueba
$env:PGUSER = $pgUser
$env:PGPASSWORD = $pgPassword
$env:PGHOST = $pgHost
$env:PGPORT = $pgPort
$env:PGDATABASE = $pgDatabase
$env:DATABASE_URL = $databaseUrl

# Ejecutar el script de prueba
node $testFile

if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "`n❌ La prueba de conexión falló." $Red
} else {
    Write-ColorMessage "`n✅ Prueba de conexión completada." $Green
}

# Instrucciones finales
Write-ColorMessage "`n==================================================" $Cyan
Write-ColorMessage "🔍 DIAGNÓSTICO DE CONEXIÓN POSTGRESQL" $Cyan
Write-ColorMessage "==================================================" $Cyan
Write-ColorMessage "Si se encontró una estrategia exitosa, utiliza esa configuración" $Cyan
Write-ColorMessage "en tus archivos db-setup-v2.js y server-auto-init-v2.js." $Cyan
Write-ColorMessage "`nSi todas las estrategias fallaron:" $Cyan
Write-ColorMessage "1. Verifica que las credenciales sean correctas" $Cyan
Write-ColorMessage "2. Asegúrate de que el servicio PostgreSQL esté activo en Railway" $Cyan
Write-ColorMessage "3. Verifica que las variables de entorno estén correctamente configuradas" $Cyan
Write-ColorMessage "==================================================" $Cyan

Write-Host "`nPresiona cualquier tecla para finalizar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
