/**
 * Script para verificar la conexión a la base de datos PostgreSQL en Railway
 */

const { Pool } = require('pg');
require('dotenv').config();

// Función para verificar la conexión
async function verificarConexion() {
  console.log('Iniciando verificación de conexión a PostgreSQL...');
  console.log('Fecha y hora:', new Date().toISOString());
  
  // Mostrar información de conexión (sin credenciales)
  const dbUrl = process.env.DATABASE_URL;
  console.log('URL de base de datos configurada:', dbUrl ? 'Sí (definida en DATABASE_URL)' : 'No');
  
  // Si no hay DATABASE_URL, mostrar mensaje de error
  if (!dbUrl) {
    console.error('ERROR: No se encontró la variable de entorno DATABASE_URL');
    console.log('Esta variable debe ser proporcionada por Railway automáticamente.');
    console.log('Asegúrate de:');
    console.log('1. Haber añadido un servicio PostgreSQL en Railway');
    console.log('2. Haber conectado correctamente el servicio PostgreSQL a tu aplicación');
    console.log('3. Revisar las variables de entorno en Railway');
    process.exit(1);
  }
  
  // Intentar crear una conexión sin exponer credenciales
  console.log('Intentando conectar a la base de datos...');
  
  const isProduction = process.env.NODE_ENV === 'production';
  console.log('Modo:', isProduction ? 'Producción' : 'Desarrollo');
  
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: isProduction ? { rejectUnauthorized: false } : false
  });
  
  try {
    // Verificar conexión
    console.log('Estableciendo conexión...');
    const client = await pool.connect();
    console.log('✅ Conexión establecida correctamente');
    
    // Verificar versión PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('Versión de PostgreSQL:', versionResult.rows[0].version);
    
    // Verificar tablas existentes
    console.log('Consultando tablas existentes...');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    
    console.log('Tablas encontradas:', tablesResult.rowCount);
    if (tablesResult.rowCount > 0) {
      console.log('Lista de tablas:');
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    } else {
      console.log('⚠️ No se encontraron tablas. Puede que necesites inicializar la base de datos.');
      console.log('Ejecuta "node create-tables.js" para crear las tablas necesarias.');
    }
    
    // Liberar cliente
    client.release();
    console.log('✅ Verificación completada con éxito');
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR al conectar a la base de datos:', error.message);
    console.log('\nPosibles causas y soluciones:');
    console.log('1. Credenciales incorrectas: Verifica las credenciales en Railway');
    console.log('2. Base de datos no disponible: Verifica que el servicio PostgreSQL está activo');
    console.log('3. Problemas de red: Verifica la conectividad entre tu aplicación y Railway');
    console.log('4. SSL requerido: Railway requiere SSL para conexiones en producción');
    
    // Errores comunes y soluciones
    if (error.message.includes('password authentication')) {
      console.log('\n⚠️ Error de autenticación: Las credenciales parecen ser incorrectas.');
      console.log('Solución: Verifica las variables de entorno en Railway, especialmente DATABASE_URL.');
    }
    
    if (error.message.includes('connect ETIMEDOUT')) {
      console.log('\n⚠️ Error de tiempo de espera: No se pudo conectar a la base de datos.');
      console.log('Solución: Verifica que la dirección IP no esté bloqueada y que el puerto esté abierto.');
    }
    
    if (error.message.includes('ssl')) {
      console.log('\n⚠️ Error de SSL: Problemas con la configuración SSL.');
      console.log('Solución: Asegúrate de configurar correctamente SSL para producción:');
      console.log('pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });');
    }
    
    process.exit(1);
  }
}

// Ejecutar la verificación
verificarConexion().catch(err => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
