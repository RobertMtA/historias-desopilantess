# Script para desplegar servidor sin SSL a Railway
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
Write-ColorMessage "🚀 DESPLIEGUE DE SERVIDOR SIN SSL A RAILWAY" $Cyan
Write-ColorMessage "==================================================" $Cyan
Write-ColorMessage "Este script despliega una versión del servidor" $Cyan
Write-ColorMessage "configurada para funcionar sin SSL en Railway." $Cyan
Write-ColorMessage "==================================================" $Cyan

# Verificar archivos necesarios
$filesNeeded = @(
    "db-connect-no-ssl.js",
    "server-sin-ssl.js"
)

Write-ColorMessage "`n🔍 Verificando archivos necesarios..." $Yellow
$allFilesExist = $true

foreach ($file in $filesNeeded) {
    if (-not (Test-Path $file)) {
        Write-ColorMessage "❌ No se encontró el archivo: $file" $Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-ColorMessage "`n❌ Faltan archivos necesarios para el despliegue." $Red
    Write-ColorMessage "Por favor, ejecuta primero el script 'configurar-railway-sin-ssl.ps1'" $Red
    exit 1
}

Write-ColorMessage "✅ Todos los archivos necesarios están presentes" $Green

# Verificar si estamos conectados a Railway
Write-ColorMessage "`n🔍 Verificando conexión a Railway..." $Yellow
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

# Actualizar package.json
Write-ColorMessage "`n🔧 Actualizando package.json..." $Yellow

if (Test-Path "package.json") {
    # Leer el archivo
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    
    # Actualizar propiedades
    $packageJson.main = "server-sin-ssl.js"
    $packageJson.scripts.start = "node server-sin-ssl.js"
    
    # Asegurar que las dependencias incluyen pg y dotenv
    if (-not $packageJson.dependencies) {
        $packageJson | Add-Member -Type NoteProperty -Name "dependencies" -Value @{}
    }
    
    if (-not $packageJson.dependencies.pg) {
        $packageJson.dependencies | Add-Member -Type NoteProperty -Name "pg" -Value "^8.11.3"
    }
    
    if (-not $packageJson.dependencies.dotenv) {
        $packageJson.dependencies | Add-Member -Type NoteProperty -Name "dotenv" -Value "^16.3.1"
    }
    
    if (-not $packageJson.dependencies.express) {
        $packageJson.dependencies | Add-Member -Type NoteProperty -Name "express" -Value "^4.18.2"
    }
    
    if (-not $packageJson.dependencies.cors) {
        $packageJson.dependencies | Add-Member -Type NoteProperty -Name "cors" -Value "^2.8.5"
    }
    
    # Guardar cambios
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
    Write-ColorMessage "✅ package.json actualizado correctamente" $Green
} else {
    # Crear nuevo package.json
    Write-ColorMessage "Creando nuevo package.json..." $Yellow
    
    @"
{
  "name": "historias-desopilantes-api",
  "version": "1.0.0",
  "description": "API para Historias Desopilantes",
  "main": "server-sin-ssl.js",
  "scripts": {
    "start": "node server-sin-ssl.js",
    "dev": "nodemon server-sin-ssl.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "pg": "^8.11.3"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
"@ | Set-Content "package.json"
    
    Write-ColorMessage "✅ Nuevo package.json creado correctamente" $Green
}

# Actualizar Dockerfile
Write-ColorMessage "`n🔧 Actualizando Dockerfile..." $Yellow

@"
# Base image
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production

# Copiar archivos de package
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar código fuente
COPY . .

# Exponer puerto (Railway asigna PORT automáticamente)
EXPOSE 8080

# Comando de inicio
CMD ["node", "server-sin-ssl.js"]
"@ | Set-Content "Dockerfile"

Write-ColorMessage "✅ Dockerfile actualizado correctamente" $Green

# Verificar las variables configuradas
Write-ColorMessage "`n🔍 Verificando variables en Railway..." $Yellow
railway variables

Write-ColorMessage "`n⚠️ Asegúrate de que las variables estén configuradas correctamente." $Yellow
Write-ColorMessage "Especialmente:" $Yellow
Write-ColorMessage "- PGUSER=postgres" $Yellow
Write-ColorMessage "- PGHOST=localhost" $Yellow
Write-ColorMessage "- PGPASSWORD=[tu contraseña]" $Yellow
Write-ColorMessage "- SSL_MODE=disable" $Yellow

# Confirmar despliegue
Write-ColorMessage "`n🚀 ¿Listo para desplegar a Railway? (S/N)" $Yellow
$confirmDeploy = Read-Host

if ($confirmDeploy -ne "S" -and $confirmDeploy -ne "s") {
    Write-ColorMessage "❌ Despliegue cancelado por el usuario." $Red
    exit 0
}

# Desplegar a Railway
Write-ColorMessage "`n🚀 Desplegando a Railway..." $Yellow
Write-ColorMessage "Este proceso puede tardar varios minutos..." $Yellow

railway up

if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "`n❌ Error durante el despliegue a Railway." $Red
    exit 1
}

# Mostrar URL del despliegue
Write-ColorMessage "`n✅ ¡Despliegue completado con éxito!" $Green

# Obtener URL del servicio
Write-ColorMessage "`n🔍 Obteniendo URL del servicio..." $Yellow
railway service

# Instrucciones finales
Write-ColorMessage "`n==================================================" $Cyan
Write-ColorMessage "✅ DESPLIEGUE COMPLETADO" $Green
Write-ColorMessage "==================================================" $Cyan
Write-ColorMessage "Para abrir tu aplicación en el navegador:" $Cyan
Write-ColorMessage "  railway open" $Cyan
Write-ColorMessage "`nPara ver los logs de la aplicación:" $Cyan
Write-ColorMessage "  railway logs" $Cyan
Write-ColorMessage "`nPara probar la conexión a la base de datos:" $Cyan
Write-ColorMessage "  Abre [URL]/api/db-status en el navegador" $Cyan
Write-ColorMessage "==================================================" $Cyan

Write-Host "`nPresiona cualquier tecla para finalizar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
