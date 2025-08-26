/**
 * Servidor Express con inicialización automática de la base de datos
 * Versión optimizada para Railway - V2
 */

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

// Importar script de inicialización de base de datos
const { initializeDatabase } = require('./db-setup-v2');

// Configuración del servidor
const PORT = process.env.PORT || 8080;
const app = express();

// Orígenes permitidos para CORS
const allowedOrigins = [
  'https://histostorias-desopilantes.web.app',
  'https://histostorias-desopilantes.firebaseapp.com',
  'http://localhost:5173',  // Vite dev
  'http://localhost:4173',  // Vite preview
  'http://localhost:3000'   // React dev
];

// Middleware
app.use(express.json());
app.use(cors({
  origin: function(origin, callback) {
    // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Función para configurar el cliente de PostgreSQL
function createPoolClient() {
  // Intentar usar las variables de entorno directamente
  if (process.env.PGUSER && process.env.PGPASSWORD && process.env.PGHOST) {
    console.log('🔧 Usando variables PGUSER, PGPASSWORD, etc. para la conexión');
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
    console.log('🔧 Usando DATABASE_URL para la conexión');
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      // Desactivar SSL para conexiones locales en Railway
      ssl: false
    });
  }
  
  // Si no hay DATABASE_URL, usar configuración por defecto
  console.log('⚠️ Usando configuración por defecto para la conexión');
  return new Pool({
    user: 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'railway',
    ssl: false
  });
}

// Función para obtener un cliente de base de datos
const getDbClient = () => {
  return createPoolClient();
};

// Inicializar la base de datos al arrancar
initializeDatabase()
  .then(() => {
    console.log('📊 Base de datos inicializada correctamente');
  })
  .catch(err => {
    console.error('⚠️ Error al inicializar la base de datos:', err.message);
    console.error('El servidor continuará ejecutándose, pero algunas funciones pueden no estar disponibles');
  });

// Rutas de la API
app.get('/', (req, res) => {
  res.json({
    message: 'API de Historias Desopilantes',
    status: 'online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      { path: '/health', methods: ['GET'], description: 'Verificar estado del servidor' },
      { path: '/api/test', methods: ['GET'], description: 'Endpoint de prueba' },
      { path: '/api/dashboard', methods: ['GET'], description: 'Datos del dashboard' },
      { path: '/api/stories', methods: ['GET'], description: 'Obtener todas las historias' },
      { path: '/api/stories/:id', methods: ['GET'], description: 'Obtener una historia específica' },
      { path: '/api/stories/:id/comments', methods: ['GET', 'POST'], description: 'Comentarios de una historia' },
      { path: '/api/stories/:id/likes', methods: ['GET', 'POST'], description: 'Likes de una historia' },
      { path: '/api/contact', methods: ['POST'], description: 'Formulario de contacto' }
    ]
  });
});

// Endpoint de estado de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Endpoint de prueba
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Conexión establecida correctamente',
    timestamp: new Date().toISOString()
  });
});

