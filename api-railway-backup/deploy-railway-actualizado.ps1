# Script PowerShell para desplegar a Railway de forma optimizada
# Autor: GitHub Copilot
# Fecha: Versión actualizada - 25 de agosto de 2025

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

function Wait-KeyPress {
    param (
        [string]$Message = "Presiona cualquier tecla para continuar..."
    )
    
    Write-Host $Message
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
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

# Verificar que estamos en el directorio correcto (api-railway)
$currentDir = Split-Path -Leaf (Get-Location)
if ($currentDir -ne "api-railway") {
    $apiRailwayPath = Join-Path (Get-Location) "api-railway"
    
    if (Test-Path $apiRailwayPath) {
        Write-ColorMessage "⚠️ Cambiando al directorio api-railway..." $Yellow
        Set-Location $apiRailwayPath
    } else {
        Write-ColorMessage "❌ No se encuentra el directorio api-railway. Asegúrate de estar en la raíz del proyecto." $Red
        exit 1
    }
}

# Banner de inicio
Write-ColorMessage "`n==================================================" $Cyan
Write-ColorMessage "🚂 DESPLIEGUE DE HISTORIAS DESOPILANTES EN RAILWAY" $Cyan
Write-ColorMessage "==================================================" $Cyan
Write-ColorMessage "Este script automatiza el proceso de despliegue a Railway." $Cyan
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
    Write-ColorMessage "❌ Error al seleccionar el proyecto. Asegúrate de que tienes al menos un proyecto en Railway." $Red
    exit 1
}

Write-ColorMessage "✅ Proyecto seleccionado correctamente" $Green

# Seleccionar servicio
Write-ColorMessage "`n⚙️ Seleccionando servicio..." $Yellow
railway service

if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "❌ Error al seleccionar el servicio." $Red
    
    # Preguntar si desea crear un nuevo servicio
    Write-ColorMessage "`n⚠️ ¿Deseas crear un nuevo servicio? (S/N)" $Yellow
    $createService = Read-Host
    
    if ($createService -eq "S" -or $createService -eq "s") {
        Write-ColorMessage "`n🔧 Creando nuevo servicio..." $Yellow
        railway service create
        
        if ($LASTEXITCODE -ne 0) {
            Write-ColorMessage "❌ Error al crear el servicio." $Red
            exit 1
        }
        
        # Enlazar el nuevo servicio
        railway service
    } else {
        exit 1
    }
}

# Mostrar variables de entorno actuales
Write-ColorMessage "`n📋 Variables de entorno actuales:" $Yellow
railway variables

# Verificar y actualizar variables de PostgreSQL si es necesario
Write-ColorMessage "`n⚠️ ¿Deseas actualizar las variables de entorno? (S/N)" $Yellow
$updateVars = Read-Host

if ($updateVars -eq "S" -or $updateVars -eq "s") {
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
    railway variables set PGUSER=$pgUser
    railway variables set PGPASSWORD=$pgPasswordText
    railway variables set PGHOST=$pgHost
    railway variables set PGPORT=$pgPort
    railway variables set PGDATABASE=$pgDatabase
    railway variables set POSTGRES_PASSWORD=$pgPasswordText
    railway variables set DATABASE_URL=$connectionString
    
    Write-ColorMessage "✅ Variables de entorno actualizadas" $Green
    
    # Preguntar si desea configurar un plugin de PostgreSQL en Railway
    Write-ColorMessage "`n⚠️ ¿Deseas agregar un plugin de PostgreSQL a tu proyecto en Railway? (S/N)" $Yellow
    $addPgPlugin = Read-Host
    
    if ($addPgPlugin -eq "S" -or $addPgPlugin -eq "s") {
        Write-ColorMessage "`n🔧 Abriendo Railway para configurar el plugin de PostgreSQL..." $Yellow
        Start-Process "https://railway.app/dashboard"
        
        Write-ColorMessage "Por favor, sigue estos pasos en la interfaz web de Railway:" $Yellow
        Write-ColorMessage "1. Ve a tu proyecto" $Yellow
        Write-ColorMessage "2. Haz clic en 'New' y selecciona 'Database > PostgreSQL'" $Yellow
        Write-ColorMessage "3. Una vez creado, Railway generará automáticamente las variables de conexión" $Yellow
        
        Wait-KeyPress "`nPresiona cualquier tecla cuando hayas completado estos pasos..."
        
        # Actualizar variables desde Railway
        Write-ColorMessage "`n🔄 Actualizando variables desde Railway..." $Yellow
        railway variables
    }
}

