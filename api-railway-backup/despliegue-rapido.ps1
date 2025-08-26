# Script simplificado para desplegar a Railway
# Autor: GitHub Copilot
# Fecha: 25 de agosto de 2025

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🚂 DESPLIEGUE RÁPIDO A RAILWAY" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Conectar a Railway
Write-Host "`n🔍 Verificando conexión con Railway..." -ForegroundColor Yellow
$railwayStatus = railway whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️ No estás conectado a Railway. Iniciando sesión..." -ForegroundColor Yellow
    railway login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al iniciar sesión en Railway." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Conectado a Railway correctamente" -ForegroundColor Green

# Seleccionar proyecto
Write-Host "`n⚙️ Seleccionando proyecto..." -ForegroundColor Yellow
railway link

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al seleccionar el proyecto." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Proyecto seleccionado correctamente" -ForegroundColor Green

# Seleccionar servicio
Write-Host "`n⚙️ Seleccionando servicio..." -ForegroundColor Yellow
railway service

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al seleccionar el servicio." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Servicio seleccionado correctamente" -ForegroundColor Green

# Verificar servidor
$serverFile = "server-auto-init.js"
if (-not (Test-Path $serverFile)) {
    Write-Host "`n❌ No se encuentra el archivo $serverFile" -ForegroundColor Red
    Write-Host "Asegúrate de estar en el directorio correcto que contiene los archivos del servidor." -ForegroundColor Yellow
    exit 1
}

# Verificar package.json
$packageJsonFile = "package.json"
if (-not (Test-Path $packageJsonFile)) {
    Write-Host "`n⚠️ No se encuentra package.json. Creando archivo básico..." -ForegroundColor Yellow
    
    @"
{
  "name": "historias-desopilantes-api",
  "version": "1.0.0",
  "description": "API para Historias Desopilantes",
  "main": "server-auto-init.js",
  "scripts": {
    "start": "node server-auto-init.js"
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
"@ | Set-Content $packageJsonFile
    
    Write-Host "✅ Archivo package.json creado" -ForegroundColor Green
}

# Verificar Dockerfile
$dockerFile = "Dockerfile"
if (-not (Test-Path $dockerFile)) {
    Write-Host "`n⚠️ No se encuentra Dockerfile. Creando archivo..." -ForegroundColor Yellow
    
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

# Exponer puerto
EXPOSE 3000

# Script de inicio
CMD ["node", "server-auto-init.js"]
"@ | Set-Content $dockerFile
    
    Write-Host "✅ Archivo Dockerfile creado" -ForegroundColor Green
}

# Iniciar despliegue
Write-Host "`n🚀 Iniciando despliegue a Railway..." -ForegroundColor Yellow
Write-Host "Este proceso puede tardar varios minutos. Por favor, espera..." -ForegroundColor Yellow

railway up

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error durante el despliegue." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ ¡Despliegue completado con éxito!" -ForegroundColor Green

# Verificar si queremos inicializar la base de datos
Write-Host "`n⚠️ ¿Deseas ejecutar la inicialización de la base de datos? (S/N)" -ForegroundColor Yellow
$initDb = Read-Host

if ($initDb -eq "S" -or $initDb -eq "s") {
    Write-Host "`n📊 Ejecutando inicialización de la base de datos..." -ForegroundColor Yellow
    railway run node server-auto-init.js
    
    Write-Host "✅ Inicialización de base de datos completada" -ForegroundColor Green
}

# Abrir URL del servicio
Write-Host "`n⚠️ ¿Deseas abrir la URL del servicio? (S/N)" -ForegroundColor Yellow
$openUrl = Read-Host

if ($openUrl -eq "S" -or $openUrl -eq "s") {
    Write-Host "`n🌐 Abriendo URL del servicio..." -ForegroundColor Yellow
    railway open
}

# Instrucciones finales
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "✅ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Para ver los logs: railway logs" -ForegroundColor Cyan
Write-Host "Para abrir la URL: railway open" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`nPresiona cualquier tecla para finalizar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
