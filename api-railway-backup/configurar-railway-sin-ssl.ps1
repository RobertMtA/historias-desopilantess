# Script para configurar PostgreSQL en Railway
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
Write-ColorMessage "📋 CONFIGURACIÓN DE POSTGRESQL EN RAILWAY" $Cyan
Write-ColorMessage "==================================================" $Cyan
Write-ColorMessage "Este script configura las variables de PostgreSQL" $Cyan
Write-ColorMessage "directamente en Railway para resolver problemas de conexión." $Cyan
Write-ColorMessage "==================================================" $Cyan

# Verificar conexión a Railway
Write-ColorMessage "`n🔍 Verificando conexión a Railway..." $Yellow
$railwayStatus = railway whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "`n⚠️ No estás conectado a Railway. Iniciando sesión..." $Yellow
    railway login
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorMessage "❌ Error al iniciar sesión en Railway." $Red
        exit 1
    }
    
    # Verificar nuevamente
    $railwayStatus = railway whoami 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-ColorMessage "❌ No se pudo conectar a Railway." $Red
        exit 1
    }
}

Write-ColorMessage "✅ Conectado a Railway como: $railwayStatus" $Green

# Seleccionar proyecto
Write-ColorMessage "`n📋 Seleccionando proyecto en Railway..." $Yellow
railway link

if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "❌ Error al seleccionar proyecto en Railway." $Red
    exit 1
}

Write-ColorMessage "✅ Proyecto seleccionado correctamente" $Green

# Obtener información actual de PostgreSQL
Write-ColorMessage "`n🔍 Verificando servicio de PostgreSQL en Railway..." $Yellow
$services = railway service list 2>&1

$postgresService = $services | Select-String -Pattern "postgres"
if (-not $postgresService) {
    Write-ColorMessage "⚠️ No se encontró un servicio PostgreSQL en tu proyecto." $Yellow
    Write-ColorMessage "¿Deseas continuar de todos modos? (S/N)" $Yellow
    $continue = Read-Host
    
    if ($continue -ne "S" -and $continue -ne "s") {
        Write-ColorMessage "❌ Operación cancelada por el usuario." $Red
        exit 0
    }
}

# Solicitar información para las variables
Write-ColorMessage "`n📋 Configurando variables de PostgreSQL en Railway..." $Yellow
Write-ColorMessage "Por favor, ingresa la siguiente información:" $Yellow

# Contraseña
Write-ColorMessage "`nContraseña de PostgreSQL:" $Yellow
$securePassword = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$pgPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Confirmar información
Write-ColorMessage "`n📋 Resumen de la configuración:" $Yellow
Write-ColorMessage "- PGUSER: postgres" $Yellow
Write-ColorMessage "- PGHOST: localhost" $Yellow
Write-ColorMessage "- PGPORT: 5432" $Yellow
Write-ColorMessage "- PGDATABASE: railway" $Yellow
Write-ColorMessage "- PGPASSWORD: ********" $Yellow

Write-ColorMessage "`n¿Confirmas esta configuración? (S/N)" $Yellow
$confirm = Read-Host

if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-ColorMessage "❌ Operación cancelada por el usuario." $Red
    exit 0
}

# Configurar variables en Railway
Write-ColorMessage "`n📝 Configurando variables en Railway..." $Yellow

# Establecer variables básicas
Write-ColorMessage "Configurando PGUSER=postgres..." $Yellow
railway variables set PGUSER=postgres
if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "⚠️ No se pudo establecer PGUSER" $Yellow
}

Write-ColorMessage "Configurando PGHOST=localhost..." $Yellow
railway variables set PGHOST=localhost
if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "⚠️ No se pudo establecer PGHOST" $Yellow
}

Write-ColorMessage "Configurando PGPORT=5432..." $Yellow
railway variables set PGPORT=5432
if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "⚠️ No se pudo establecer PGPORT" $Yellow
}

Write-ColorMessage "Configurando PGDATABASE=railway..." $Yellow
railway variables set PGDATABASE=railway
if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "⚠️ No se pudo establecer PGDATABASE" $Yellow
}

# Establecer contraseña (evitando caracteres especiales en la línea de comandos)
Write-ColorMessage "Configurando PGPASSWORD=********..." $Yellow
railway variables set PGPASSWORD="$pgPassword"
if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "⚠️ No se pudo establecer PGPASSWORD" $Yellow
}

# Configurar DATABASE_URL
Write-ColorMessage "Configurando DATABASE_URL..." $Yellow
$databaseUrl = "postgresql://postgres:$pgPassword@localhost:5432/railway"
railway variables set DATABASE_URL="$databaseUrl"
if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "⚠️ No se pudo establecer DATABASE_URL" $Yellow
}

