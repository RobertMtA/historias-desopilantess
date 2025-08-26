# Script para probar y solucionar problemas de conexión a PostgreSQL en Railway
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

function Check-CommandExists {
    param (
        [string]$Command
    )
    
    $exists = Get-Command $Command -ErrorAction SilentlyContinue
    return $null -ne $exists
}

# Banner de inicio
Write-ColorMessage "`n==================================================" $Cyan
Write-ColorMessage "🔍 DIAGNÓSTICO DE POSTGRESQL EN RAILWAY" $Cyan
Write-ColorMessage "==================================================" $Cyan
Write-ColorMessage "Este script diagnostica y soluciona problemas de PostgreSQL." $Cyan
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

# Mostrar variables de entorno actuales
Write-ColorMessage "`n📋 Variables de entorno actuales:" $Yellow
railway variables

# Verificar que existan las variables necesarias
$missingVars = @()
$requiredVars = @("DATABASE_URL", "PGUSER", "PGPASSWORD", "PGHOST", "PGPORT", "PGDATABASE")

foreach ($var in $requiredVars) {
    $varValue = railway variables get $var 2>&1
    if ($LASTEXITCODE -ne 0 -or $varValue -match "Variable .* not found") {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-ColorMessage "`n⚠️ Faltan las siguientes variables de entorno:" $Yellow
    foreach ($var in $missingVars) {
        Write-ColorMessage "- $var" $Yellow
    }
    
    Write-ColorMessage "`n⚠️ ¿Deseas configurar estas variables ahora? (S/N)" $Yellow
    $configVars = Read-Host
    
    if ($configVars -eq "S" -or $configVars -eq "s") {
        # Ejecutar el script de configuración
        $configScript = "configurar-postgresql-railway.ps1"
        
        if (Test-Path $configScript) {
            Write-ColorMessage "`n🔧 Ejecutando script de configuración..." $Yellow
            & .\configurar-postgresql-railway.ps1
            
            if ($LASTEXITCODE -ne 0) {
                Write-ColorMessage "❌ Error durante la configuración." $Red
                exit 1
            }
        } else {
            Write-ColorMessage "❌ No se encontró el script de configuración: $configScript" $Red
            exit 1
        }
    } else {
        Write-ColorMessage "❌ No se puede continuar sin las variables necesarias." $Red
        exit 1
    }
}

# Ejecutar prueba de conexión
Write-ColorMessage "`n🔧 Ejecutando prueba de conexión a la base de datos..." $Yellow

# Verificar si existe el archivo test-db-connection.js
if (-not (Test-Path "test-db-connection.js")) {
    Write-ColorMessage "`n❌ No se encontró el archivo test-db-connection.js." $Red
    
    # Crear un script de prueba simple en el momento
    Write-ColorMessage "`n🔧 Creando script de prueba temporal..." $Yellow
    
    @"
const { Client } = require('pg');

// Configuraciones a probar
const configs = [
  {
    name: 'DATABASE_URL directo',
    config: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    name: 'Variables PG* estándar',
    config: {
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD,
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432'),
      database: process.env.PGDATABASE || 'railway',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }
  },
  {
    name: 'Conexión local directa',
    config: {
      user: 'postgres',
      password: process.env.POSTGRES_PASSWORD,
      host: 'localhost',
      port: 5432,
      database: 'railway',
      ssl: false
    }
  }
];

console.log('🔍 Variables de entorno disponibles:');
Object.keys(process.env).filter(key => 
  key.includes('PG') || key.includes('POSTGRES') || key.includes('DATABASE')
).forEach(key => {
  const value = key.includes('PASSWORD') || key.includes('URL') ? '********' : process.env[key];
  console.log(`- ${key}: ${value}`);
});

async function testConfig(name, config) {
  console.log(`\n🔍 Probando configuración: ${name}`);
  const client = new Client(config);
  
  try {
    console.log('Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ ¡Conexión exitosa!');
    
    const result = await client.query('SELECT version()');
    console.log(`Versión PostgreSQL: ${result.rows[0].version}`);
    
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    
    console.log(`Tablas encontradas: ${tables.rows.length}`);
    tables.rows.forEach(row => console.log(`- ${row.table_name}`));
    
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  } finally {
    await client.end().catch(() => {});
  }
}

async function run() {
  let success = false;
  
  for (const { name, config } of configs) {
    if (await testConfig(name, config)) {
      success = true;
      break;
    }
  }
  
  if (!success) {
    console.log('\n❌ Ninguna configuración funcionó. Sugerencias:');
    console.log('1. Verifica que PostgreSQL esté activo en Railway');
    console.log('2. Asegúrate de que las credenciales sean correctas');
    console.log('3. Comprueba que host sea "localhost" para conexiones dentro de Railway');
    console.log('4. Asegúrate de que PostgreSQL y tu servicio estén en el mismo proyecto');
  }
}

run().catch(console.error);
"@ | Set-Content "temp-db-test.js"
    
    Write-ColorMessage "✅ Script de prueba creado" $Green
    
    # Ejecutar el script temporal
    Write-ColorMessage "`n🔧 Ejecutando prueba de conexión..." $Yellow
    railway run node temp-db-test.js
    
    # Eliminar el script temporal
    Remove-Item "temp-db-test.js" -Force
} else {
    # Ejecutar el script existente
    railway run node test-db-connection.js
}

# Ofrecer solucionar problemas comunes
Write-ColorMessage "`n⚠️ ¿Hubo problemas de conexión? (S/N)" $Yellow
$hasIssues = Read-Host

if ($hasIssues -eq "S" -or $hasIssues -eq "s") {
    Write-ColorMessage "`n🔧 Solucionando problemas comunes..." $Yellow
    
    Write-ColorMessage "`n📋 Selecciona el problema que estás experimentando:" $Yellow
    Write-ColorMessage "1) Error: getaddrinfo ENOTFOUND postgres.railway.internal" $Yellow
    Write-ColorMessage "2) Error: connect ENETUNREACH" $Yellow
    Write-ColorMessage "3) Error: password authentication failed" $Yellow
    Write-ColorMessage "4) Error: timeout expired" $Yellow
    Write-ColorMessage "5) Otro problema" $Yellow
    $problemType = Read-Host "Selección (1-5)"
    
    switch ($problemType) {
        "1" {
            Write-ColorMessage "`n🔧 Solucionando error 'getaddrinfo ENOTFOUND'..." $Yellow
            Write-ColorMessage "Este error ocurre cuando se intenta usar una URL interna que no es accesible." $Yellow
            
            # Corregir host a localhost
            Write-ColorMessage "Configurando PGHOST a localhost..." $Yellow
            railway variables set PGHOST=localhost
            
            # Actualizar DATABASE_URL
            $pgUser = railway variables get PGUSER
            $pgPassword = railway variables get PGPASSWORD
            $pgPort = railway variables get PGPORT
            $pgDatabase = railway variables get PGDATABASE
            
            if ($pgUser -and $pgPassword -and $pgPort -and $pgDatabase) {
                $connectionString = "postgresql://$pgUser:$pgPassword@localhost:$pgPort/$pgDatabase"
                Write-ColorMessage "Actualizando DATABASE_URL..." $Yellow
                railway variables set DATABASE_URL=$connectionString
            }
            
            Write-ColorMessage "✅ Variables actualizadas" $Green
        }
        "2" {
            Write-ColorMessage "`n🔧 Solucionando error 'connect ENETUNREACH'..." $Yellow
            Write-ColorMessage "Este error indica problemas de red entre servicios." $Yellow
            
            # Sugerir verificar si PostgreSQL está en el mismo proyecto
            Write-ColorMessage "`n⚠️ Verifica que el plugin de PostgreSQL esté en el mismo proyecto de Railway." $Yellow
            Write-ColorMessage "Abriendo panel de Railway..." $Yellow
            Start-Process "https://railway.app/dashboard"
            
            # Configurar para usar localhost
            Write-ColorMessage "`n🔧 Configurando para conexión local..." $Yellow
            railway variables set PGHOST=localhost
            
            # Actualizar DATABASE_URL
            $pgUser = railway variables get PGUSER
            $pgPassword = railway variables get PGPASSWORD
            $pgPort = railway variables get PGPORT
            $pgDatabase = railway variables get PGDATABASE
            
            if ($pgUser -and $pgPassword -and $pgPort -and $pgDatabase) {
                $connectionString = "postgresql://$pgUser:$pgPassword@localhost:$pgPort/$pgDatabase"
                Write-ColorMessage "Actualizando DATABASE_URL..." $Yellow
                railway variables set DATABASE_URL=$connectionString
            }
            
            Write-ColorMessage "✅ Variables actualizadas" $Green
        }
        "3" {
            Write-ColorMessage "`n🔧 Solucionando error 'password authentication failed'..." $Yellow
            
            # Solicitar la contraseña correcta
            Write-ColorMessage "Por favor, ingresa la contraseña correcta para PostgreSQL:" $Yellow
            $pgPassword = Read-Host -AsSecureString
            $pgPasswordText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword))
            
            # Actualizar variables de contraseña
            Write-ColorMessage "Actualizando PGPASSWORD..." $Yellow
            railway variables set PGPASSWORD=$pgPasswordText
            
            Write-ColorMessage "Actualizando POSTGRES_PASSWORD..." $Yellow
            railway variables set POSTGRES_PASSWORD=$pgPasswordText
            
            # Actualizar DATABASE_URL
            $pgUser = railway variables get PGUSER
            $pgHost = railway variables get PGHOST
            $pgPort = railway variables get PGPORT
            $pgDatabase = railway variables get PGDATABASE
            
            if ($pgUser -and $pgHost -and $pgPort -and $pgDatabase) {
                $connectionString = "postgresql://$pgUser:$([Uri]::EscapeDataString($pgPasswordText))@$pgHost:$pgPort/$pgDatabase"
                Write-ColorMessage "Actualizando DATABASE_URL..." $Yellow
                railway variables set DATABASE_URL=$connectionString
            }
            
            Write-ColorMessage "✅ Contraseñas actualizadas" $Green
        }
        "4" {
            Write-ColorMessage "`n🔧 Solucionando error 'timeout expired'..." $Yellow
            Write-ColorMessage "Este error puede ocurrir cuando el servidor PostgreSQL no responde." $Yellow
            
            # Sugerir verificar el estado del plugin de PostgreSQL
            Write-ColorMessage "`n⚠️ Verifica que el plugin de PostgreSQL esté activo en Railway." $Yellow
            Write-ColorMessage "Abriendo panel de Railway..." $Yellow
            Start-Process "https://railway.app/dashboard"
            
            Write-ColorMessage "`n⚠️ ¿Deseas reiniciar el servicio PostgreSQL? (S/N)" $Yellow
            $restartPg = Read-Host
            
            if ($restartPg -eq "S" -or $restartPg -eq "s") {
                Write-ColorMessage "`n🔧 Para reiniciar PostgreSQL, sigue estos pasos en el panel de Railway:" $Yellow
                Write-ColorMessage "1. Ve a tu proyecto" $Yellow
                Write-ColorMessage "2. Selecciona el plugin de PostgreSQL" $Yellow
                Write-ColorMessage "3. Haz clic en el botón 'Restart' o 'Redeploy'" $Yellow
                
                Write-ColorMessage "`n⚠️ Presiona cualquier tecla cuando hayas completado estos pasos..." $Yellow
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
        }
        "5" {
            Write-ColorMessage "`n🔧 Para otros problemas, consulta la documentación de Railway y PostgreSQL." $Yellow
            Write-ColorMessage "Abriendo documentación de Railway..." $Yellow
            Start-Process "https://docs.railway.app/databases/postgresql"
        }
    }
    
    # Probar la conexión nuevamente
    Write-ColorMessage "`n⚠️ ¿Deseas probar la conexión nuevamente? (S/N)" $Yellow
    $testAgain = Read-Host
    
    if ($testAgain -eq "S" -or $testAgain -eq "s") {
        Write-ColorMessage "`n🔧 Probando conexión nuevamente..." $Yellow
        
        if (Test-Path "test-db-connection.js") {
            railway run node test-db-connection.js
        } else {
            Write-ColorMessage "❌ No se encontró el archivo test-db-connection.js." $Red
        }
    }
}

