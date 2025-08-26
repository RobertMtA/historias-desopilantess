/**
 * Script para inicializar tablas en Railway
 */
const { Pool } = require('pg');
require('dotenv').config();

// Configuración de conexión
const isProduction = process.env.NODE_ENV === 'production';
// Para acceso desde fuera de Railway, usamos la URL pública
const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

console.log('Iniciando script de inicialización de tablas...');
console.log('Fecha y hora:', new Date().toISOString());
console.log('Modo:', isProduction ? 'Producción' : 'Desarrollo');
console.log('URL de base de datos configurada:', connectionString ? 'Sí' : 'No');

if (!connectionString) {
  console.error('ERROR: No se encontró la variable DATABASE_URL');
  console.log('Esta variable debe ser proporcionada por Railway automáticamente.');
  process.exit(1);
}

// Configuración del pool de conexiones
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false } // Siempre usar SSL con rejectUnauthorized: false para Railway
});

// Función para crear las tablas
async function createTables() {
  console.log('Conectando a la base de datos...');
  const client = await pool.connect();
  
  try {
    console.log('Conexión establecida. Creando tablas...');
    
    // Iniciar transacción
    await client.query('BEGIN');
    
    // Crear tabla de historias
    console.log('Creando tabla historias...');
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
    console.log('✅ Tabla historias creada correctamente');
    
    // Crear tabla de comentarios
    console.log('Creando tabla comentarios...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id SERIAL PRIMARY KEY,
        historia_id INTEGER NOT NULL,
        autor VARCHAR(100) NOT NULL,
        contenido TEXT NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla comentarios creada correctamente');
    
    // Crear tabla de interacciones (likes)
    console.log('Creando tabla story_interactions...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS story_interactions (
        id SERIAL PRIMARY KEY,
        historia_id INTEGER NOT NULL UNIQUE,
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0
      )
    `);
    console.log('✅ Tabla story_interactions creada correctamente');
    
    // Verificar si hay historias
    const result = await client.query('SELECT COUNT(*) FROM historias');
    const count = parseInt(result.rows[0].count);
    console.log(`Historias existentes: ${count}`);
    
    // Si no hay historias, insertar algunas de ejemplo
    if (count === 0) {
      console.log('Insertando historias de ejemplo...');
      await client.query(`
        INSERT INTO historias (titulo, contenido, autor, categoria)
        VALUES 
        ('La Aventura Inesperada', 'Era una tarde lluviosa cuando decidí salir a caminar sin paraguas. Lo que parecía ser un error, terminó convirtiéndose en la mejor decisión de mi vida...', 'Juan Pérez', 'Comedia'),
        ('El Misterio del Bosque', 'Nadie sabía qué ocurría en aquel bosque por las noches. Los habitantes del pueblo evitaban acercarse después del atardecer, hasta que un día, decidí investigar por mi cuenta...', 'María García', 'Misterio'),
        ('Un Día Cualquiera', 'Lo que parecía un día normal se convirtió en algo extraordinario cuando al abrir la puerta de mi casa encontré un sobre amarillo con mi nombre escrito con una caligrafía perfecta...', 'Carlos Rodríguez', 'Cotidiano')
      `);
      console.log('✅ Historias de ejemplo insertadas correctamente');
    }
    
    // Confirmar transacción
    await client.query('COMMIT');
    console.log('✅ Todas las operaciones completadas correctamente');
    
  } catch (error) {
    // Revertir cambios en caso de error
    await client.query('ROLLBACK');
    console.error('❌ Error durante la creación de tablas:', error);
    throw error;
  } finally {
    // Liberar cliente
    client.release();
  }
}

// Ejecutar la función de creación de tablas
createTables()
  .then(() => {
    console.log('✅ Inicialización de tablas completada con éxito');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error general:', err);
    process.exit(1);
  });
