/**
 * SERVIDOR ULTRA ROBUSTO CON MANEJO MEJORADO DE ERRORES 404
 * 
 * Este servidor maneja elegantemente las peticiones a historias que no existen,
 * devolviendo respuestas predeterminadas en lugar de errores 404.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la aplicación Express
const app = express();

// Configuración de conexión a PostgreSQL
const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/historias';

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Lista de orígenes permitidos
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://histostorias-desopilantes.web.app',
      'https://histostorias-desopilantes.firebaseapp.com'
    ];
    
    // Permitir requests sin origin (como apps móviles o Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ Origen bloqueado por CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cache-Control', 'X-Access-Token']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`📝 ${req.method} ${req.url} from ${origin || 'no-origin'}`);
  next();
});

// RUTAS API BÁSICAS

// Ruta de prueba para verificar que el servidor está funcionando
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '✅ Servidor backend funcionando correctamente', 
    timestamp: new Date() 
  });
});

// Ruta de prueba para verificar la conexión a la base de datos
app.get('/api/test/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: '✅ Conexión a base de datos exitosa', 
      timestamp: result.rows[0].now,
      dbStatus: 'connected'
    });
  } catch (error) {
    console.error('❌ Error de conexión a base de datos:', error);
    res.status(500).json({ 
      message: '❌ Error de conexión a base de datos', 
      error: error.message,
      dbStatus: 'disconnected'
    });
  }
});

// RUTAS PARA HISTORIAS Y LIKES

// Ruta mejorada para obtener likes (sin devolver 404)
app.get('/api/stories/:id/likes', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Obteniendo likes para historia ID: ${id}`);
    
    // Verificar si la historia existe
    const checkResult = await pool.query('SELECT EXISTS(SELECT 1 FROM stories WHERE id = $1)', [id]);
    const exists = checkResult.rows[0].exists;
    
    if (!exists) {
      console.log(`⚠️ Historia ID: ${id} no encontrada, devolviendo likes=0`);
      return res.json({
        storyId: parseInt(id),
        likes: 0,
        hasLiked: false,
        exists: false
      });
    }
    
    // Si existe, obtener likes reales
    const result = await pool.query('SELECT likes FROM stories WHERE id = $1', [id]);
    
    // En el caso improbable de que exista pero no se encuentre (concurrencia)
    if (!result || result.rows.length === 0) {
      console.log(`⚠️ Historia ID: ${id} no encontrada en segunda verificación, devolviendo likes=0`);
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
      error: 'SERVER_ERROR'
    });
  }
});

// Ruta mejorada para obtener comentarios (sin devolver 404)
app.get('/api/stories/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Obteniendo comentarios para historia ID: ${id}`);
    
    // Verificar si la historia existe
    const checkResult = await pool.query('SELECT EXISTS(SELECT 1 FROM stories WHERE id = $1)', [id]);
    const exists = checkResult.rows[0].exists;
    
    if (!exists) {
      console.log(`⚠️ Historia ID: ${id} no encontrada, devolviendo comments=[]`);
      return res.json({
        storyId: parseInt(id),
        comments: [],
        total: 0,
        exists: false
      });
    }
    
    // Si existe, obtener comentarios reales
    const result = await pool.query(
      'SELECT * FROM comments WHERE story_id = $1 ORDER BY created_at DESC',
      [id]
    );
    
    const comments = result.rows.map(row => ({
      id: row.id,
      storyId: row.story_id,
      userName: row.user_name,
      text: row.text,
      createdAt: row.created_at
    }));
    
    const response = {
      storyId: parseInt(id),
      comments,
      total: comments.length,
      exists: true
    };
    
    console.log(`✅ Comentarios obtenidos: ${comments.length} para historia ${id}`);
    res.json(response);
  } catch (error) {
    console.error('❌ Error general getting comments:', error);
    // Fallback response para evitar 500
    res.json({
      storyId: parseInt(req.params.id),
      comments: [],
      total: 0,
      exists: false,
      error: 'SERVER_ERROR'
    });
  }
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor', 
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal' 
  });
});

// Ruta 404 para API - Devuelve respuestas específicas según el endpoint
app.use('/api/stories/:id/likes', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`⚠️ Ruta de API no encontrada para likes de historia ${id}`);
  res.json({
    storyId: id,
    likes: 0,
    hasLiked: false,
    exists: false,
    error: 'NOT_FOUND'
  });
});

app.use('/api/stories/:id/comments', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`⚠️ Ruta de API no encontrada para comentarios de historia ${id}`);
  res.json({
    storyId: id,
    comments: [],
    total: 0,
    exists: false,
    error: 'NOT_FOUND'
  });
});

app.use('/api/*', (req, res) => {
  console.log(`⚠️ Ruta de API no encontrada: ${req.originalUrl}`);
  res.status(404).json({ error: 'Ruta de API no encontrada' });
});

// Todas las demás rutas sirven la aplicación React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📊 Modo: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});

module.exports = app;
