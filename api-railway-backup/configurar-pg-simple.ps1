# Script super simple para configurar PostgreSQL
# Autor: GitHub Copilot
# Fecha: 25 de agosto de 2025

Write-Host "==================================================`n" -ForegroundColor Cyan
Write-Host "CONFIGURADOR SIMPLE DE POSTGRESQL" -ForegroundColor Cyan
Write-Host "`n==================================================" -ForegroundColor Cyan

# Solicitar la contraseña correcta
Write-Host "`nPor favor, ingresa la contraseña de PostgreSQL en Railway:" -ForegroundColor Yellow
$pgPassword = Read-Host -AsSecureString

# Convertir contraseña segura a texto
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword)
$pgPasswordText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Crear archivo de configuración simple
$envContent = @"
# Configuración PostgreSQL para Railway
PGUSER=postgres
PGPASSWORD=$pgPasswordText
PGHOST=localhost
PGPORT=5432
PGDATABASE=railway
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8 -Force
Write-Host "`n✅ Archivo .env creado con la nueva contraseña." -ForegroundColor Green

# Crear script de prueba simplificado
$testScript = @"
// Prueba simple sin SSL
const { Client } = require('pg');
require('dotenv').config();

console.log('Configuración:');
console.log('Usuario:', process.env.PGUSER);
console.log('Contraseña:', process.env.PGPASSWORD ? '******' : 'NO CONFIGURADA');
console.log('Host:', process.env.PGHOST);
console.log('Base de datos:', process.env.PGDATABASE);

const config = {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD, // <-- Asegúrate de que esté correctamente configurada
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
    return client.end();
  })
  .then(() => {
    console.log('✓ Conexión cerrada correctamente');
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
"@

$testScript | Out-File -FilePath "simple-test.js" -Encoding utf8 -Force
Write-Host "✅ Script de prueba simple-test.js creado." -ForegroundColor Green

# Instalar dependencias si es necesario
if (-not (Test-Path "node_modules/pg") -or -not (Test-Path "node_modules/dotenv")) {
    Write-Host "`nInstalando dependencias necesarias..." -ForegroundColor Yellow
    npm install pg dotenv --no-save
}

# Ejecutar la prueba
Write-Host "`n🚀 Ejecutando prueba de conexión..." -ForegroundColor Yellow
node simple-test.js

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "SIGUIENTES PASOS" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "1. Si la prueba funcionó, ejecuta el script:" -ForegroundColor Cyan
Write-Host "   .\desplegar-servidor-sin-ssl.ps1" -ForegroundColor Cyan
Write-Host "`n2. Si la prueba falló, verifica:" -ForegroundColor Cyan
Write-Host "   - Que la contraseña sea correcta" -ForegroundColor Cyan
Write-Host "   - Que el servicio PostgreSQL esté activo en Railway" -ForegroundColor Cyan
Write-Host "   - Que las variables de entorno estén correctas en Railway" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
