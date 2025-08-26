/**
 * db-connect-no-ssl.js
 * 
 * Configuración PostgreSQL sin SSL para Railway
 * Esta solución desactiva SSL para evitar problemas de conexión
 */

// Cargar variables de entorno
require('dotenv').config();

const { Pool } = require('pg');

// Configuración básica sin SSL
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE || 'railway',
  // Desactivar SSL explícitamente
  ssl: false
});

// Función para probar la conexión
async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW() as time');
    return {
      success: true,
      time: result.rows[0].time,
      message: 'Conexión exitosa'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Error de conexión'
    };
  } finally {
    if (client) client.release();
  }
}

// Exportar pool y funciones útiles
module.exports = {
  pool,
  testConnection,
  
  // Función para cerrar conexiones
  async closePool() {
    try {
      await pool.end();
      return { success: true, message: 'Pool cerrado correctamente' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Si se ejecuta directamente, probar la conexión
if (require.main === module) {
  (async () => {
    console.log('=== PRUEBA DE CONEXIÓN POSTGRESQL (SIN SSL) ===');
    
    const result = await testConnection();
    
    if (result.success) {
      console.log(`✓ ${result.message}`);
      console.log(`✓ Hora del servidor: ${result.time}`);
      
      // Listar tablas
      try {
        const tablesResult = await pool.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `);
        
        if (tablesResult.rows.length > 0) {
          console.log(`✓ Tablas encontradas: ${tablesResult.rows.length}`);
          tablesResult.rows.forEach((row, i) => {
            console.log(`  ${i+1}. ${row.table_name}`);
          });
        } else {
          console.log('⚠ No se encontraron tablas en la base de datos');
        }
      } catch (error) {
        console.error('✗ Error al listar tablas:', error.message);
      }
    } else {
      console.error(`✗ ${result.message}: ${result.error}`);
    }
    
    await module.exports.closePool();
  })().catch(console.error);
}