// Obtener datos del dashboard
app.get('/api/dashboard', async (req, res) => {
  const pool = getDbClient();
  
  try {
    await pool.connect();
    
    // Obtener estadísticas generales
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM historias) as total_stories,
        (SELECT COUNT(*) FROM comentarios) as total_comments,
        (SELECT SUM(likes) FROM story_interactions) as total_likes,
        (SELECT SUM(views) FROM story_interactions) as total_views
    `;
    
    const statsResult = await pool.query(statsQuery);
    
    // Obtener historias más populares
    const popularStoriesQuery = `
      SELECT h.id, h.titulo, h.autor, h.categoria, si.likes, si.views
      FROM historias h
      JOIN story_interactions si ON h.id = si.historia_id
      ORDER BY si.views DESC
      LIMIT 5
    `;
    
    const popularStoriesResult = await pool.query(popularStoriesQuery);
    
    res.json({
      stats: statsResult.rows[0] || { total_stories: 0, total_comments: 0, total_likes: 0, total_views: 0 },
      popular_stories: popularStoriesResult.rows || []
    });
  } catch (error) {
    console.error('Error al obtener datos del dashboard:', error);
    res.status(500).json({ error: 'Error al obtener datos del dashboard', details: error.message });
  } finally {
    await pool.end();
  }
});

// Formulario de contacto
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  
  // Aquí normalmente enviarías un email o almacenarías en la base de datos
  // Por ahora solo simularemos una respuesta exitosa
  
  console.log('Formulario de contacto recibido:', { name, email, message: message.substring(0, 20) + '...' });
  
  res.status(200).json({ 
    success: true, 
    message: 'Mensaje recibido correctamente',
    timestamp: new Date().toISOString()
  });
});

// Obtener todas las historias
app.get('/api/stories', async (req, res) => {
  const pool = getDbClient();
  
  try {
    const result = await pool.query(`
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
    await pool.end();
  }
});

// Obtener una historia específica
app.get('/api/stories/:id', async (req, res) => {
  const pool = getDbClient();
  const { id } = req.params;
  
  try {
    // Incrementar vistas
    await pool.query(`
      INSERT INTO story_interactions (historia_id, views)
      VALUES ($1, 1)
      ON CONFLICT (historia_id)
      DO UPDATE SET views = story_interactions.views + 1
    `, [id]);
    
    // Obtener historia con interacciones
    const result = await pool.query(`
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
    await pool.end();
  }
});

// Obtener comentarios de una historia
app.get('/api/stories/:id/comments', async (req, res) => {
  const pool = getDbClient();
  const { id } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT * FROM comentarios
      WHERE historia_id = $1
      ORDER BY fecha DESC
    `, [id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error(`Error al obtener comentarios para historia ${id}:`, error);
    res.status(500).json({ error: 'Error al obtener comentarios', details: error.message });
  } finally {
    await pool.end();
  }
});

// Agregar un comentario
app.post('/api/stories/:id/comments', async (req, res) => {
  const pool = getDbClient();
  const { id } = req.params;
  const { autor, contenido } = req.body;
  
  if (!autor || !contenido) {
    return res.status(400).json({ error: 'Se requieren autor y contenido' });
  }
  
  try {
    // Verificar que existe la historia
    const checkResult = await pool.query('SELECT id FROM historias WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Historia no encontrada' });
    }
    
    // Insertar comentario
    const result = await pool.query(`
      INSERT INTO comentarios (historia_id, autor, contenido)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [id, autor, contenido]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(`Error al agregar comentario para historia ${id}:`, error);
    res.status(500).json({ error: 'Error al agregar comentario', details: error.message });
  } finally {
    await pool.end();
  }
});

// Dar like a una historia
app.post('/api/stories/:id/likes', async (req, res) => {
  const pool = getDbClient();
  const { id } = req.params;
  
  try {
    // Verificar que existe la historia
    const checkResult = await pool.query('SELECT id FROM historias WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Historia no encontrada' });
    }
    
    // Incrementar likes
    const result = await pool.query(`
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
    await pool.end();
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor API iniciado en puerto ${PORT}`);
  console.log(`⏱️ ${new Date().toISOString()}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
  console.log(`🌐 CORS configurado para: ${allowedOrigins.join(', ')}`);
  console.log(`📝 Endpoints disponibles:`);
  console.log(`   GET  / (raíz)`);
  console.log(`   GET  /health`);
  console.log(`   GET  /api/test`);
  console.log(`   GET  /api/dashboard`);
  console.log(`   POST /api/contact`);
  console.log(`   GET  /api/stories/:id/likes`);
  console.log(`   POST /api/stories/:id/likes`);
  console.log(`🎉 Servidor listo para recibir peticiones!`);
});

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa no manejada:', promise, 'razón:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Excepción no capturada:', error);
});

module.exports = app;
