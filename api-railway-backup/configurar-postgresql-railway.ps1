# Script para configurar variables de PostgreSQL en Railway
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
Write-ColorMessage "🔧 CONFIGURACIÓN DE POSTGRESQL PARA RAILWAY" $Cyan
Write-ColorMessage "==================================================" $Cyan
Write-ColorMessage "Este script configura las variables de PostgreSQL en Railway." $Cyan
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
Write-ColorMessage "`n⚙️ Seleccionando proyecto..." $Yellow
railway link

if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "❌ Error al seleccionar el proyecto." $Red
    exit 1
}

Write-ColorMessage "✅ Proyecto seleccionado correctamente" $Green

# Seleccionar servicio
Write-ColorMessage "`n⚙️ Seleccionando servicio..." $Yellow
railway service

if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "❌ Error al seleccionar el servicio." $Red
    exit 1
}

Write-ColorMessage "✅ Servicio seleccionado correctamente" $Green

# Mostrar variables de entorno actuales
Write-ColorMessage "`n📋 Variables de entorno actuales:" $Yellow
railway variables

# Preguntar si queremos usar un plugin de PostgreSQL
Write-ColorMessage "`n⚠️ ¿Estás usando un plugin de PostgreSQL en Railway? (S/N)" $Yellow
Write-ColorMessage "(Si respondes S, se intentará usar las variables generadas por Railway)" $Yellow
$usingPlugin = Read-Host

if ($usingPlugin -eq "S" -or $usingPlugin -eq "s") {
    Write-ColorMessage "`n📝 Configurando variables para usar con el plugin de PostgreSQL..." $Yellow
    
    # Las variables ya deberían estar configuradas por el plugin, solo necesitamos
    # asegurarnos de que también tengamos las variables individuales
    
    # Obtener la URL de la base de datos (debería estar configurada por el plugin)
    $databaseUrl = railway variables get DATABASE_URL 2>&1
    
    if ($LASTEXITCODE -ne 0 -or $databaseUrl -match "Variable .* not found") {
        Write-ColorMessage "⚠️ No se encontró la variable DATABASE_URL." $Yellow
        Write-ColorMessage "¿Estás seguro de que el plugin de PostgreSQL está correctamente configurado?" $Yellow
        
        # Preguntar si queremos configurar las variables manualmente
        Write-ColorMessage "`n⚠️ ¿Deseas configurar las variables manualmente? (S/N)" $Yellow
        $manualConfig = Read-Host
        
        if ($manualConfig -ne "S" -and $manualConfig -ne "s") {
            exit 1
        }
    } else {
        Write-ColorMessage "✅ Se encontró DATABASE_URL configurada por el plugin" $Green
        
        # Intentar extraer los componentes de la URL
        if ($databaseUrl -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
            $pgUser = $matches[1]
            $pgPassword = $matches[2]
            $pgHost = $matches[3]
            $pgPort = $matches[4]
            $pgDatabase = $matches[5]
            
            # Configurar variables individuales
            railway variables set PGUSER=$pgUser
            railway variables set PGPASSWORD=$pgPassword
            railway variables set PGHOST=$pgHost
            railway variables set PGPORT=$pgPort
            railway variables set PGDATABASE=$pgDatabase
            railway variables set POSTGRES_PASSWORD=$pgPassword
            
            Write-ColorMessage "✅ Variables individuales configuradas a partir de DATABASE_URL" $Green
            
            # Mostrar variables configuradas (sin la contraseña)
            Write-ColorMessage "`n📋 Variables configuradas:" $Green
            Write-ColorMessage "PGUSER: $pgUser" $Green
            Write-ColorMessage "PGHOST: $pgHost" $Green
            Write-ColorMessage "PGPORT: $pgPort" $Green
            Write-ColorMessage "PGDATABASE: $pgDatabase" $Green
            
            # Salir del script ya que todo está configurado
            Write-ColorMessage "`n✅ Configuración completada con éxito" $Green
            exit 0
        } else {
            Write-ColorMessage "⚠️ No se pudo parsear DATABASE_URL. Configurando manualmente..." $Yellow
        }
    }
}

# Configuración manual
Write-ColorMessage "`n📝 Configurando variables para PostgreSQL..." $Yellow

$pgUser = Read-Host "Usuario de PostgreSQL (default: postgres)"
if ([string]::IsNullOrEmpty($pgUser)) { $pgUser = "postgres" }

$pgPassword = Read-Host "Contraseña de PostgreSQL" -AsSecureString
$pgPasswordText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword))

$pgHost = Read-Host "Host de PostgreSQL (default: localhost)"
if ([string]::IsNullOrEmpty($pgHost)) { $pgHost = "localhost" }

$pgPort = Read-Host "Puerto de PostgreSQL (default: 5432)"
if ([string]::IsNullOrEmpty($pgPort)) { $pgPort = "5432" }

$pgDatabase = Read-Host "Nombre de la base de datos (default: railway)"
if ([string]::IsNullOrEmpty($pgDatabase)) { $pgDatabase = "railway" }

# Crear una cadena de conexión (con manejo seguro de caracteres especiales)
$escapedPassword = [Uri]::EscapeDataString($pgPasswordText)
$connectionString = "postgresql://${pgUser}:${escapedPassword}@${pgHost}:${pgPort}/${pgDatabase}"

# Configurar variables
Write-ColorMessage "`n🔧 Configurando variables en Railway..." $Yellow

Write-ColorMessage "Configurando PGUSER..." $Yellow
railway variables set PGUSER=$pgUser

Write-ColorMessage "Configurando PGPASSWORD..." $Yellow
railway variables set PGPASSWORD=$pgPasswordText

Write-ColorMessage "Configurando PGHOST..." $Yellow
railway variables set PGHOST=$pgHost

Write-ColorMessage "Configurando PGPORT..." $Yellow
railway variables set PGPORT=$pgPort

Write-ColorMessage "Configurando PGDATABASE..." $Yellow
railway variables set PGDATABASE=$pgDatabase

Write-ColorMessage "Configurando POSTGRES_PASSWORD..." $Yellow
railway variables set POSTGRES_PASSWORD=$pgPasswordText

Write-ColorMessage "Configurando DATABASE_URL..." $Yellow
railway variables set DATABASE_URL=$connectionString

Write-ColorMessage "`n✅ Variables de entorno configuradas" $Green

# Mostrar variables configuradas (sin la contraseña)
Write-ColorMessage "`n📋 Variables configuradas:" $Green
Write-ColorMessage "PGUSER: $pgUser" $Green
Write-ColorMessage "PGHOST: $pgHost" $Green
Write-ColorMessage "PGPORT: $pgPort" $Green
Write-ColorMessage "PGDATABASE: $pgDatabase" $Green
Write-ColorMessage "DATABASE_URL: postgresql://${pgUser}:********@${pgHost}:${pgPort}/${pgDatabase}" $Green

# Verificar la configuración
Write-ColorMessage "`n⚠️ ¿Deseas verificar las variables configuradas en Railway? (S/N)" $Yellow
$verifyConfig = Read-Host

if ($verifyConfig -eq "S" -or $verifyConfig -eq "s") {
    Write-ColorMessage "`n📋 Variables en Railway:" $Yellow
    railway variables
}

Write-ColorMessage "`n✅ Configuración de PostgreSQL completada" $Green
Write-Host "`nPresiona cualquier tecla para finalizar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
