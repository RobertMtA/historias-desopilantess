# Script super simple para configurar PostgreSQL con codificación corregida
# Autor: GitHub Copilot
# Fecha: 25 de agosto de 2025

Write-Host "==================================================`n" -ForegroundColor Cyan
Write-Host "CONFIGURADOR SIMPLE DE POSTGRESQL (CODIFICACIÓN CORREGIDA)" -ForegroundColor Cyan
Write-Host "`n==================================================" -ForegroundColor Cyan

# Solicitar la contraseña correcta
Write-Host "`nPor favor, ingresa la contraseña de PostgreSQL en Railway:" -ForegroundColor Yellow
$pgPassword = Read-Host -AsSecureString

# Convertir contraseña segura a texto
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword)
$pgPasswordText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Preguntar por el nombre de la base de datos
Write-Host "`nEl error anterior sugiere que la base de datos 'railway' podría no existir." -ForegroundColor Yellow
Write-Host "¿Cuál es el nombre correcto de la base de datos? (por defecto: postgres)" -ForegroundColor Yellow
$dbName = Read-Host
if ([string]::IsNullOrEmpty($dbName)) {
    $dbName = "postgres"
}

# Crear archivo de configuración simple con codificación UTF-8 sin BOM
$envContent = @"
# Configuración PostgreSQL para Railway
PGUSER=postgres
PGPASSWORD=$pgPasswordText
PGHOST=localhost
PGPORT=5432
PGDATABASE=$dbName
"@

# Guardar con codificación UTF-8 sin BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText((Resolve-Path ".").Path + "\.env", $envContent, $utf8NoBom)
Write-Host "`n✅ Archivo .env creado con la nueva contraseña y nombre de base de datos." -ForegroundColor Green

# Crear script de prueba simplificado
$testScript = @"
// Prueba simple sin SSL con codificación corregida
const { Client } = require('pg');
require('dotenv').config();

console.log('Configuración:');
console.log('Usuario:', process.env.PGUSER);
console.log('Contraseña:', process.env.PGPASSWORD ? '******' : 'NO CONFIGURADA');
console.log('Host:', process.env.PGHOST);
console.log('Base de datos:', process.env.PGDATABASE);

const config = {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT, 10),
  database: process.env.PGDATABASE,
  ssl: false
};

const client = new Client(config);

console.log('Conectando a PostgreSQL...');

client.connect()
  .then(() => {
    console.log('✓ Conexión exitosa!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Hora del servidor:', res.rows[0].now);
    
    // Mostrar lista de bases de datos disponibles
    return client.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
  })
  .then(res => {
    console.log('\nBases de datos disponibles:');
    res.rows.forEach(row => {
      console.log('- ' + row.datname);
    });
    return client.end();
  })
  .then(() => {
    console.log('\n✓ Conexión cerrada correctamente');
  })
  .catch(err => {
    console.error('Error:', err.message);
    
    // Sugerencias específicas según el error
    if (err.message.includes('no existe la base de datos') || err.message.includes('does not exist')) {
      console.error('\nSUGERENCIA: La base de datos especificada no existe.');
      console.error('Intenta con otra base de datos como "postgres" que suele ser la predeterminada.');
    } else if (err.message.includes('password')) {
      console.error('\nSUGERENCIA: Hay un problema con la contraseña.');
      console.error('Verifica que la contraseña sea correcta en el archivo .env');
    }
    
    process.exit(1);
  });
"@

# Guardar con codificación UTF-8 sin BOM
[System.IO.File]::WriteAllText((Resolve-Path ".").Path + "\simple-test-fixed.js", $testScript, $utf8NoBom)
Write-Host "✅ Script de prueba simple-test-fixed.js creado." -ForegroundColor Green

# Instalar dependencias si es necesario
if (-not (Test-Path "node_modules/pg") -or -not (Test-Path "node_modules/dotenv")) {
    Write-Host "`nInstalando dependencias necesarias..." -ForegroundColor Yellow
    npm install pg dotenv --no-save
}

# Ejecutar la prueba
Write-Host "`n🚀 Ejecutando prueba de conexión..." -ForegroundColor Yellow
node simple-test-fixed.js

$testExitCode = $LASTEXITCODE

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "SIGUIENTES PASOS" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

