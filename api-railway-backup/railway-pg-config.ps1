# Railway PostgreSQL con Railway CLI
# Autor: GitHub Copilot
# Fecha: 25 de agosto de 2025

Write-Host "==================================================`n" -ForegroundColor Cyan
Write-Host "CONFIGURACIÓN DE POSTGRESQL EN RAILWAY" -ForegroundColor Cyan
Write-Host "`n==================================================" -ForegroundColor Cyan

# Verificar si estamos conectados a Railway
Write-Host "`n🔍 Verificando conexión con Railway..." -ForegroundColor Yellow
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

# Seleccionar proyecto y servicio
Write-Host "`n⚙️ Seleccionando proyecto..." -ForegroundColor Yellow
railway link

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al seleccionar el proyecto." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Proyecto seleccionado correctamente" -ForegroundColor Green

# Solicitar información
Write-Host "`nIntroduce la contraseña de PostgreSQL para Railway:" -ForegroundColor Yellow
$pgPassword = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword)
$pgPasswordText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Configurar variables
Write-Host "`n⚙️ Configurando variables en Railway..." -ForegroundColor Yellow

Write-Host "Configurando PGUSER=postgres..." -ForegroundColor Yellow
railway variables set PGUSER=postgres

Write-Host "Configurando PGPASSWORD=********..." -ForegroundColor Yellow
railway variables set PGPASSWORD="$pgPasswordText"

Write-Host "Configurando PGHOST=localhost..." -ForegroundColor Yellow
railway variables set PGHOST=localhost

Write-Host "Configurando PGPORT=5432..." -ForegroundColor Yellow
railway variables set PGPORT=5432

Write-Host "Configurando PGDATABASE=railway..." -ForegroundColor Yellow
railway variables set PGDATABASE=railway

Write-Host "Configurando SSL_MODE=disable..." -ForegroundColor Yellow
railway variables set SSL_MODE=disable

# Configurar DATABASE_URL
Write-Host "Configurando DATABASE_URL..." -ForegroundColor Yellow
$escapedPassword = [Uri]::EscapeDataString($pgPasswordText)
$databaseUrl = "postgresql://postgres:$escapedPassword@localhost:5432/railway"
railway variables set DATABASE_URL="$databaseUrl"

Write-Host "`n✅ Variables configuradas correctamente en Railway" -ForegroundColor Green

# Crear archivo .env local
Write-Host "`n📝 Creando archivo .env local..." -ForegroundColor Yellow
$envContent = @"
# Configuración de PostgreSQL para Railway
# Generado: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

PGUSER=postgres
PGPASSWORD=$pgPasswordText
PGHOST=localhost
PGPORT=5432
PGDATABASE=railway
DATABASE_URL=postgresql://postgres:$escapedPassword@localhost:5432/railway
SSL_MODE=disable
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8 -Force
Write-Host "✅ Archivo .env creado correctamente" -ForegroundColor Green

# Crear un archivo de servidor super simple
Write-Host "`n📝 Creando servidor super simple..." -ForegroundColor Yellow

$serverContent = @"
/**
 * server-simple.js
 * Servidor Express para Railway super simple
 */

require('dotenv').config();
const express = require('express');
const { Client } = require('pg');
const app = express();

// Puerto configurado por Railway
const PORT = process.env.PORT || 8080;

// Ruta principal - Estado del servidor
app.get('/', async (req, res) => {
  res.json({
    status: 'online',
    message: 'Servidor funcionando correctamente',
    time: new Date().toISOString()
  });
});

// Ruta para verificar PostgreSQL
app.get('/db-test', async (req, res) => {
  const config = {
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT, 10),
    database: process.env.PGDATABASE,
    ssl: false // Sin SSL
  };
  
  console.log('Configuración PostgreSQL:', {
    ...config,
    password: '********'
  });
  
  const client = new Client(config);
  
  try {
    await client.connect();
    const result = await client.query('SELECT NOW() as time');
    await client.end();
    
    res.json({
      success: true,
      message: 'Conexión PostgreSQL exitosa',
      time: result.rows[0].time,
      config: {
        ...config,
        password: '********'
      }
    });
  } catch (error) {
    console.error('Error PostgreSQL:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al conectar con PostgreSQL',
      error: error.message,
      config: {
        ...config,
        password: '********'
      }
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(\`Servidor iniciado en puerto \${PORT}\`);
});
"@

$serverContent | Out-File -FilePath "server-simple.js" -Encoding utf8 -Force
Write-Host "✅ Servidor simple creado correctamente" -ForegroundColor Green

# Actualizar package.json
Write-Host "`n📝 Actualizando package.json..." -ForegroundColor Yellow

if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    $packageJson.main = "server-simple.js"
    $packageJson.scripts.start = "node server-simple.js"
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
} else {
    @"
{
  "name": "railway-pg-test",
  "version": "1.0.0",
  "main": "server-simple.js",
  "scripts": {
    "start": "node server-simple.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1"
  }
}
"@ | Set-Content "package.json"
}

Write-Host "✅ package.json actualizado" -ForegroundColor Green

# Actualizar Dockerfile
Write-Host "`n📝 Actualizando Dockerfile..." -ForegroundColor Yellow

@"
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8080

CMD ["node", "server-simple.js"]
"@ | Set-Content "Dockerfile"

Write-Host "✅ Dockerfile actualizado" -ForegroundColor Green

# Instalar dependencias localmente
Write-Host "`n📥 Instalando dependencias..." -ForegroundColor Yellow
npm install express pg dotenv --no-save

Write-Host "`n🚀 ¿Deseas desplegar ahora a Railway? (S/N)" -ForegroundColor Yellow
$deploy = Read-Host

if ($deploy -eq "S" -or $deploy -eq "s") {
    Write-Host "`n🚀 Desplegando a Railway..." -ForegroundColor Yellow
    railway up
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Aplicación desplegada correctamente" -ForegroundColor Green
        Write-Host "`nPara abrir la aplicación:" -ForegroundColor Cyan
        Write-Host "railway open" -ForegroundColor Cyan
        
        Write-Host "`nPara verificar la conexión a la base de datos:" -ForegroundColor Cyan
        Write-Host "Abre [TU-URL]/db-test en el navegador" -ForegroundColor Cyan
    } else {
        Write-Host "`n❌ Error al desplegar la aplicación" -ForegroundColor Red
    }
} else {
    Write-Host "`nPuedes desplegar más tarde con:" -ForegroundColor Cyan
    Write-Host "railway up" -ForegroundColor Cyan
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
