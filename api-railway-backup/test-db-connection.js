/**
 * Script para verificar la conexión a PostgreSQL en Railway
 * Ejecutar con: railway run node test-db-connection.js
 */

const { Client } = require('pg');

// Configuración múltiple para probar diferentes enfoques
function getConfigurations() {
  const configs = [];
  
  // Configuración 1: URL de conexión directa
  if (process.env.DATABASE_URL) {
    configs.push({
      name: 'DATABASE_URL directo',
      config: {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      }
    });
  }
  
  // Configuración 2: Parámetros PG* individuales
  configs.push({
    name: 'Variables PG* estándar',
    config: {
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD,
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432'),
      database: process.env.PGDATABASE || 'railway',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }
  });
  
  // Configuración 3: Variables POSTGRES_* alternativas
  configs.push({
    name: 'Variables POSTGRES_* alternativas',
    config: {
      user: 'postgres',
      password: process.env.POSTGRES_PASSWORD,
      host: 'localhost',
      port: 5432,
      database: 'railway',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }
  });
  
  return configs;
}

// Mostrar variables de entorno disponibles (sin mostrar valores sensibles)
console.log('📊 Variables de entorno disponibles:');
const envVars = Object.keys(process.env).filter(key => 
  key.includes('PG') || 
  key.includes('POSTGRES') || 
  key.includes('DATABASE')
);

envVars.forEach(key => {
  if (key.includes('PASSWORD') || key.includes('URL')) {
    console.log(`- ${key}: ******** (valor oculto)`);
  } else {
    console.log(`- ${key}: ${process.env[key]}`);
  }
});

// Función para probar una configuración
async function testConfiguration(name, config) {
  console.log(`\n🔍 Probando configuración: ${name}`);
  console.log('Configuración:', {
    ...config,
    password: '********' // Ocultar contraseña en los logs
  });
  
  const client = new Client(config);
  
  try {
    console.log('⏳ Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ ¡Conexión exitosa!');
    
    // Verificar versión de PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('📌 Versión de PostgreSQL:', versionResult.rows[0].version);
    
    // Listar tablas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`📋 Tablas encontradas: ${tablesResult.rows.length}`);
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Si no hay tablas, mostrar mensaje informativo
    if (tablesResult.rows.length === 0) {
      console.log('⚠️ No se encontraron tablas. Puede ser necesario inicializar la base de datos.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('Detalles:', error);
    return false;
  } finally {
    try {
      await client.end();
      console.log('👋 Conexión cerrada');
    } catch (e) {
      // Ignorar errores al cerrar una conexión que nunca se abrió
    }
  }
}

// Función principal para probar todas las configuraciones
async function testAllConfigurations() {
  const configs = getConfigurations();
  let successCount = 0;
  
  console.log(`\n🚀 Probando ${configs.length} configuraciones diferentes...`);
  
  for (const { name, config } of configs) {
    const success = await testConfiguration(name, config);
    if (success) successCount++;
  }
  
  console.log(`\n📊 Resumen: ${successCount} de ${configs.length} configuraciones funcionaron correctamente.`);
  
  if (successCount === 0) {
    console.log('\n⚠️ SOLUCIONES SUGERIDAS:');
    console.log('1. Verifica que PostgreSQL esté activo en Railway');
    console.log('2. Asegúrate de que las variables de entorno estén configuradas correctamente');
    console.log('3. Verifica que el servicio tenga acceso a PostgreSQL');
    console.log('4. Revisa si hay restricciones de red en Railway');
    console.log('\nPara más información, consulta el archivo POSTGRESQL-RAILWAY-GUIDE.md');
  }
}

// Ejecutar pruebas
console.log('🔍 Iniciando verificación de conexión a PostgreSQL...');
console.log('📅 Fecha y hora:', new Date().toISOString());
console.log('🔧 Entorno:', process.env.NODE_ENV || 'desarrollo');

testAllConfigurations()
  .then(() => {
    console.log('\n✅ Pruebas completadas');
  })
  .catch(error => {
    console.error('\n❌ Error general:', error);
  });
