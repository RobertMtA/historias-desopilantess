# Script simplificado para configurar PostgreSQL en Railway
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
Write-ColorMessage "🔧 CONFIGURACIÓN RÁPIDA DE POSTGRESQL EN RAILWAY" $Cyan
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

# Crear archivo .env si no existe
$envPath = ".env"
Write-ColorMessage "`n🔍 Configurando archivo de variables de entorno (.env)..." $Yellow

if (-not (Test-Path $envPath)) {
    Write-ColorMessage "📝 Creando nuevo archivo .env..." $Yellow
} else {
    Write-ColorMessage "📝 Actualizando archivo .env existente..." $Yellow
    # Hacer backup del archivo existente
    Copy-Item $envPath "$envPath.bak" -Force
    Write-ColorMessage "💾 Backup creado: $envPath.bak" $Yellow
}

# Solicitar información para las variables de entorno
Write-ColorMessage "`n📋 Por favor ingresa la siguiente información:" $Yellow

# Usuario
$pgUser = Read-Host "Usuario de PostgreSQL (default: postgres)"
if ([string]::IsNullOrEmpty($pgUser)) { $pgUser = "postgres" }

# Contraseña
$securePassword = Read-Host "Contraseña de PostgreSQL" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$pgPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Host (en Railway casi siempre es localhost)
$pgHost = Read-Host "Host de PostgreSQL (default: localhost)"
if ([string]::IsNullOrEmpty($pgHost)) { $pgHost = "localhost" }

# Puerto
$pgPort = Read-Host "Puerto de PostgreSQL (default: 5432)"
if ([string]::IsNullOrEmpty($pgPort)) { $pgPort = "5432" }

# Base de datos
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
$envContent | Out-File -FilePath $envPath -Encoding utf8 -Force
Write-ColorMessage "✅ Archivo .env creado correctamente" $Green

# Crear archivo de prueba simplificado
$testFile = "test-pg-simple.js"
Write-ColorMessage "`n📝 Creando script de prueba simplificado: $testFile..." $Yellow

$testContent = @"
/**
 * Prueba simple de conexión a PostgreSQL
 */
const { Pool } = require('pg');
require('dotenv').config();

// Configuraciones de conexión a probar
const configs = [
  {
    name: 'Configuración 1: SSL con rejectUnauthorized=false',
    config: {
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT, 10),
      database: process.env.PGDATABASE,
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    name: 'Configuración 2: Sin SSL',
    config: {
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT, 10),
      database: process.env.PGDATABASE,
      ssl: false
    }
  },
  {
    name: 'Configuración 3: Solo DATABASE_URL con SSL',
    config: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  }
];

async function testConnection(config) {
  console.log(`\n\x1b[36mProbando: ${config.name}\x1b[0m`);
  console.log('-'.repeat(50));

  try {
    const pool = new Pool(config.config);
    console.log('Intentando conexión...');
    const start = Date.now();
    
    const result = await pool.query('SELECT NOW() as time');
    const duration = Date.now() - start;
    
    console.log(`\x1b[32m✓ Conexión exitosa (${duration}ms)!\x1b[0m`);
    console.log(`✓ Hora del servidor: ${result.rows[0].time}`);
    
    await pool.end();
    return true;
  } catch (error) {
    console.log(`\x1b[31m✗ Error: ${error.message}\x1b[0m`);
    
    // Más detalles sobre el error para diagnóstico
    if (error.code) {
      console.log(`Código de error: ${error.code}`);
    }
    
    return false;
  }
}

async function runTests() {
  console.log('\x1b[36m=== PRUEBA DE CONEXIÓN A POSTGRESQL ===\x1b[0m');
  console.log(`Host: ${process.env.PGHOST}`);
  console.log(`Puerto: ${process.env.PGPORT}`);
  console.log(`Base de datos: ${process.env.PGDATABASE}`);
  console.log(`Usuario: ${process.env.PGUSER}`);
  
  let successCount = 0;
  
  for (const config of configs) {
    const success = await testConnection(config);
    if (success) successCount++;
  }
  
  console.log('\n\x1b[36m=== RESUMEN ===\x1b[0m');
  if (successCount > 0) {
    console.log(`\x1b[32m${successCount} de ${configs.length} configuraciones funcionaron.\x1b[0m`);
  } else {
    console.log(`\x1b[31mNinguna configuración funcionó. Verifica tus credenciales.\x1b[0m`);
  }
}

runTests().catch(console.error);
"@

$testContent | Out-File -FilePath $testFile -Encoding utf8 -Force
Write-ColorMessage "✅ Script de prueba creado" $Green

# Instalar dependencias necesarias
Write-ColorMessage "`n📥 Instalando dependencias necesarias..." $Yellow

# Verificar si existe package.json
if (-not (Test-Path "package.json")) {
    # Crear un package.json mínimo
    @"
{
  "name": "pg-railway-test",
  "version": "1.0.0",
  "private": true,
  "dependencies": {}
}
"@ | Out-File -FilePath "package.json" -Encoding utf8 -Force
}

# Instalar dependencias pg y dotenv
npm install pg dotenv --no-save

if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "⚠️ Hubo un problema instalando dependencias, pero intentaremos continuar." $Yellow
}

# Ejecutar prueba
Write-ColorMessage "`n🚀 Ejecutando prueba de conexión..." $Yellow
node $testFile

# Instrucciones finales
Write-ColorMessage "`n==================================================" $Cyan
Write-ColorMessage "✅ CONFIGURACIÓN COMPLETADA" $Green
Write-ColorMessage "==================================================" $Cyan
Write-ColorMessage "Se ha creado:" $Cyan
Write-ColorMessage "  - Archivo .env con tus credenciales" $Cyan
Write-ColorMessage "  - Script de prueba test-pg-simple.js" $Cyan
Write-ColorMessage "`nPara usar esta configuración en tus aplicaciones:" $Cyan
Write-ColorMessage "1. Instala dotenv: npm install dotenv" $Cyan
Write-ColorMessage "2. Agrega al inicio de tu archivo:" $Cyan
Write-ColorMessage "   require('dotenv').config();" $Cyan
Write-ColorMessage "`nRecuerda no compartir el archivo .env ya que contiene" $Cyan
Write-ColorMessage "información sensible como contraseñas." $Cyan
Write-ColorMessage "==================================================" $Cyan

Write-Host "`nPresiona cualquier tecla para finalizar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