if ($testExitCode -eq 0) {
    Write-Host "✅ ¡La prueba de conexión fue exitosa!" -ForegroundColor Green
    Write-Host "`nVamos a crear un script de servidor para Railway con esta configuración." -ForegroundColor Cyan
    
    # Crear un servidor simple
    $serverContent = @"
/**
 * servidor-railway.js
 * Servidor Express simple para Railway con conexión a PostgreSQL
 */

require('dotenv').config();
const express = require('express');
const { Client } = require('pg');
const app = express();

// Puerto para Railway
const PORT = process.env.PORT || 8080;

// Configuración de PostgreSQL
const config = {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT, 10),
  database: process.env.PGDATABASE,
  ssl: false // Sin SSL
};

// Middleware para JSON
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta para probar la conexión a la BD
app.get('/api/db-test', async (req, res) => {
  const client = new Client(config);
  
  try {
    await client.connect();
    const result = await client.query('SELECT NOW() as time');
    
    res.json({
      success: true,
      message: 'Conexión a PostgreSQL exitosa',
      time: result.rows[0].time,
      config: {
        ...config,
        password: '******' // Ocultar contraseña
      }
    });
    
    await client.end();
  } catch (error) {
    console.error('Error de conexión:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al conectar con PostgreSQL',
      error: error.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(\`Servidor iniciado en puerto \${PORT}\`);
  console.log('Rutas disponibles:');
  console.log('- / : Estado del servidor');
  console.log('- /api/db-test : Prueba de conexión a PostgreSQL');
});
"@
    
    # Guardar con codificación UTF-8 sin BOM
    [System.IO.File]::WriteAllText((Resolve-Path ".").Path + "\servidor-railway.js", $serverContent, $utf8NoBom)
    Write-Host "✅ Script servidor-railway.js creado." -ForegroundColor Green
    
    # Actualizar package.json
    if (Test-Path "package.json") {
        $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
        $packageJson.main = "servidor-railway.js"
        $packageJson.scripts.start = "node servidor-railway.js"
        $packageJson | ConvertTo-Json -Depth 10 | Out-File "package.json" -Encoding utf8
    } else {
        $packageContent = @"
{
  "name": "railway-pg-app",
  "version": "1.0.0",
  "main": "servidor-railway.js",
  "scripts": {
    "start": "node servidor-railway.js"
  },
  "dependencies": {
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "pg": "^8.11.3"
  }
}
"@
        $packageContent | Out-File "package.json" -Encoding utf8
    }
    Write-Host "✅ package.json actualizado." -ForegroundColor Green
    
    # Crear Dockerfile
    $dockerContent = @"
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8080

CMD ["node", "servidor-railway.js"]
"@
    $dockerContent | Out-File "Dockerfile" -Encoding utf8
    Write-Host "✅ Dockerfile creado." -ForegroundColor Green
    
    Write-Host "`n🚀 ¿Quieres desplegar ahora a Railway? (S/N)" -ForegroundColor Yellow
    $deploy = Read-Host
    
    if ($deploy -eq "S" -or $deploy -eq "s") {
        Write-Host "`n⚙️ Configurando variables en Railway..." -ForegroundColor Yellow
        
        railway variables set PGUSER=postgres
        railway variables set PGPASSWORD="$pgPasswordText"
        railway variables set PGHOST=localhost
        railway variables set PGPORT=5432
        railway variables set PGDATABASE="$dbName"
        railway variables set SSL_MODE=disable
        
        Write-Host "`n🚀 Desplegando a Railway..." -ForegroundColor Yellow
        railway up
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Aplicación desplegada correctamente" -ForegroundColor Green
            Write-Host "`nPara abrir la aplicación:" -ForegroundColor Cyan
            Write-Host "railway open" -ForegroundColor Cyan
        } else {
            Write-Host "`n❌ Error al desplegar. Puedes intentar manualmente:" -ForegroundColor Red
            Write-Host "railway up" -ForegroundColor Cyan
        }
    } else {
        Write-Host "`nPara desplegar manualmente, usa:" -ForegroundColor Cyan
        Write-Host "railway up" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ La prueba de conexión falló. Por favor verifica:" -ForegroundColor Red
    Write-Host "1. Que la contraseña sea correcta" -ForegroundColor Cyan
    Write-Host "2. Que el nombre de la base de datos sea correcto" -ForegroundColor Cyan
    Write-Host "3. Que el servicio PostgreSQL esté activo en Railway" -ForegroundColor Cyan
    Write-Host "`nPuedes intentar nuevamente con:" -ForegroundColor Cyan
    Write-Host ".\configurar-pg-corregido.ps1" -ForegroundColor Cyan
}

Write-Host "==================================================" -ForegroundColor Cyan