# Configurar SSL_MODE para deshabilitar SSL
Write-ColorMessage "Configurando SSL_MODE=disable..." $Yellow
railway variables set SSL_MODE=disable
if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "⚠️ No se pudo establecer SSL_MODE" $Yellow
}

# Mostrar variables configuradas
Write-ColorMessage "`n📋 Variables configuradas en Railway:" $Green
railway variables

# Configurar el mismo archivo .env localmente
Write-ColorMessage "`n📝 Creando archivo .env local..." $Yellow

$envContent = @"
# Configuración de PostgreSQL para Railway
# Generado automáticamente: $(Get-Date -Format "dd-MM-yyyy HH:mm:ss")

# Variables estándar de PostgreSQL
PGUSER=postgres
PGPASSWORD=$pgPassword
PGHOST=localhost
PGPORT=5432
PGDATABASE=railway

# URL de conexión completa
DATABASE_URL=postgresql://postgres:$pgPassword@localhost:5432/railway

# Configuración adicional
NODE_ENV=production
PORT=8080
SSL_MODE=disable
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8 -Force
Write-ColorMessage "✅ Archivo .env creado correctamente" $Green

# Crear archivo de prueba simple
Write-ColorMessage "`n📝 Creando script de prueba simple..." $Yellow

$testContent = @"
/**
 * test-railway-connection.js
 * 
 * Script para probar la conexión a PostgreSQL en Railway
 * con la nueva configuración sin SSL
 */

// Cargar variables de entorno
require('dotenv').config();

const { Client } = require('pg');

// Configuración desde variables de entorno
const config = {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT, 10),
  database: process.env.PGDATABASE,
  // Explícitamente sin SSL
  ssl: false
};

console.log('=== PRUEBA DE CONEXIÓN A POSTGRESQL EN RAILWAY ===');
console.log('Configuración:');
console.log(\`- Host: \${config.host}\`);
console.log(\`- Puerto: \${config.port}\`);
console.log(\`- Base de datos: \${config.database}\`);
console.log(\`- Usuario: \${config.user}\`);
console.log(\`- SSL: desactivado\`);
console.log('\\nIniciando conexión...');

// Conectar y probar
const client = new Client(config);

client.connect()
  .then(() => {
    console.log('✓ ¡Conexión exitosa!');
    return client.query('SELECT NOW() as time');
  })
  .then(result => {
    console.log(\`✓ Hora del servidor: \${result.rows[0].time}\`);
    
    // Verificar tablas
    return client.query(\`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    \`);
  })
  .then(result => {
    if (result.rows.length > 0) {
      console.log(\`✓ Tablas encontradas: \${result.rows.length}\`);
      result.rows.forEach((row, i) => {
        console.log(\`  \${i+1}. \${row.table_name}\`);
      });
    } else {
      console.log('⚠ No se encontraron tablas en la base de datos');
    }
    
    return client.end();
  })
  .then(() => {
    console.log('✓ Prueba completada correctamente');
  })
  .catch(err => {
    console.error('✗ Error de conexión:', err.message);
  });
"@

$testContent | Out-File -FilePath "test-railway-connection.js" -Encoding utf8 -Force
Write-ColorMessage "✅ Script de prueba creado correctamente" $Green

# Instalar dependencias necesarias
Write-ColorMessage "`n📥 Instalando dependencias necesarias..." $Yellow
npm install pg dotenv --no-save

if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "⚠️ Hubo un problema al instalar las dependencias" $Yellow
} else {
    Write-ColorMessage "✅ Dependencias instaladas correctamente" $Green
}

# Ejecutar prueba
Write-ColorMessage "`n🚀 Probando conexión a PostgreSQL..." $Yellow
node test-railway-connection.js

# Instrucciones finales
Write-ColorMessage "`n==================================================" $Cyan
Write-ColorMessage "✅ CONFIGURACIÓN COMPLETADA" $Green
Write-ColorMessage "==================================================" $Cyan
Write-ColorMessage "Se ha configurado PostgreSQL sin SSL en Railway." $Cyan
Write-ColorMessage "Ahora deberías poder conectarte sin problemas de SSL." $Cyan
Write-ColorMessage "`nPara usar esta configuración en tu aplicación:" $Cyan
Write-ColorMessage "1. Usa el archivo .env generado" $Cyan
Write-ColorMessage "2. Configura tu conexión sin SSL:" $Cyan
Write-ColorMessage "   const pool = new Pool({" $Cyan
Write-ColorMessage "     ssl: false" $Cyan
Write-ColorMessage "   });" $Cyan
Write-ColorMessage "`nPara realizar un nuevo despliegue:" $Cyan
Write-ColorMessage "   railway up" $Cyan
Write-ColorMessage "==================================================" $Cyan

Write-Host "`nPresiona cualquier tecla para finalizar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
