/**
 * Script para verificar el estado de la API en Railway
 */

const http = require('http');
const https = require('https');
const { Pool } = require('pg');

// URL de la API
const apiUrl = 'https://historias-desopilantes-production.up.railway.app';

async function checkApiStatus() {
  console.log('🔍 Verificando estado de la API en Railway...');
  console.log('================================================');
  
  // 1. Verificar que el servidor está activo
  console.log('🔄 Comprobando si el servidor está online...');
  
  try {
    const healthStatus = await makeRequest(`${apiUrl}/api/test`);
    console.log('✅ Servidor API está online!');
  } catch (error) {
    console.error('❌ No se puede conectar al servidor API:', error.message);
  }
  
  // 2. Verificar conexión a la base de datos
  console.log('\n🔄 Verificando conexión a PostgreSQL...');
  
  try {
    if (!process.env.DATABASE_URL) {
      console.log('❌ Variable DATABASE_URL no configurada');
    } else {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });
      
      const client = await pool.connect();
      console.log('✅ Conexión a PostgreSQL exitosa');
      
      // Verificar tablas
      console.log('\n🔄 Verificando tablas en la base de datos...');
      
      const tables = ['story_interactions', 'comentarios'];
      for (const table of tables) {
        const result = await client.query(`
          SELECT EXISTS (
            SELECT FROM pg_tables 
            WHERE schemaname = 'public' AND tablename = $1
          );
        `, [table]);
        
        const exists = result.rows[0].exists;
        console.log(`${exists ? '✅' : '❌'} Tabla ${table}: ${exists ? 'Existe' : 'No existe'}`);
      }
      
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error('❌ Error al verificar PostgreSQL:', error.message);
  }
  
  // 3. Mostrar rutas disponibles
  console.log('\n📋 Rutas disponibles en la API:');
  console.log('- GET /api/historias');
  console.log('- GET /api/stories');
  console.log('- GET /api/historias/:id');
  console.log('- GET /api/stories/:id');
  console.log('- GET /api/historias/:id/likes');
  console.log('- GET /api/stories/:id/likes');
  console.log('- POST /api/historias/:id/likes');
  console.log('- POST /api/stories/:id/likes');
  console.log('- POST /api/historias/:id/like');
  console.log('- POST /api/stories/:id/like');
  console.log('- GET /api/historias/:id/comentarios');
  console.log('- GET /api/stories/:id/comments');
  console.log('- POST /api/historias/:id/comentarios');
  console.log('- POST /api/stories/:id/comments');
  console.log('- POST /api/contact');
  
  console.log('\n================================================');
  console.log('🎉 Verificación de estado completada');
}

// Función para hacer solicitudes HTTP/HTTPS
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const request = client.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        return reject(new Error(`Status Code: ${response.statusCode}`));
      }
      
      const data = [];
      response.on('data', (chunk) => data.push(chunk));
      response.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(data).toString()));
        } catch (e) {
          resolve(Buffer.concat(data).toString());
        }
      });
    });
    
    request.on('error', (err) => reject(err));
    request.end();
  });
}

checkApiStatus().catch(console.error);
