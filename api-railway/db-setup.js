/**
 * Script para crear tablas en PostgreSQL
 * Este archivo se debe incluir en el contenedor y ejecutarse desde allí
 */
const { Pool } = require('pg');
const fs = require('fs');

async function initializeDatabase() {
  console.log('� Intentando conectar a PostgreSQL...');
  
  // Configuración mejorada para Railway
  const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log('🔍 Variables de entorno encontradas:');
  console.log('   DATABASE_URL:', !!process.env.DATABASE_URL);
  console.log('   PGHOST:', process.env.PGHOST);
  console.log('   PGUSER:', process.env.PGUSER);
  console.log('   PGDATABASE:', process.env.PGDATABASE);
  console.log('   RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
  
  // Crear pool de conexión con configuración mejorada
  const pool = new Pool({
    // Priorizar DATABASE_URL si existe
    ...(process.env.DATABASE_URL ? {
      connectionString: process.env.DATABASE_URL,
    } : process.env.PGHOST ? {
      // Variables individuales
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD || undefined, // Permitir contraseña vacía
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT || '5432'),
      database: process.env.PGDATABASE
    } : {
      // Fallback (no debería usarse en Railway)
      connectionString: 'postgresql://postgres:postgres@localhost:5432/historias'
    }),
    // SSL configurado para Railway
    ssl: (isProduction || isRailway) ? { rejectUnauthorized: false } : false
  });
  
  try {
    // Verificar conexión
    console.log('🔌 Verificando conexión a PostgreSQL...');
    const client = await pool.connect();
    console.log('✅ Conexión establecida correctamente');
    
    // Crear tablas
    console.log('📦 Creando tablas necesarias...');
    
    // Tabla de historias
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
    console.log('✅ Tabla historias creada');
    
    // Tabla de comentarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id SERIAL PRIMARY KEY,
        historia_id INTEGER NOT NULL,
        autor VARCHAR(100) NOT NULL,
        contenido TEXT NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla comentarios creada');
    
    // Tabla de interacciones (likes)
    await client.query(`
      CREATE TABLE IF NOT EXISTS story_interactions (
        id SERIAL PRIMARY KEY,
        historia_id INTEGER NOT NULL UNIQUE,
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0
      )
    `);
    console.log('✅ Tabla story_interactions creada');
    
    // Verificar si hay datos en la tabla historias
    const result = await client.query('SELECT COUNT(*) FROM historias');
    const count = parseInt(result.rows[0].count);
    
    // Si no hay datos, insertar algunos ejemplos
    if (count === 0) {
      console.log('📝 Insertando datos de ejemplo...');
      
      await client.query(`
        INSERT INTO historias (titulo, contenido, autor, categoria)
        VALUES 
        ('La Aventura Inesperada', 'Era una tarde lluviosa cuando decidí salir a caminar sin paraguas. Lo que parecía ser un error, terminó convirtiéndose en la mejor decisión de mi vida...', 'Juan Pérez', 'Comedia'),
        ('El Misterio del Bosque', 'Nadie sabía qué ocurría en aquel bosque por las noches. Los habitantes del pueblo evitaban acercarse después del atardecer, hasta que un día, decidí investigar por mi cuenta...', 'María García', 'Misterio'),
        ('Un Día Cualquiera', 'Lo que parecía un día normal se convirtió en algo extraordinario cuando al abrir la puerta de mi casa encontré un sobre amarillo con mi nombre escrito con una caligrafía perfecta...', 'Carlos Rodríguez', 'Cotidiano')
      `);
      
      console.log('✅ Datos de ejemplo insertados');
    } else {
      console.log(`ℹ️ Ya existen ${count} historias en la base de datos`);
    }
    
    // Crear archivo de estado para indicar que la inicialización se completó
    fs.writeFileSync('/app/db-initialized.txt', `Inicializado en: ${new Date().toISOString()}`);
    console.log('✅ Marcador de inicialización creado');
    
    client.release();
    console.log('🎉 Inicialización completada con éxito');
    
  } catch (error) {
    console.error('❌ Error en la inicialización de la base de datos:', error);
    console.error('🔍 Detalles del error:');
    console.error('   Código:', error.code);
    console.error('   Mensaje:', error.message);
    console.error('   Stack:', error.stack);
    throw error; // Re-lanzar el error para que server.js pueda manejarlo
  } finally {
    try {
      await pool.end();
    } catch (closeError) {
      console.error('⚠️ Error al cerrar el pool:', closeError.message);
    }
  }
}

// Ejecutar inicialización solo si se llama directamente
if (require.main === module) {
  initializeDatabase()
    .then(() => console.log('✅ Proceso de inicialización finalizado'))
    .catch(err => console.error('❌ Error general:', err));
} else {
  // Exportar la función para usarla en otros módulos
  module.exports = { initializeDatabase };
}
