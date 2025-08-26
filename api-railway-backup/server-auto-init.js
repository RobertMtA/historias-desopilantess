/**
 * Servidor Express con inicialización automática de la base de datos
 * Optimizado para Railway
 */

const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

// Configuración del servidor
const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // En producción, limitar a dominios específicos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configuración de la base de datos para Railway
const getDbConfig = () => {
  // Intentar usar la URL de conexión directa si está disponible
  if (process.env.DATABASE_URL) {
    console.log('📊 Usando DATABASE_URL para la conexión');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    };
  }
  
  // De lo contrario, usar parámetros individuales
  return {
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD,
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432'),
    database: process.env.PGDATABASE || 'railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
};

// Función para inicializar la base de datos
async function initializeDatabase() {
  const client = new Client(getDbConfig());
  
  try {
    console.log('🔌 Conectando a PostgreSQL para inicializar la base de datos...');
    await client.connect();
    console.log('✅ Conexión establecida');

    // Crear tablas
    console.log('📝 Creando tablas necesarias...');
    
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
    
    // Tabla comentarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id SERIAL PRIMARY KEY,
        historia_id INTEGER NOT NULL,
        autor VARCHAR(100) NOT NULL,
        contenido TEXT NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabla story_interactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS story_interactions (
        id SERIAL PRIMARY KEY,
        historia_id INTEGER NOT NULL UNIQUE,
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0
      )
    `);
    
    // Verificar datos de ejemplo
    const result = await client.query('SELECT COUNT(*) FROM historias');
    const count = parseInt(result.rows[0].count);
    
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
    }
    
    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    // No detener el servidor por errores en la inicialización
  } finally {
    await client.end();
  }
}

// Inicializar la base de datos al arrancar
initializeDatabase().then(() => {
  console.log('📊 Base de datos lista');
}).catch(err => {
  console.error('⚠️ Advertencia en la inicialización de la base de datos:', err.message);
});

// Función para obtener una conexión a la base de datos
const getDbClient = () => {
  const client = new Client(getDbConfig());
  return client;
};

// Rutas de la API
app.get('/', (req, res) => {
  res.send({
    message: 'API de Historias Desopilantes',
    status: 'online',
    version: '1.0.0',
    endpoints: [
      { path: '/api/historias', methods: ['GET'] },
      { path: '/api/historias/:id', methods: ['GET'] },
      { path: '/api/historias/:id/comentarios', methods: ['GET', 'POST'] },
      { path: '/api/historias/:id/likes', methods: ['POST'] }
    ]
  });
});

// Obtener todas las historias
app.get('/api/historias', async (req, res) => {
  const client = getDbClient();
  try {
    await client.connect();
    const result = await client.query(`
      SELECT h.*, COALESCE(si.likes, 0) as likes, COALESCE(si.views, 0) as views
      FROM historias h
      LEFT JOIN story_interactions si ON h.id = si.historia_id
      ORDER BY h.fecha DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener historias:', error);
    res.status(500).json({ error: 'Error al obtener historias', details: error.message });
  } finally {
    await client.end();
  }
});

// Obtener una historia específica
app.get('/api/historias/:id', async (req, res) => {
  const client = getDbClient();
  const { id } = req.params;
  try {
    await client.connect();
    
    // Incrementar vistas
    await client.query(`
      INSERT INTO story_interactions (historia_id, views)
      VALUES ($1, 1)
      ON CONFLICT (historia_id)
      DO UPDATE SET views = story_interactions.views + 1
    `, [id]);
    
    // Obtener historia con interacciones
    const result = await client.query(`
      SELECT h.*, COALESCE(si.likes, 0) as likes, COALESCE(si.views, 0) as views
      FROM historias h
      LEFT JOIN story_interactions si ON h.id = si.historia_id
      WHERE h.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Historia no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error al obtener historia ${id}:`, error);
    res.status(500).json({ error: 'Error al obtener la historia', details: error.message });
  } finally {
    await client.end();
  }
});

// Obtener comentarios de una historia
app.get('/api/historias/:id/comentarios', async (req, res) => {
  const client = getDbClient();
  const { id } = req.params;
  try {
    await client.connect();
    const result = await client.query(`
      SELECT * FROM comentarios
      WHERE historia_id = $1
      ORDER BY fecha DESC
    `, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error(`Error al obtener comentarios para historia ${id}:`, error);
    res.status(500).json({ error: 'Error al obtener comentarios', details: error.message });
  } finally {
    await client.end();
  }
});

// Agregar un comentario
app.post('/api/historias/:id/comentarios', async (req, res) => {
  const client = getDbClient();
  const { id } = req.params;
  const { autor, contenido } = req.body;
  
  if (!autor || !contenido) {
    return res.status(400).json({ error: 'Se requieren autor y contenido' });
  }
  
  try {
    await client.connect();
    
    // Verificar que existe la historia
    const checkResult = await client.query('SELECT id FROM historias WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Historia no encontrada' });
    }
    
    // Insertar comentario
    const result = await client.query(`
      INSERT INTO comentarios (historia_id, autor, contenido)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [id, autor, contenido]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(`Error al agregar comentario para historia ${id}:`, error);
    res.status(500).json({ error: 'Error al agregar comentario', details: error.message });
  } finally {
    await client.end();
  }
});

// Dar like a una historia
app.post('/api/historias/:id/likes', async (req, res) => {
  const client = getDbClient();
  const { id } = req.params;
  
  try {
    await client.connect();
    
    // Verificar que existe la historia
    const checkResult = await client.query('SELECT id FROM historias WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Historia no encontrada' });
    }
    
    // Incrementar likes
    const result = await client.query(`
      INSERT INTO story_interactions (historia_id, likes)
      VALUES ($1, 1)
      ON CONFLICT (historia_id)
      DO UPDATE SET likes = story_interactions.likes + 1
      RETURNING *
    `, [id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error al dar like a historia ${id}:`, error);
    res.status(500).json({ error: 'Error al dar like', details: error.message });
  } finally {
    await client.end();
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
  console.log(`📅 Fecha y hora: ${new Date().toISOString()}`);
  console.log(`🔗 URL base: http://localhost:${PORT}`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
});

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa no manejada:', promise, 'razón:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Excepción no capturada:', error);
  // En producción, podríamos reiniciar el servidor con PM2
});

module.exports = app;
