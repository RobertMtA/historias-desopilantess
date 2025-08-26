/**
 * Script para crear tablas directamente en Railway
 * Ejecutar usando: railway service exec <service-id> "node create-tables-direct.js"
 */

// Configuración
const config = {
  user: 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  host: 'localhost', // Acceso local dentro de Railway
  port: 5432,
  database: 'railway'
};

console.log('🔍 Script para crear tablas en PostgreSQL');
console.log('⏱️ Fecha y hora:', new Date().toISOString());
console.log('📦 Configuración:', {
  user: config.user,
  host: config.host,
  port: config.port,
  database: config.database,
  password: '********' // No mostrar la contraseña en los logs
});

// Importar módulos
const { Client } = require('pg');

// Crear cliente de conexión
const client = new Client(config);

// Función principal
async function createTables() {
  try {
    // Conectar a la base de datos
    console.log('🔌 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conexión establecida');

    // Crear tablas
    console.log('📝 Creando tablas...');
    
    // Tabla historias
    console.log('📊 Creando tabla historias...');
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
    
    // Tabla comentarios
    console.log('📊 Creando tabla comentarios...');
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
    
    // Tabla story_interactions
    console.log('📊 Creando tabla story_interactions...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS story_interactions (
        id SERIAL PRIMARY KEY,
        historia_id INTEGER NOT NULL UNIQUE,
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0
      )
    `);
    console.log('✅ Tabla story_interactions creada');
    
    // Verificar datos de ejemplo
    console.log('🔍 Verificando si existen historias...');
    const result = await client.query('SELECT COUNT(*) FROM historias');
    const count = parseInt(result.rows[0].count);
    console.log(`ℹ️ Encontradas ${count} historias en la base de datos`);
    
    // Insertar datos de ejemplo si no hay
    if (count === 0) {
      console.log('📝 Insertando historias de ejemplo...');
      await client.query(`
        INSERT INTO historias (titulo, contenido, autor, categoria)
        VALUES 
        ('La Aventura Inesperada', 'Era una tarde lluviosa cuando decidí salir a caminar sin paraguas. Lo que parecía ser un error, terminó convirtiéndose en la mejor decisión de mi vida...', 'Juan Pérez', 'Comedia'),
        ('El Misterio del Bosque', 'Nadie sabía qué ocurría en aquel bosque por las noches. Los habitantes del pueblo evitaban acercarse después del atardecer, hasta que un día, decidí investigar por mi cuenta...', 'María García', 'Misterio'),
        ('Un Día Cualquiera', 'Lo que parecía un día normal se convirtió en algo extraordinario cuando al abrir la puerta de mi casa encontré un sobre amarillo con mi nombre escrito con una caligrafía perfecta...', 'Carlos Rodríguez', 'Cotidiano')
      `);
      console.log('✅ Historias de ejemplo insertadas');
    }
    
    console.log('🎉 Todas las tablas han sido creadas correctamente');
  } catch (error) {
    console.error('❌ Error al crear tablas:', error);
  } finally {
    // Cerrar conexión
    await client.end();
    console.log('👋 Conexión cerrada');
  }
}

// Ejecutar función
createTables()
  .then(() => {
    console.log('✅ Script completado con éxito');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error general:', error);
    process.exit(1);
  });