# Verificar si queremos redeplogar la aplicación
Write-ColorMessage "`n⚠️ ¿Deseas redeplogar la aplicación para aplicar los cambios? (S/N)" $Yellow
$redeploy = Read-Host

if ($redeploy -eq "S" -or $redeploy -eq "s") {
    Write-ColorMessage "`n🚀 Redeplogando la aplicación..." $Yellow
    railway up
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorMessage "✅ Redespliegue completado con éxito" $Green
    } else {
        Write-ColorMessage "❌ Error durante el redespliegue." $Red
    }
}

# Instrucciones finales
Write-ColorMessage "`n==================================================" $Cyan
Write-ColorMessage "✅ DIAGNÓSTICO COMPLETADO" $Green
Write-ColorMessage "==================================================" $Cyan
Write-ColorMessage "📋 Consejos adicionales:" $Cyan
Write-ColorMessage "- Verifica que PostgreSQL esté en el mismo proyecto que tu servicio" $Cyan
Write-ColorMessage "- Usa 'localhost' como host para conexiones dentro de Railway" $Cyan
Write-ColorMessage "- Si usas Docker, asegúrate de que pg esté instalado en tu Dockerfile" $Cyan
Write-ColorMessage "==================================================" $Cyan

Write-Host "`nPresiona cualquier tecla para finalizar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