# Preguntar qué archivo Dockerfile usar
Write-ColorMessage "`n📋 Selecciona el Dockerfile a utilizar:" $Yellow
Write-ColorMessage "1) Dockerfile (predeterminado)" $Yellow
Write-ColorMessage "2) Dockerfile.optimized (recomendado para Railway)" $Yellow
$dockerfileOption = Read-Host "Selección (1-2)"

$dockerfilePath = "Dockerfile"
if ($dockerfileOption -eq "2") {
    $dockerfilePath = "Dockerfile.optimized"
    
    # Copiar Dockerfile.optimized a Dockerfile para el despliegue
    Write-ColorMessage "`n🔄 Copiando Dockerfile.optimized a Dockerfile..." $Yellow
    Copy-Item -Path "Dockerfile.optimized" -Destination "Dockerfile" -Force
}

# Preguntar qué servidor usar
Write-ColorMessage "`n📋 Selecciona el archivo de servidor a utilizar:" $Yellow
Write-ColorMessage "1) server.js (predeterminado)" $Yellow
Write-ColorMessage "2) server-auto-init.js (con auto-inicialización de base de datos)" $Yellow
$serverOption = Read-Host "Selección (1-2)"

if ($serverOption -eq "2") {
    # Actualizar el Dockerfile para usar server-auto-init.js
    Write-ColorMessage "`n🔄 Actualizando Dockerfile para usar server-auto-init.js..." $Yellow
    (Get-Content -Path "Dockerfile") -replace 'CMD \["node", "server\.js"\]', 'CMD ["node", "server-auto-init.js"]' | Set-Content -Path "Dockerfile"
}

# Preparar para despliegue
Write-ColorMessage "`n⚙️ Preparando despliegue..." $Yellow

# Crear o actualizar .gitignore si es necesario
if (-not (Test-Path ".gitignore")) {
    @"
# Node.js
node_modules/
npm-debug.log
yarn-error.log

# Archivos de entorno
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Archivos temporales
tmp/
temp/
.DS_Store

# Archivos de compilación
build/
dist/
"@ | Set-Content ".gitignore"
    Write-ColorMessage "✅ Archivo .gitignore creado" $Green
}

