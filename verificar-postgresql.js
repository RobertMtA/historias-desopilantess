/**
 * Script para verificar que la configuración básica de PostgreSQL funciona
 * Esto ayuda a determinar si hay problemas con la instalación de PostgreSQL
 * o si el problema es específico de la conexión a Supabase
 */

const { Pool } = require('pg');

// Crear una conexión a PostgreSQL local (si está disponible)
const localPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres', // Base de datos por defecto
  user: 'postgres',
  password: 'postgres', // Contraseña por defecto, ajusta si es necesaria
  ssl: false
});

// Función para probar la conexión local
async function testLocalConnection() {
  console.log('🔍 Probando conexión a PostgreSQL local...');
  try {
    const client = await localPool.connect();
    const result = await client.query('SELECT version()');
    client.release();
    console.log('✅ Conexión a PostgreSQL local establecida correctamente');
    console.log(`📊 Versión de PostgreSQL: ${result.rows[0].version}`);
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL local:', error.message);
    console.error('   Esto es normal si no tienes PostgreSQL instalado localmente');
    return false;
  } finally {
    await localPool.end();
  }
}

// Probar módulo pg con una conexión falsa para verificar que está instalado
function checkPgModule() {
  console.log('🔍 Verificando módulo pg...');
  try {
    const { Pool } = require('pg');
    console.log('✅ Módulo pg está instalado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al cargar el módulo pg:', error.message);
    console.error('   Ejecuta: npm install pg');
    return false;
  }
}

// Mostrar información del sistema
function showSystemInfo() {
  console.log('\n📋 Información del sistema:');
  console.log(`- Node.js: ${process.version}`);
  console.log(`- Plataforma: ${process.platform}`);
  console.log(`- Arquitectura: ${process.arch}`);
  
  // Verificar variables de entorno relevantes
  console.log('\n🔐 Variables de entorno relevantes:');
  const relevantVars = ['PGHOST', 'PGUSER', 'PGPASSWORD', 'PGDATABASE', 'PGPORT', 'PATH'];
  
  relevantVars.forEach(variable => {
    const value = process.env[variable];
    if (value) {
      console.log(`- ${variable}: ${variable === 'PGPASSWORD' ? '*****' : value}`);
    } else {
      console.log(`- ${variable}: No definida`);
    }
  });
}

// Función principal
async function main() {
  console.log('======================================================');
  console.log('🧪 DIAGNÓSTICO DE CONFIGURACIÓN DE POSTGRESQL');
  console.log('======================================================');
  
  // Verificar módulo pg
  const pgModuleOk = checkPgModule();
  
  // Si el módulo está bien, probar conexión local
  if (pgModuleOk) {
    await testLocalConnection();
  }
  
  // Mostrar información del sistema
  showSystemInfo();
  
  console.log('\n📝 Conclusiones:');
  if (!pgModuleOk) {
    console.log('❌ El módulo pg no está instalado correctamente. Instálalo con: npm install pg');
  } else {
    console.log('✅ El módulo pg está correctamente instalado');
    console.log('ℹ️ Si la conexión local falló pero el módulo está bien, esto sugiere que:');
    console.log('   1. O no tienes PostgreSQL instalado localmente (normal)');
    console.log('   2. O hay un problema específico con la configuración local');
    console.log('\nℹ️ Para la conexión a Supabase:');
    console.log('   1. Verifica que las credenciales en .env.supabase son correctas');
    console.log('   2. Asegúrate de que el host supabase.co es accesible desde tu red');
    console.log('   3. Verifica que tu IP esté en la lista blanca de Supabase');
  }
  
  console.log('======================================================');
}

// Ejecutar la función principal
main().catch(error => {
  console.error('Error inesperado:', error);
});
