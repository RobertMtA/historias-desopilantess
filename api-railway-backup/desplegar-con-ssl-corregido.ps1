# Script para probar y desplegar con PostgreSQL en Railway
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
Write-ColorMessage "🔍 PRUEBA Y DESPLIEGUE DE POSTGRESQL EN RAILWAY" $Cyan
Write-ColorMessage "==================================================" $Cyan
Write-ColorMessage "Este script prueba y despliega la aplicación con PostgreSQL." $Cyan
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

# Verificar si existen los archivos necesarios
Write-ColorMessage "`n🔍 Verificando archivos necesarios..." $Yellow

# Verificar db-setup-v2.js
if (-not (Test-Path "db-setup-v2.js")) {
    Write-ColorMessage "❌ No se encuentra el archivo db-setup-v2.js" $Red
    Write-ColorMessage "⚠️ Por favor, asegúrate de que este archivo exista en el directorio actual." $Yellow
    exit 1
}

# Verificar server-auto-init-v2.js
if (-not (Test-Path "server-auto-init-v2.js")) {
    Write-ColorMessage "❌ No se encuentra el archivo server-auto-init-v2.js" $Red
    Write-ColorMessage "⚠️ Por favor, asegúrate de que este archivo exista en el directorio actual." $Yellow
    exit 1
}

Write-ColorMessage "✅ Todos los archivos necesarios encontrados" $Green

# Preparar Dockerfile optimizado
Write-ColorMessage "`n🔧 Preparando Dockerfile optimizado..." $Yellow

@"
# Base de Node.js LTS
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente
COPY . .

# Exponer puerto (Railway asigna PORT automáticamente)
EXPOSE 8080

# Script de inicio
CMD ["node", "server-auto-init-v2.js"]
"@ | Set-Content "Dockerfile"

Write-ColorMessage "✅ Dockerfile creado/actualizado" $Green

# Preparar package.json
Write-ColorMessage "`n🔧 Verificando package.json..." $Yellow