# Verificar si package.json tiene scripts necesarios
$packageJsonPath = "package.json"
if (Test-Path $packageJsonPath) {
    $packageJsonContent = Get-Content $packageJsonPath -Raw
    try {
        $packageJson = $packageJsonContent | ConvertFrom-Json
        $hasStartScript = $false

        if ($packageJson.scripts -and $packageJson.scripts.start) {
            $hasStartScript = $true
        } else {
            Write-ColorMessage "`n⚠️ El archivo package.json no tiene un script 'start'. Agregándolo..." $Yellow
            
            # Agregar script start antes del cierre de scripts o crear la sección
            if ($packageJsonContent -match '"scripts"\s*:\s*{') {
                $packageJsonContent = $packageJsonContent -replace '("scripts"\s*:\s*{)', "`$1`n    ""start"": ""node server-auto-init.js"","
            } else {
                # Si no hay sección scripts, crearla antes de la última llave
                $packageJsonContent = $packageJsonContent -replace '}$', '  "scripts": {
    "start": "node server-auto-init.js"
  }
}'
            }
            
            # Guardar cambios
            $packageJsonContent | Set-Content $packageJsonPath
            Write-ColorMessage "✅ Script 'start' agregado a package.json" $Green
        }
    } catch {
        Write-ColorMessage "⚠️ Error al procesar package.json: $_" $Yellow
    }
} else {
    Write-ColorMessage "`n⚠️ No se encontró el archivo package.json. Creándolo..." $Yellow
    
    @"
{
  "name": "historias-desopilantes-api",
  "version": "1.0.0",
  "description": "API para Historias Desopilantes",
  "main": "server-auto-init.js",
  "scripts": {
    "start": "node server-auto-init.js",
    "dev": "nodemon server-auto-init.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
"@ | Set-Content $packageJsonPath
    
    Write-ColorMessage "✅ Archivo package.json creado" $Green
    
    # Instalar dependencias
    Write-ColorMessage "`n📦 Instalando dependencias..." $Yellow
    npm install
}

# Iniciar despliegue
Write-ColorMessage "`n🚀 Iniciando despliegue a Railway..." $Yellow
Write-ColorMessage "Este proceso puede tardar varios minutos. Por favor, espera..." $Yellow

railway up

if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "`n❌ Error durante el despliegue. Revisa los mensajes anteriores." $Red
    
    # Ofrecer ver los logs
    Write-ColorMessage "`n⚠️ ¿Deseas ver los logs detallados? (S/N)" $Yellow
    $viewLogs = Read-Host
    
    if ($viewLogs -eq "S" -or $viewLogs -eq "s") {
        railway logs
    }
    
    exit 1
}

Write-ColorMessage "`n✅ ¡Despliegue completado con éxito!" $Green

# Obtener la URL del servicio
Write-ColorMessage "`n🔍 Obteniendo URL del servicio..." $Yellow
railway service show --json 2>$null

# Intentar mostrar la URL del servicio
$serviceUrlOutput = $LASTEXITCODE -eq 0
if ($serviceUrlOutput) {
    try {
        # Abrir en el navegador
        Write-ColorMessage "`n🌐 Abriendo la URL del servicio en el navegador..." $Green
        railway open
    } catch {
        Write-ColorMessage "`n⚠️ No se pudo obtener la URL del servicio automáticamente." $Yellow
        Write-ColorMessage "Puedes encontrarla en el panel de Railway o usando 'railway open'." $Yellow
    }
} else {
    Write-ColorMessage "`n⚠️ No se pudo obtener la URL del servicio automáticamente." $Yellow
    Write-ColorMessage "Puedes encontrarla en el panel de Railway o usando 'railway open'." $Yellow
}

# Ofrecer inicializar base de datos directamente
Write-ColorMessage "`n⚠️ ¿Deseas ejecutar la inicialización de la base de datos directamente? (S/N)" $Yellow
$initDb = Read-Host

if ($initDb -eq "S" -or $initDb -eq "s") {
    # Verificar si el archivo create-tables-direct.js existe
    if (-not (Test-Path "create-tables-direct.js")) {
        Write-ColorMessage "`n❌ No se encontró el archivo create-tables-direct.js." $Red
        Write-ColorMessage "Asegúrate de que este archivo exista en el directorio actual." $Red
    } else {
        Write-ColorMessage "`n🔧 Ejecutando inicialización de base de datos..." $Yellow
        railway run node create-tables-direct.js
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorMessage "✅ Inicialización de base de datos completada" $Green
        } else {
            Write-ColorMessage "⚠️ Se produjeron errores durante la inicialización de la base de datos." $Yellow
            Write-ColorMessage "Verifica los logs para más información." $Yellow
        }
    }
}

# Ofrecer probar la conexión a la base de datos
Write-ColorMessage "`n⚠️ ¿Deseas probar la conexión a la base de datos? (S/N)" $Yellow
$testDb = Read-Host

if ($testDb -eq "S" -or $testDb -eq "s") {
    # Verificar si el archivo test-db-connection.js existe
    if (-not (Test-Path "test-db-connection.js")) {
        Write-ColorMessage "`n❌ No se encontró el archivo test-db-connection.js." $Red
        Write-ColorMessage "Asegúrate de que este archivo exista en el directorio actual." $Red
    } else {
        Write-ColorMessage "`n🔧 Probando conexión a la base de datos..." $Yellow
        railway run node test-db-connection.js
    }
}

# Instrucciones finales
Write-ColorMessage "`n==================================================" $Cyan
Write-ColorMessage "✅ DESPLIEGUE COMPLETADO" $Green
Write-ColorMessage "==================================================" $Cyan
Write-ColorMessage "🔍 Para ver los logs del servicio:" $Cyan
Write-ColorMessage "   railway logs" $Cyan
Write-ColorMessage "`n🔄 Para redesplegarlo en el futuro:" $Cyan
Write-ColorMessage "   railway up" $Cyan
Write-ColorMessage "`n🌐 Para abrir la URL del servicio:" $Cyan
Write-ColorMessage "   railway open" $Cyan
Write-ColorMessage "==================================================" $Cyan

Wait-KeyPress "`nPresiona cualquier tecla para finalizar..."
