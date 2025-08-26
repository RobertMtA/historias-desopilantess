# Script para ejecutar el solucionador de conexión SSL
# Autor: GitHub Copilot
# Fecha: 25 de agosto de 2025

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
Write-ColorMessage "🛠️ SOLUCIONADOR DE CONEXIÓN SSL POSTGRESQL" $Cyan
Write-ColorMessage "==================================================" $Cyan
Write-ColorMessage "Este script solucionará los problemas de conexión SSL" $Cyan
Write-ColorMessage "a PostgreSQL en Railway y generará archivos de configuración" $Cyan
Write-ColorMessage "con la solución que funcione." $Cyan
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

# Verificar si el archivo fix-ssl-connection.js existe
$fixScript = "fix-ssl-connection.js"
if (-not (Test-Path $fixScript)) {
    Write-ColorMessage "`n❌ No se encuentra el archivo $fixScript" $Red
    Write-ColorMessage "Este archivo es necesario para ejecutar el solucionador." $Red
    exit 1
}

# Verificar dependencias
Write-ColorMessage "`n📥 Verificando dependencias..." $Yellow

# Instalar dependencias si no existen
if (-not (Test-Path "node_modules/pg")) {
    Write-ColorMessage "Instalando módulo pg..." $Yellow
    npm install pg --no-save
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorMessage "⚠️ Advertencia: Error al instalar pg, pero intentaremos continuar." $Yellow
    }
}

if (-not (Test-Path "node_modules/dotenv")) {
    Write-ColorMessage "Instalando módulo dotenv..." $Yellow
    npm install dotenv --no-save
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorMessage "⚠️ Advertencia: Error al instalar dotenv, pero intentaremos continuar." $Yellow
    }
}

# Verificar si existe archivo .env
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-ColorMessage "`n⚠️ No se encontró el archivo .env" $Yellow
    Write-ColorMessage "¿Deseas crear uno ahora? (S/N)" $Yellow
    $createEnv = Read-Host
    
    if ($createEnv -eq "S" -or $createEnv -eq "s") {
        # Solicitar información
        Write-ColorMessage "`n📋 Ingresa la información para el archivo .env:" $Yellow
        
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
        
        # Crear contenido del archivo .env
        $envContent = @"
# Configuración de PostgreSQL para Railway
# Generado automáticamente: $(Get-Date -Format "dd-MM-yyyy HH:mm:ss")

# Variables estándar de PostgreSQL
PGUSER=$pgUser
PGPASSWORD=$pgPassword
PGHOST=$pgHost
PGPORT=$pgPort
PGDATABASE=$pgDatabase

# URL de conexión completa
DATABASE_URL=postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}

# Configuración adicional
NODE_ENV=production
PORT=8080
"@
        
        # Guardar archivo .env
        $envContent | Out-File -FilePath $envFile -Encoding utf8 -Force
        Write-ColorMessage "✅ Archivo .env creado correctamente" $Green
    } else {
        Write-ColorMessage "⚠️ Continuando sin archivo .env. Es posible que el script no funcione correctamente." $Yellow
    }
}

# Ejecutar el solucionador
Write-ColorMessage "`n🚀 Ejecutando solucionador de conexión SSL..." $Yellow
Write-ColorMessage "Este proceso puede tardar unos segundos mientras prueba diferentes configuraciones..." $Yellow

node $fixScript

$scriptExitCode = $LASTEXITCODE

if ($scriptExitCode -ne 0) {
    Write-ColorMessage "`n❌ El solucionador encontró problemas." $Red
    Write-ColorMessage "Revisa los mensajes de error anteriores para más información." $Red
} else {
    # Verificar si se crearon los archivos de solución
    if (Test-Path "db-config.js") {
        Write-ColorMessage "`n✅ ¡Solución generada correctamente!" $Green
        Write-ColorMessage "Se han creado los siguientes archivos:" $Green
        Write-ColorMessage "  - db-config.js: Contiene la configuración que funciona" $Green
        Write-ColorMessage "  - ejemplo-conexion-db.js: Ejemplo de cómo usar la configuración" $Green
        
        # Preguntar si quiere probar el ejemplo
        Write-ColorMessage "`n¿Deseas probar el ejemplo de conexión? (S/N)" $Yellow
        $runExample = Read-Host
        
        if ($runExample -eq "S" -or $runExample -eq "s") {
            Write-ColorMessage "`n🚀 Ejecutando ejemplo..." $Yellow
            node ejemplo-conexion-db.js
        }
    } else {
        Write-ColorMessage "`n⚠️ El solucionador se ejecutó, pero no se generaron archivos de solución." $Yellow
        Write-ColorMessage "Es posible que ninguna configuración haya funcionado." $Yellow
    }
}

# Instrucciones finales
Write-ColorMessage "`n==================================================" $Cyan
Write-ColorMessage "INSTRUCCIONES PARA USAR LA SOLUCIÓN" $Cyan
Write-ColorMessage "==================================================" $Cyan
Write-ColorMessage "1. En tus archivos de servidor, importa la configuración:" $Cyan
Write-ColorMessage "   const { pool } = require('./db-config');" $Cyan
Write-ColorMessage "`n2. Usa el pool para consultas:" $Cyan
Write-ColorMessage "   const result = await pool.query('SELECT * FROM tabla');" $Cyan
Write-ColorMessage "`n3. Para actualizar tu servidor con esta solución:" $Cyan
Write-ColorMessage "   - Copia db-config.js a tu proyecto" $Cyan
Write-ColorMessage "   - Modifica tu servidor para usar esta configuración" $Cyan
Write-ColorMessage "   - Asegúrate de tener el archivo .env configurado" $Cyan
Write-ColorMessage "==================================================" $Cyan

Write-Host "`nPresiona cualquier tecla para finalizar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
