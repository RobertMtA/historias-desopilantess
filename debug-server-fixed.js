const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = 4000;

// Middleware básico
app.use(cors());
app.use(express.json());

// Pool de PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'historias_desopilantes',
  password: process.env.DB_PASSWORD || 'Masajist@40',
  port: process.env.DB_PORT || 5432,
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

// Ruta modificada para obtener likes (sin devolver 404)
app.get('/api/stories/:id/likes', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Obteniendo likes para historia ID: ${id}`);
    
    const result = await pool.query('SELECT likes FROM stories WHERE id = $1', [id]);
    
    // En lugar de retornar 404, devolvemos un objeto con likes=0
    if (result.rows.length === 0) {
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
    console.error('❌ Error getting story likes:', error);
    res.status(500).json({ error: 'Error al obtener likes de la historia' });
  }
});

// Ruta modificada para obtener comentarios (sin devolver 404)
app.get('/api/stories/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Obteniendo comentarios para historia ID: ${id}`);
    
    const result = await pool.query(
      'SELECT id, user_name, comment, created_at FROM comments WHERE story_id = $1 ORDER BY created_at DESC',
      [id]
    );
    
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
  } catch (error) {
    console.error('❌ Error getting story comments:', error);
    res.status(500).json({ error: 'Error al obtener comentarios de la historia' });
  }
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('❌ Error no manejado:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor debug ejecutándose en puerto ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`📊 Variables DB:`, {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER
  });
  console.log(`📝 Solución implementada para evitar errores 404 en IDs inexistentes`);
});

// Manejo de errores del proceso
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