$packageJsonExists = Test-Path "package.json"
if ($packageJsonExists) {
    Write-ColorMessage "📝 Actualizando package.json existente..." $Yellow
    
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    
    # Actualizar propiedades necesarias
    $packageJson.main = "server-auto-init-v2.js"
    $packageJson.scripts.start = "node server-auto-init-v2.js"
    
    # Asegurar que las dependencias incluyan pg
    if (-not $packageJson.dependencies.pg) {
        $packageJson.dependencies | Add-Member -Name "pg" -Value "^8.11.3" -MemberType NoteProperty
    }
    
    # Guardar cambios
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
} else {
    Write-ColorMessage "📝 Creando nuevo package.json..." $Yellow
    
    @"
{
  "name": "historias-desopilantes-api",
  "version": "1.0.0",
  "description": "API para Historias Desopilantes",
  "main": "server-auto-init-v2.js",
  "scripts": {
    "start": "node server-auto-init-v2.js",
    "dev": "nodemon server-auto-init-v2.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "cors": "^2.8.5"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
"@ | Set-Content "package.json"
}

Write-ColorMessage "✅ package.json configurado correctamente" $Green

# Configurar variables de PostgreSQL
Write-ColorMessage "`n📝 Verificando variables para PostgreSQL..." $Yellow

# Mostrar variables actuales
Write-ColorMessage "📋 Variables de entorno actuales:" $Yellow
railway variables

# Preguntar si desea actualizar variables de entorno
Write-ColorMessage "`n⚠️ ¿Deseas actualizar las variables de PostgreSQL? (S/N)" $Yellow
$updateVars = Read-Host

if ($updateVars -eq "S" -or $updateVars -eq "s") {
    # Configurar host a localhost (importante para Railway)
    Write-ColorMessage "`n🔧 Configurando PGHOST a localhost..." $Yellow
    railway variables set PGHOST=localhost
    
    # Verificar otras variables necesarias
    $pgUser = railway variables get PGUSER 2>&1
    if ($LASTEXITCODE -ne 0 -or $pgUser -match "Variable .* not found") {
        $pgUser = Read-Host "Usuario de PostgreSQL (default: postgres)"
        if ([string]::IsNullOrEmpty($pgUser)) { $pgUser = "postgres" }
        railway variables set PGUSER=$pgUser
    }
    
    # Contraseña
    $pgPassword = railway variables get PGPASSWORD 2>&1
    if ($LASTEXITCODE -ne 0 -or $pgPassword -match "Variable .* not found") {
        $pgPassword = Read-Host "Contraseña de PostgreSQL" -AsSecureString
        $pgPasswordText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword))
        railway variables set PGPASSWORD="$pgPasswordText"
        railway variables set POSTGRES_PASSWORD="$pgPasswordText"
    }
    
    # Puerto
    $pgPort = railway variables get PGPORT 2>&1
    if ($LASTEXITCODE -ne 0 -or $pgPort -match "Variable .* not found") {
        $pgPort = Read-Host "Puerto de PostgreSQL (default: 5432)"
        if ([string]::IsNullOrEmpty($pgPort)) { $pgPort = "5432" }
        railway variables set PGPORT=$pgPort
    }
    
    # Base de datos
    $pgDatabase = railway variables get PGDATABASE 2>&1
    if ($LASTEXITCODE -ne 0 -or $pgDatabase -match "Variable .* not found") {
        $pgDatabase = Read-Host "Nombre de la base de datos (default: railway)"
        if ([string]::IsNullOrEmpty($pgDatabase)) { $pgDatabase = "railway" }
        railway variables set PGDATABASE=$pgDatabase
    }
    
    # Actualizar DATABASE_URL
    Write-ColorMessage "`n🔧 Actualizando DATABASE_URL..." $Yellow
    
    # Obtener los valores actualizados
    $pgUser = railway variables get PGUSER
    $pgPassword = railway variables get PGPASSWORD
    $pgHost = railway variables get PGHOST
    $pgPort = railway variables get PGPORT
    $pgDatabase = railway variables get PGDATABASE
    
    if ($pgUser -and $pgPassword -and $pgHost -and $pgPort -and $pgDatabase) {
        $escapedPassword = [Uri]::EscapeDataString($pgPassword)
        $connectionString = "postgresql://${pgUser}:${escapedPassword}@${pgHost}:${pgPort}/${pgDatabase}"
        railway variables set DATABASE_URL="$connectionString"
    }
    
    Write-ColorMessage "✅ Variables configuradas correctamente" $Green
    
    # Mostrar variables actualizadas
    Write-ColorMessage "`n📋 Variables configuradas:" $Green
    railway variables
}

# Desplegar la aplicación
Write-ColorMessage "`n🚀 Desplegando aplicación en Railway..." $Yellow
Write-ColorMessage "Este proceso puede tardar varios minutos. Por favor, espera..." $Yellow

railway up

if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "`n❌ Error durante el despliegue." $Red
    exit 1
}

Write-ColorMessage "`n✅ ¡Despliegue completado con éxito!" $Green

# Verificar logs
Write-ColorMessage "`n📝 Mostrando logs de la aplicación..." $Yellow
Write-Host "(Presiona Ctrl+C para salir de los logs)" -ForegroundColor $Yellow
railway logs

# Instrucciones finales
Write-ColorMessage "`n==================================================" $Cyan
Write-ColorMessage "✅ DESPLIEGUE COMPLETADO" $Green
Write-ColorMessage "==================================================" $Cyan
Write-ColorMessage "🔧 Si hay problemas con la conexión SSL a PostgreSQL, esto ha sido solucionado" $Cyan
Write-ColorMessage "   en los nuevos archivos db-setup-v2.js y server-auto-init-v2.js" $Cyan
Write-ColorMessage "`n📋 Para verificar que la aplicación funciona:" $Cyan
Write-ColorMessage "   railway open" $Cyan
Write-ColorMessage "`n📋 Para ver los logs continuamente:" $Cyan
Write-ColorMessage "   railway logs" $Cyan
Write-ColorMessage "==================================================" $Cyan

Write-Host "`nPresiona cualquier tecla para finalizar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
