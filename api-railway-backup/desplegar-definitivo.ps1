# Despliegue definitivo para Railway
# Autor: GitHub Copilot
# Fecha: 25 de agosto de 2025

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🚀 DESPLIEGUE DEFINITIVO A RAILWAY (SIN SSL)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Verificar que exista el archivo servidor-definitivo.js
if (-not (Test-Path "../servidor-definitivo.js")) {
    Write-Host "❌ Error: No se encuentra el archivo servidor-definitivo.js en la raíz del proyecto" -ForegroundColor Red
    exit 1
}

# Verificar conexión a Railway
Write-Host "`n🔍 Verificando conexión a Railway..." -ForegroundColor Yellow
railway whoami 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ No estás conectado a Railway. Iniciando sesión..." -ForegroundColor Yellow
    railway login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al iniciar sesión en Railway." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Conectado a Railway correctamente" -ForegroundColor Green

# Seleccionar proyecto
Write-Host "`n📋 Seleccionando proyecto en Railway..." -ForegroundColor Yellow
railway link

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al seleccionar proyecto en Railway." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Proyecto seleccionado correctamente" -ForegroundColor Green

# Configurar variables en Railway directamente desde el archivo .env
Write-Host "`n⚙️ Configurando variables en Railway..." -ForegroundColor Yellow

# Leer el archivo .env del proyecto principal
$envPath = "../.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
    
    foreach ($line in $envContent) {
        if ($line -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $Matches[1].Trim()
            $value = $Matches[2].Trim()
            
            # Solo configurar variables relacionadas con PostgreSQL
            if ($key -match '^PG' -or $key -eq 'DATABASE_URL' -or $key -eq 'POSTGRES_PASSWORD') {
                Write-Host "Configurando $key=********..." -ForegroundColor Yellow
                railway variables --set "$key=$value"
            }
        }
    }
    
    # Agregar SSL_MODE=disable explícitamente
    Write-Host "Configurando SSL_MODE=disable..." -ForegroundColor Yellow
    railway variables --set "SSL_MODE=disable"
    
    Write-Host "✅ Variables configuradas correctamente" -ForegroundColor Green
} else {
    Write-Host "⚠️ No se encontró el archivo .env en el directorio principal" -ForegroundColor Yellow
    Write-Host "⚠️ Configurando variables manualmente..." -ForegroundColor Yellow
    
    # Solicitar información
    Write-Host "`nConfigurando variables de PostgreSQL:" -ForegroundColor Yellow
    
    $pgPassword = Read-Host "Contraseña de PostgreSQL (Masajist@40)" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword)
    $passwordText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    if ([string]::IsNullOrEmpty($passwordText)) {
        $passwordText = "Masajist@40"
    }
    
    $pgDatabase = Read-Host "Nombre de base de datos (historias)"
    if ([string]::IsNullOrEmpty($pgDatabase)) {
        $pgDatabase = "historias"
    }
    
    # Configurar variables básicas
    railway variables --set "PGUSER=postgres"
    railway variables --set "PGPASSWORD=$passwordText"
    railway variables --set "PGHOST=localhost"
    railway variables --set "PGPORT=5432"
    railway variables --set "PGDATABASE=$pgDatabase"
    railway variables --set "SSL_MODE=disable"
    railway variables --set "POSTGRES_PASSWORD=$passwordText"
    
    # Configurar DATABASE_URL
    $escapedPassword = [Uri]::EscapeDataString($passwordText)
    $databaseUrl = "postgresql://postgres:$escapedPassword@localhost:5432/$pgDatabase"
    railway variables --set "DATABASE_URL=$databaseUrl"
    
    Write-Host "✅ Variables configuradas manualmente" -ForegroundColor Green
}

# Copiar el archivo servidor-definitivo.js a la carpeta actual
Write-Host "`n📄 Copiando archivo servidor-definitivo.js..." -ForegroundColor Yellow
Copy-Item "../servidor-definitivo.js" -Destination "."
Write-Host "✅ Archivo servidor-definitivo.js copiado" -ForegroundColor Green

# Actualizar package.json
Write-Host "`n📝 Actualizando package.json..." -ForegroundColor Yellow

if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    $packageJson.main = "servidor-definitivo.js"
    $packageJson.scripts.start = "node servidor-definitivo.js"
    
    # Asegurar que existen dependencias necesarias
    if (-not $packageJson.dependencies) {
        $packageJson | Add-Member -NotePropertyName "dependencies" -NotePropertyValue @{}
    }
    
    # Agregar dependencias necesarias
    $dependencies = @{
        "express" = "^4.18.2"
        "pg" = "^8.11.3"
        "dotenv" = "^16.3.1"
        "cors" = "^2.8.5"
    }
    
    foreach ($dep in $dependencies.Keys) {
        if (-not $packageJson.dependencies.$dep) {
            $packageJson.dependencies | Add-Member -NotePropertyName $dep -NotePropertyValue $dependencies[$dep]
        }
    }
    
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
    Write-Host "✅ package.json actualizado" -ForegroundColor Green
} else {
    # Crear nuevo package.json
    $packageJsonContent = @"
{
  "name": "historias-desopilantes-api",
  "version": "1.0.0",
  "description": "API para Historias Desopilantes",
  "main": "servidor-definitivo.js",
  "scripts": {
    "start": "node servidor-definitivo.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
"@
    $packageJsonContent | Out-File "package.json" -Encoding utf8 -Force
    Write-Host "✅ Nuevo package.json creado" -ForegroundColor Green
}

# Actualizar Dockerfile
Write-Host "`n📝 Actualizando Dockerfile..." -ForegroundColor Yellow

$dockerfileContent = @"
FROM node:18-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install --production

# Copiar código fuente
COPY . .

# Exponer puerto (Railway configura PORT automáticamente)
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["node", "servidor-definitivo.js"]
"@

$dockerfileContent | Out-File "Dockerfile" -Encoding utf8 -Force
Write-Host "✅ Dockerfile actualizado" -ForegroundColor Green

# Instalar dependencias necesarias
Write-Host "`n📥 Instalando dependencias..." -ForegroundColor Yellow
npm install express pg dotenv cors --no-save

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Error al instalar dependencias, pero continuaremos..." -ForegroundColor Yellow
}

# Desplegar a Railway
Write-Host "`n🚀 Desplegando a Railway..." -ForegroundColor Yellow
Write-Host "Este proceso puede tardar varios minutos..." -ForegroundColor Yellow

railway up

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al desplegar a Railway." -ForegroundColor Red
    exit 1
}

# Mostrar información del despliegue
Write-Host "`n✅ Aplicación desplegada correctamente" -ForegroundColor Green

# Instrucciones finales
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "✅ DESPLIEGUE COMPLETADO CORRECTAMENTE" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Para abrir la aplicación:" -ForegroundColor Cyan
Write-Host "  railway open" -ForegroundColor Cyan
Write-Host "`nPara verificar la conexión a PostgreSQL:" -ForegroundColor Cyan
Write-Host "  Abre [URL]/api/db-test en el navegador" -ForegroundColor Cyan
Write-Host "`nPara ver los logs en tiempo real:" -ForegroundColor Cyan
Write-Host "  railway logs" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
