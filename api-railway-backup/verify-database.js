/**
 * Script para verificar la configuración de PostgreSQL y tablas necesarias
 */
const { Pool } = require('pg');

async function main() {
  console.log('🔍 Verificando configuración PostgreSQL...');
  
  try {
    // Comprobar que DATABASE_URL está configurado
    if (!process.env.DATABASE_URL) {
      console.error('❌ Error: Variable de entorno DATABASE_URL no está configurada');
      console.log('📋 Siga estos pasos para solucionar el problema:');
      console.log('1. Ve a tu proyecto en Railway Dashboard');
      console.log('2. En "Variables", asegúrate que DATABASE_URL existe');
      console.log('3. Si tienes una base de datos PostgreSQL en Railway, la variable debería configurarse automáticamente');
      return;
    }
    
    console.log('✅ Variable DATABASE_URL configurada');
    
    // Configurar conexión
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    // Intentar conectar a la base de datos
    console.log('🔄 Conectando a PostgreSQL...');
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL exitosa');
    
    // Verificar existencia de tablas
    console.log('🔄 Verificando tablas necesarias...');
    
    // 1. Tabla story_interactions
    const storyInteractionsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'story_interactions'
      );
    `);
    
    const storyInteractionsExists = storyInteractionsCheck.rows[0].exists;
    console.log(`${storyInteractionsExists ? '✅' : '❌'} Tabla story_interactions ${storyInteractionsExists ? 'existe' : 'no existe'}`);
    
    // 2. Tabla comentarios
    const comentariosCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'comentarios'
      );
    `);
    
    const comentariosExists = comentariosCheck.rows[0].exists;
    console.log(`${comentariosExists ? '✅' : '❌'} Tabla comentarios ${comentariosExists ? 'existe' : 'no existe'}`);
    
    // Crear tablas si no existen
    if (!storyInteractionsExists) {
      console.log('🔄 Creando tabla story_interactions...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS story_interactions (
          id SERIAL PRIMARY KEY,
          historia_id INTEGER NOT NULL,
          likes INTEGER DEFAULT 0,
          views INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT unique_historia_interaction UNIQUE (historia_id)
        );
      `);
      console.log('✅ Tabla story_interactions creada correctamente');
    }
    
    if (!comentariosExists) {
      console.log('🔄 Creando tabla comentarios...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS comentarios (
          id SERIAL PRIMARY KEY,
          historia_id INTEGER NOT NULL,
          autor VARCHAR(100) NOT NULL,
          contenido TEXT NOT NULL,
          fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Tabla comentarios creada correctamente');
    }
    
    // Liberar cliente
    client.release();
    
    // Cerrar pool
    await pool.end();
    
    console.log('🎉 Verificación completada exitosamente');
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    console.log('📋 Pasos para solucionar problemas comunes:');
    console.log('1. Asegúrate que DATABASE_URL está correctamente configurado');
    console.log('2. Verifica que la base de datos PostgreSQL en Railway está activa');
    console.log('3. Comprueba que los permisos de la base de datos permiten crear tablas');
  }
}

main().catch(console.error);
