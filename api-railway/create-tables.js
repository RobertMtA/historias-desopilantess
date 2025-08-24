/**
 * Script para crear las tablas necesarias en la base de datos de Railway
 */
const { Pool } = require('pg');

// Configuración de conexión PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Consulta SQL para crear la tabla story_interactions
const createStoryInteractionsTable = `
CREATE TABLE IF NOT EXISTS story_interactions (
  id SERIAL PRIMARY KEY,
  historia_id INTEGER NOT NULL,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_historia_interaction UNIQUE (historia_id)
);
`;

// Función principal para crear las tablas
async function createTables() {
  const client = await pool.connect();
  
  try {
    console.log('📊 Conectando a PostgreSQL en Railway...');
    
    // Crear tabla story_interactions
    console.log('🔧 Creando tabla story_interactions...');
    await client.query(createStoryInteractionsTable);
    console.log('✅ Tabla story_interactions creada o ya existente');
    
    console.log('✅ Proceso completado con éxito');
  } catch (error) {
    console.error('❌ Error al crear las tablas:', error);
  } finally {
    client.release();
    // Cerrar la conexión al pool
    await pool.end();
  }
}

// Ejecutar la función principal
createTables().catch(err => {
  console.error('❌ Error en la ejecución principal:', err);
  process.exit(1);
});
