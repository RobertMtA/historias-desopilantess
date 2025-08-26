/**
 * Script para crear tablas en PostgreSQL
 * Versión optimizada para Railway - Versión 2
 */
const { Pool } = require('pg');
const fs = require('fs');

// Función para configurar el cliente de PostgreSQL
function createPoolClient() {
  // Intentar usar las variables de entorno directamente
  if (process.env.PGUSER && process.env.PGPASSWORD && process.env.PGHOST) {
    console.log('🔧 Usando variables PGUSER, PGPASSWORD, etc.');
    return new Pool({
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT || '5432'),
      database: process.env.PGDATABASE || 'railway',
      // Desactivar SSL para conexiones locales en Railway
      ssl: false
    });
  }
  
  // Si no hay variables individuales, usar DATABASE_URL
  if (process.env.DATABASE_URL) {
    console.log('🔧 Usando DATABASE_URL');
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      // Desactivar SSL para conexiones locales en Railway
      ssl: false
    });
  }
  
  // Si no hay DATABASE_URL, usar configuración por defecto
  console.log('⚠️ Usando configuración por defecto');
  return new Pool({
    user: 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'railway',
    ssl: false
  });
}

async function initializeDatabase() {
  console.log('🔍 Inicializando base de datos PostgreSQL...');
  console.log('⏰ Fecha y hora:', new Date().toISOString());
  
  // Mostrar variables disponibles (sin mostrar valores sensibles)
  console.log('📊 Variables de entorno disponibles:');
  if (process.env.DATABASE_URL) console.log('- DATABASE_URL: [valor oculto]');
  if (process.env.PGUSER) console.log('- PGUSER:', process.env.PGUSER);
  if (process.env.PGHOST) console.log('- PGHOST:', process.env.PGHOST);
  if (process.env.PGPORT) console.log('- PGPORT:', process.env.PGPORT);
  if (process.env.PGDATABASE) console.log('- PGDATABASE:', process.env.PGDATABASE);
  if (process.env.PGPASSWORD) console.log('- PGPASSWORD: [valor oculto]');
  
  // Crear pool de conexión
  const pool = createPoolClient();
  
  try {
    // Verificar conexión
    console.log('🔌 Verificando conexión a PostgreSQL...');
    const client = await pool.connect();
    console.log('✅ Conexión establecida correctamente');
    
    // Crear tablas
    console.log('📊 Creando tablas si no existen...');
    
    // Tabla historias
    await client.query(`
      CREATE TABLE IF NOT EXISTS historias (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        contenido TEXT NOT NULL,
        autor VARCHAR(100),
        categoria VARCHAR(50),
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla historias creada/verificada');
    
    // Tabla comentarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id SERIAL PRIMARY KEY,
        historia_id INTEGER NOT NULL,
        autor VARCHAR(100) NOT NULL,
        contenido TEXT NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (historia_id) REFERENCES historias(id)
      )
    `);
    console.log('✅ Tabla comentarios creada/verificada');
    
    // Tabla story_interactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS story_interactions (
        id SERIAL PRIMARY KEY,
        historia_id INTEGER NOT NULL UNIQUE,
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        FOREIGN KEY (historia_id) REFERENCES historias(id)
      )
    `);
    console.log('✅ Tabla story_interactions creada/verificada');
    
    // Verificar datos de ejemplo
    const result = await client.query('SELECT COUNT(*) FROM historias');
    const count = parseInt(result.rows[0].count);
    console.log(`ℹ️ Historias existentes: ${count}`);
    
    // Si no hay datos, insertar ejemplos
    if (count === 0) {
      console.log('📝 Insertando historias de ejemplo...');
      await client.query(`
        INSERT INTO historias (titulo, contenido, autor, categoria)
        VALUES 
        ('La Aventura Inesperada', 'Era una tarde lluviosa cuando decidí salir a caminar sin paraguas...', 'Juan Pérez', 'Comedia'),
        ('El Misterio del Bosque', 'Nadie sabía qué ocurría en aquel bosque por las noches...', 'María García', 'Misterio'),
        ('Un Día Cualquiera', 'Lo que parecía un día normal se convirtió en algo extraordinario...', 'Carlos Rodríguez', 'Cotidiano')
      `);
      console.log('✅ Historias de ejemplo insertadas');
      
      // Inicializar interacciones para las historias
      console.log('📝 Inicializando interacciones para las historias...');
      await client.query(`
        INSERT INTO story_interactions (historia_id, likes, views)
        SELECT id, FLOOR(RANDOM() * 10), FLOOR(RANDOM() * 100)
        FROM historias
      `);
      console.log('✅ Interacciones inicializadas');
    }
    
    console.log('🎉 Base de datos inicializada con éxito');
    client.release();
  } catch (error) {
    console.error('❌ Error en la inicialización:', error);
    throw error;
  } finally {
    await pool.end();
    console.log('👋 Conexión de base de datos cerrada');
  }
}

// Exportar función para ser usada en otros archivos
module.exports = { initializeDatabase };

// Si se ejecuta directamente, inicializar la base de datos
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Script completado con éxito');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error durante la ejecución:', error);
      process.exit(1);
    });
}
