const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = 4000;

// Configurar CORS para permitir cualquier origen
app.use(cors({
  origin: '*', // Esto permite solicitudes desde cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware adicional para debugging de CORS
app.use((req, res, next) => {
  console.log(`📝 Petición recibida: ${req.method} ${req.url} desde ${req.headers.origin || 'origen desconocido'}`);
  
  // Headers explícitos de CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔍 Preflight request recibido');
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

// Pool de PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'historias_desopilantes',
  password: process.env.DB_PASSWORD || 'Masajist@40',
  port: process.env.DB_PORT || 5432,
});

// Verificar la conexión a la base de datos
pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL correctamente'))
  .catch(err => {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
    console.error('Continuando de todos modos para poder manejar requests...');
  });

// Ruta de prueba básica
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente', timestamp: new Date() });
});

// Ruta de prueba de base de datos
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as total FROM stories');
    res.json({ 
      message: 'Base de datos conectada correctamente',
      totalStories: result.rows[0].total,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error en test-db:', error);
    res.status(500).json({ error: 'Error de base de datos', details: error.message });
  }
});

// Ruta mejorada para obtener likes (sin devolver 404)
app.get('/api/stories/:id/likes', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Obteniendo likes para historia ID: ${id}`);
    
    let result;
    try {
      result = await pool.query('SELECT likes FROM stories WHERE id = $1', [id]);
    } catch (dbError) {
      console.error(`❌ Error de base de datos al buscar historia ${id}:`, dbError.message);
      // Aunque falle la BD, respondemos con likes=0
      return res.json({
        storyId: parseInt(id),
        likes: 0,
        hasLiked: false,
        exists: false,
        error: 'DB_ERROR'
      });
    }
    
    // En lugar de retornar 404, devolvemos un objeto con likes=0
    if (!result || result.rows.length === 0) {
      console.log(`⚠️ Historia ID: ${id} no encontrada, devolviendo likes=0`);
      return res.json({
        storyId: parseInt(id),
        likes: 0,
        hasLiked: false,
        exists: false
      });
    }
    
    const response = {
      storyId: parseInt(id),
      likes: result.rows[0].likes || 0,
      hasLiked: false,
      exists: true
    };
    
    console.log(`✅ Likes obtenidos:`, response);
    res.json(response);
  } catch (error) {
    console.error('❌ Error general getting story likes:', error);
    // Fallback response para evitar 500 
    res.json({
      storyId: parseInt(req.params.id),
      likes: 0,
      hasLiked: false,
      exists: false,
      error: 'GENERAL_ERROR'
    });
  }
});

// Ruta mejorada para obtener comentarios (sin devolver 404)
app.get('/api/stories/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Obteniendo comentarios para historia ID: ${id}`);
    
    // Siempre devolver una respuesta válida, incluso si hay errores
    try {
      // Verificar si la historia existe antes de devolver comentarios
      const storyExists = await pool.query('SELECT id FROM stories WHERE id = $1', [id]);
      
      // Si la historia no existe, devolver array vacío de comentarios en lugar de 404
      if (storyExists.rows.length === 0) {
        console.log(`⚠️ Historia ID: ${id} no encontrada, devolviendo array vacío de comentarios`);
        return res.json({
          storyId: parseInt(id),
          comments: [],
          total: 0,
          exists: false
        });
      }
      
      const result = await pool.query(
        'SELECT id, user_name, comment, created_at FROM comments WHERE story_id = $1 ORDER BY created_at DESC',
        [id]
      );
      
      const comments = result.rows.map(row => ({
        id: row.id,
        author: row.user_name,
        text: row.comment,
        date: row.created_at
      }));
      
      const response = {
        storyId: parseInt(id),
        comments: comments,
        total: comments.length,
        exists: true
      };
      
      console.log(`✅ Comentarios obtenidos: ${comments.length}`);
      res.json(response);
    } catch (dbError) {
      console.error(`❌ Error de base de datos para comentarios de historia ${id}:`, dbError.message);
      // Si hay error de BD, devolver array vacío
      return res.json({
        storyId: parseInt(id),
        comments: [],
        total: 0,
        exists: false,
        error: 'DB_ERROR'
      });
    }
  } catch (error) {
    console.error('❌ Error general getting story comments:', error);
    // Fallback response para evitar 500
    res.json({
      storyId: parseInt(req.params.id),
      comments: [],
      total: 0,
      exists: false,
      error: 'GENERAL_ERROR'
    });
  }
});

// Manejador genérico para rutas no encontradas
app.use((req, res) => {
  console.log(`⚠️ Ruta no encontrada: ${req.method} ${req.url}`);
  // Verificar si es una ruta de API de stories
  if (req.url.match(/^\/api\/stories\/\d+\/.+/)) {
    const storyId = req.url.split('/')[3]; // Extraer el ID de la URL
    res.json({ 
      storyId: parseInt(storyId),
      error: 'Endpoint específico no encontrado',
      exists: false
    });
  } else {
    res.json({ 
      error: 'Endpoint no encontrado', 
      path: req.url,
      suggestion: 'API endpoints start with /api/'
    });
  }
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('❌ Error no manejado:', error);
  res.status(200).json({ 
    error: 'Error interno del servidor',
    message: error.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor debug ultra-robusto ejecutándose en puerto ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`📊 Variables DB:`, {
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'historias_desopilantes',
    user: process.env.DB_USER || 'postgres'
  });
  console.log(`📝 Configuración CORS: Permitiendo todos los orígenes`);
  console.log(`📝 Solución implementada para evitar errores 404 en IDs inexistentes\n`);
});
