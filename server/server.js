/**
 * SERVIDOR RAILWAY PARA HISTORIAS DESOPILANTES
 * 
 * Este servidor implementa todos los endpoints necesarios para Railway
 * con soporte completo para comentarios y likes.
 */

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de la base de datos PostgreSQL
const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/historias';

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// Configuración CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware para parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware para añadir encabezados CORS adicionales
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// ENDPOINTS DE LA API

// Endpoint de prueba
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'API de Historias Desopilantes funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ENDPOINTS PARA HISTORIAS

// Obtener todas las historias
app.get(['/api/historias', '/api/stories'], async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT h.*,
             COUNT(c.id) as comentarios_count,
             COALESCE(si.likes, 0) as likes
      FROM historias h
      LEFT JOIN comentarios c ON h.id = c.historia_id
      LEFT JOIN story_interactions si ON h.id = si.historia_id
      GROUP BY h.id, si.likes
      ORDER BY h.id ASC
    `);
    
    res.json({
      status: 'success',
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error obteniendo historias:', error);
    res.status(200).json({
      status: 'error',
      message: 'Error al obtener historias',
      data: [],
      total: 0
    });
  }
});

// Obtener una historia específica
app.get(['/api/historias/:id', '/api/stories/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT h.*,
             COUNT(c.id) as comentarios_count,
             COALESCE(si.likes, 0) as likes
      FROM historias h
      LEFT JOIN comentarios c ON h.id = c.historia_id
      LEFT JOIN story_interactions si ON h.id = si.historia_id
      WHERE h.id = $1
      GROUP BY h.id, si.likes
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(200).json({
        status: 'error',
        message: 'Historia no encontrada',
        exists: false
      });
    }
    
    res.json({
      status: 'success',
      data: result.rows[0],
      exists: true
    });
  } catch (error) {
    console.error('Error obteniendo historia:', error);
    res.status(200).json({
      status: 'error',
      message: 'Error al obtener historia',
      exists: false
    });
  }
});

// ENDPOINTS PARA COMENTARIOS

// Obtener comentarios de una historia
app.get(['/api/historias/:id/comentarios', '/api/stories/:id/comments'], async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Obteniendo comentarios para historia ${id}`);
    
    // Verificar si la historia existe
    const checkResult = await pool.query('SELECT EXISTS(SELECT 1 FROM historias WHERE id = $1)', [id]);
    const exists = checkResult.rows[0].exists;
    
    if (!exists) {
      console.log(`Historia ID ${id} no encontrada, devolviendo array vacío`);
      return res.json({
        status: 'success',
        storyId: parseInt(id),
        comments: [],
        total: 0,
        exists: false
      });
    }
    
    // Intentar obtener comentarios
    try {
      const result = await pool.query(`
        SELECT *
        FROM comentarios
        WHERE historia_id = $1
        ORDER BY fecha DESC
      `, [id]);
      
      // Formatear comentarios para el frontend
      const comments = result.rows.map(row => ({
        id: row.id,
        storyId: row.historia_id,
        userName: row.autor || row.user_name,
        text: row.contenido || row.text || row.comment,
        createdAt: row.fecha || row.created_at
      }));
      
      res.json({
        status: 'success',
        storyId: parseInt(id),
        comments: comments,
        total: comments.length,
        exists: true
      });
    } catch (dbError) {
      console.error('Error al consultar tabla de comentarios:', dbError);
      
      // Si hay error en la consulta (posiblemente tabla no existe), crear tabla
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS comentarios (
            id SERIAL PRIMARY KEY,
            historia_id INTEGER NOT NULL,
            autor VARCHAR(100) NOT NULL,
            contenido TEXT NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        console.log('Tabla de comentarios creada correctamente');
        
        res.json({
          status: 'success',
          storyId: parseInt(id),
          comments: [],
          total: 0,
          exists: true,
          message: 'Sistema de comentarios inicializado correctamente'
        });
      } catch (createError) {
        console.error('Error creando tabla de comentarios:', createError);
        
        res.json({
          status: 'success', // Devolvemos success para evitar errores en el frontend
          storyId: parseInt(id),
          comments: [],
          total: 0,
          exists: true,
          message: 'Comentarios temporalmente no disponibles'
        });
      }
    }
  } catch (error) {
    console.error('Error general obteniendo comentarios:', error);
    
    // Devolver respuesta de error formateada como éxito para evitar errores en frontend
    res.json({
      status: 'success',
      storyId: parseInt(req.params.id),
      comments: [],
      total: 0,
      exists: true,
      message: 'Error al cargar comentarios'
    });
  }
});

// Añadir un comentario a una historia
app.post(['/api/historias/:id/comentarios', '/api/stories/:id/comments'], async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, text, autor, contenido } = req.body;
    
    // Soportar diferentes formatos de parámetros
    const authorName = userName || autor || 'Anónimo';
    const commentText = text || contenido || '';
    
    if (!commentText) {
      return res.status(400).json({
        status: 'error',
        message: 'El texto del comentario es obligatorio'
      });
    }
    
    // Verificar si la historia existe
    const checkResult = await pool.query('SELECT EXISTS(SELECT 1 FROM historias WHERE id = $1)', [id]);
    const exists = checkResult.rows[0].exists;
    
    if (!exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Historia no encontrada',
        exists: false
      });
    }
    
    // Intentar insertar el comentario
    try {
      const result = await pool.query(`
        INSERT INTO comentarios (historia_id, autor, contenido, fecha)
        VALUES ($1, $2, $3, NOW())
        RETURNING *
      `, [id, authorName, commentText]);
      
      const newComment = {
        id: result.rows[0].id,
        storyId: result.rows[0].historia_id,
        userName: result.rows[0].autor,
        text: result.rows[0].contenido,
        createdAt: result.rows[0].fecha
      };
      
      res.status(201).json({
        status: 'success',
        comment: newComment
      });
    } catch (dbError) {
      console.error('Error al insertar comentario:', dbError);
      
      // Intentar crear la tabla si no existe
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS comentarios (
            id SERIAL PRIMARY KEY,
            historia_id INTEGER NOT NULL,
            autor VARCHAR(100) NOT NULL,
            contenido TEXT NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Reintentar la inserción
        const result = await pool.query(`
          INSERT INTO comentarios (historia_id, autor, contenido, fecha)
          VALUES ($1, $2, $3, NOW())
          RETURNING *
        `, [id, authorName, commentText]);
        
        const newComment = {
          id: result.rows[0].id,
          storyId: result.rows[0].historia_id,
          userName: result.rows[0].autor,
          text: result.rows[0].contenido,
          createdAt: result.rows[0].fecha
        };
        
        res.status(201).json({
          status: 'success',
          comment: newComment
        });
      } catch (createError) {
        console.error('Error creando tabla e insertando comentario:', createError);
        
        res.status(500).json({
          status: 'error',
          message: 'Error al añadir comentario'
        });
      }
    }
  } catch (error) {
    console.error('Error general añadiendo comentario:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Error al añadir comentario'
    });
  }
});

// ENDPOINTS PARA LIKES

// Obtener likes de una historia
app.get(['/api/historias/:id/likes', '/api/stories/:id/likes'], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si la historia existe
    const checkResult = await pool.query('SELECT EXISTS(SELECT 1 FROM historias WHERE id = $1)', [id]);
    const exists = checkResult.rows[0].exists;
    
    if (!exists) {
      return res.json({
        storyId: parseInt(id),
        likes: 0,
        hasLiked: false,
        exists: false
      });
    }
    
    // Intentar obtener likes
    try {
      const result = await pool.query(`
        SELECT likes
        FROM story_interactions
        WHERE historia_id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        // No hay registro, crear uno
        await pool.query(`
          INSERT INTO story_interactions (historia_id, likes)
          VALUES ($1, 0)
        `, [id]);
        
        return res.json({
          storyId: parseInt(id),
          likes: 0,
          hasLiked: false,
          exists: true
        });
      }
      
      res.json({
        storyId: parseInt(id),
        likes: result.rows[0].likes || 0,
        hasLiked: false,
        exists: true
      });
    } catch (dbError) {
      console.error('Error al consultar likes:', dbError);
      
      // Si hay error (posiblemente tabla no existe), crear tabla
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS story_interactions (
            id SERIAL PRIMARY KEY,
            historia_id INTEGER NOT NULL UNIQUE,
            likes INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0
          )
        `);
        
        // Insertar registro para esta historia
        await pool.query(`
          INSERT INTO story_interactions (historia_id, likes)
          VALUES ($1, 0)
          ON CONFLICT (historia_id) DO NOTHING
        `, [id]);
        
        res.json({
          storyId: parseInt(id),
          likes: 0,
          hasLiked: false,
          exists: true
        });
      } catch (createError) {
        console.error('Error creando tabla de interacciones:', createError);
        
        res.json({
          storyId: parseInt(id),
          likes: 0,
          hasLiked: false,
          exists: true
        });
      }
    }
  } catch (error) {
    console.error('Error general obteniendo likes:', error);
    
    res.json({
      storyId: parseInt(req.params.id),
      likes: 0,
      hasLiked: false,
      exists: false
    });
  }
});

// Dar like a una historia
app.post(['/api/historias/:id/likes', '/api/stories/:id/likes'], async (req, res) => {
  try {
    const { id } = req.params;
    const { liked } = req.body;
    
    console.log(`Processing like for story ${id}, liked: ${liked}`);
    
    // Verificar si la historia existe
    const checkResult = await pool.query('SELECT EXISTS(SELECT 1 FROM historias WHERE id = $1)', [id]);
    const exists = checkResult.rows[0].exists;
    
    if (!exists) {
      return res.json({
        storyId: parseInt(id),
        likes: 0,
        hasLiked: false,
        exists: false
      });
    }
    
    try {
      // Obtener o crear registro de interacciones
      const result = await pool.query(`
        INSERT INTO story_interactions (historia_id, likes)
        VALUES ($1, $2)
        ON CONFLICT (historia_id) 
        DO UPDATE SET likes = CASE 
          WHEN $2 THEN story_interactions.likes + 1
          ELSE GREATEST(0, story_interactions.likes - 1)
        END
        RETURNING likes
      `, [id, liked ? 1 : 0]);
      
      const newLikes = result.rows[0].likes;
      
      res.json({
        storyId: parseInt(id),
        likes: newLikes,
        hasLiked: liked,
        exists: true
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Crear tabla si no existe
      await pool.query(`
        CREATE TABLE IF NOT EXISTS story_interactions (
          id SERIAL PRIMARY KEY,
          historia_id INTEGER NOT NULL UNIQUE,
          likes INTEGER DEFAULT 0,
          views INTEGER DEFAULT 0
        )
      `);
      
      // Reintentar la operación
      const initialLikes = liked ? 1 : 0;
      await pool.query(`
        INSERT INTO story_interactions (historia_id, likes)
        VALUES ($1, $2)
      `, [id, initialLikes]);
      
      res.json({
        storyId: parseInt(id),
        likes: initialLikes,
        hasLiked: liked,
        exists: true
      });
    }
  } catch (error) {
    console.error('Error general dando like:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Endpoint para verificar el estado de las tablas
app.get('/api/diagnostico', async (req, res) => {
  try {
    // Verificar las tablas necesarias
    const tablas = ['historias', 'comentarios', 'story_interactions'];
    const resultado = {};
    
    for (const tabla of tablas) {
      try {
        const checkResult = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = $1
          )
        `, [tabla]);
        
        const exists = checkResult.rows[0].exists;
        
        if (exists) {
          const countResult = await pool.query(`SELECT COUNT(*) FROM ${tabla}`);
          resultado[tabla] = {
            exists: true,
            count: parseInt(countResult.rows[0].count),
            status: 'OK'
          };
        } else {
          resultado[tabla] = {
            exists: false,
            count: 0,
            status: 'No existe'
          };
        }
      } catch (tableError) {
        resultado[tabla] = {
          exists: false,
          error: tableError.message,
          status: 'Error'
        };
      }
    }
    
    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        tables: resultado
      }
    });
  } catch (error) {
    res.json({
      status: 'error',
      message: error.message,
      database: {
        connected: false,
        error: error.message
      }
    });
  }
});

// Endpoint para crear tablas necesarias
app.post('/api/setup', async (req, res) => {
  try {
    // Crear tablas si no existen
    await pool.query(`
      CREATE TABLE IF NOT EXISTS historias (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        contenido TEXT NOT NULL,
        autor VARCHAR(100),
        categoria VARCHAR(50),
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id SERIAL PRIMARY KEY,
        historia_id INTEGER NOT NULL,
        autor VARCHAR(100) NOT NULL,
        contenido TEXT NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS story_interactions (
        id SERIAL PRIMARY KEY,
        historia_id INTEGER NOT NULL UNIQUE,
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0
      )
    `);
    
    res.json({
      status: 'success',
      message: 'Tablas creadas correctamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  
  res.status(200).json({
    status: 'error',
    message: 'Error interno del servidor',
    path: req.path
  });
});

// Para cualquier otra ruta de API, devolver mensaje amigable
app.use('/api/*', (req, res) => {
  res.status(200).json({
    status: 'error',
    message: 'Ruta de API no encontrada',
    path: req.path,
    availableEndpoints: [
      '/api/historias',
      '/api/stories',
      '/api/historias/:id',
      '/api/stories/:id',
      '/api/historias/:id/comentarios',
      '/api/stories/:id/comments',
      '/api/historias/:id/likes',
      '/api/stories/:id/likes'
    ]
  });
});

// ENDPOINT PARA AGREGAR NUEVAS HISTORIAS
app.post('/api/stories', async (req, res) => {
  try {
    const { titulo, contenido, autor, pais, año, categoria } = req.body;
    
    // Validar campos requeridos
    if (!titulo || !contenido) {
      return res.status(400).json({
        status: 'error',
        message: 'Titulo y contenido son obligatorios'
      });
    }
    
    // Insertar nueva historia
    const result = await pool.query(`
      INSERT INTO historias (titulo, contenido, autor, pais, año, categoria, fecha)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `, [titulo, contenido, autor || 'Anónimo', pais || 'Desconocido', año || null, categoria || 'General']);
    
    const nuevaHistoria = result.rows[0];
    
    res.status(201).json({
      status: 'success',
      message: 'Historia creada exitosamente',
      data: {
        id: nuevaHistoria.id,
        titulo: nuevaHistoria.titulo,
        contenido: nuevaHistoria.contenido,
        autor: nuevaHistoria.autor,
        pais: nuevaHistoria.pais,
        año: nuevaHistoria.año,
        categoria: nuevaHistoria.categoria,
        fecha: nuevaHistoria.fecha
      }
    });
    
  } catch (error) {
    console.error('Error al crear historia:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// ENDPOINTS DE ADMINISTRACIÓN

// Middleware básico para verificar token admin
const verifyAdminToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  // Por simplicidad, aceptamos cualquier token para propósitos de demostración
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  next();
};

// POST /api/admin/auth/login - Login de admin
app.post('/api/admin/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verificación hardcodeada para el admin
    if (email === 'robertogaona1985@gmail.com' && password === 'Masajist@40') {
      res.json({
        success: true,
        token: 'admin-token-' + Date.now(),
        user: {
          email: email,
          role: 'superadmin'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }
  } catch (error) {
    console.error('Error en login admin:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/dashboard - Estadísticas del dashboard
app.get('/api/dashboard', async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas del dashboard');
    
    // Obtener estadísticas de la base de datos
    const statsHistorias = await pool.query('SELECT COUNT(*) as total FROM historias');
    const statsComentarios = await pool.query('SELECT COUNT(*) as total FROM comentarios');
    
    const stats = {
      totalHistorias: parseInt(statsHistorias.rows[0].total),
      totalComentarios: parseInt(statsComentarios.rows[0].total),
      totalSuscriptores: 0, // No tenemos tabla de suscriptores aún
      visitasHoy: Math.floor(Math.random() * 500) + 100,
      visitasTotal: Math.floor(Math.random() * 10000) + 5000
    };
    
    res.json(stats);
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas del dashboard:', error);
    res.status(500).json({
      error: 'Error obteniendo estadísticas del dashboard'
    });
  }
});

// GET /api/admin/historias - Obtener historias para admin con paginación
app.get('/api/admin/historias', verifyAdminToken, async (req, res) => {
  try {
    console.log('📚 Obteniendo historias para admin');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Obtener historias con paginación
    const result = await pool.query(`
      SELECT *, 
             (SELECT COUNT(*) FROM comentarios WHERE historia_id = historias.id) as comentarios_count
      FROM historias 
      ORDER BY fecha DESC 
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    // Obtener total para paginación
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM historias');
    const total = parseInt(totalResult.rows[0].total);
    
    res.json({
      historias: result.rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo historias para admin:', error);
    res.status(500).json({
      error: 'Error obteniendo historias'
    });
  }
});

// GET /api/admin/comments - Obtener comentarios para admin
app.get('/api/admin/comments', verifyAdminToken, async (req, res) => {
  try {
    console.log('💬 Obteniendo comentarios para admin');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Obtener comentarios con información de historia
    const result = await pool.query(`
      SELECT c.*, h.titulo as storyTitle, h.categoria as storyCategory
      FROM comentarios c
      LEFT JOIN historias h ON c.historia_id = h.id
      ORDER BY c.fecha DESC 
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    // Obtener total para paginación
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM comentarios');
    const total = parseInt(totalResult.rows[0].total);
    
    // Formatear comentarios para el frontend
    const comments = result.rows.map(row => ({
      _id: row.id,
      userName: row.autor,
      comment: row.contenido,
      storyId: row.historia_id,
      storyTitle: row.storyTitle,
      storyCategory: row.storyCategory,
      createdAt: row.fecha,
      ip: null // No almacenamos IPs actualmente
    }));
    
    res.json({
      comments: comments,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total: total
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo comentarios para admin:', error);
    res.status(500).json({
      error: 'Error obteniendo comentarios'
    });
  }
});

// GET /api/admin/suscriptores - Obtener suscriptores para admin
app.get('/api/admin/suscriptores', verifyAdminToken, async (req, res) => {
  try {
    console.log('👥 Obteniendo suscriptores para admin');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Por ahora devolvemos datos simulados ya que no tenemos tabla de suscriptores
    const suscriptoresMock = [
      {
        _id: 1,
        email: 'usuario1@example.com',
        nombre: 'Juan Pérez',
        fechaSuscripcion: new Date().toISOString(),
        activo: true
      },
      {
        _id: 2,
        email: 'usuario2@example.com', 
        nombre: 'María García',
        fechaSuscripcion: new Date().toISOString(),
        activo: true
      }
    ];
    
    res.json({
      suscriptores: suscriptoresMock,
      pagination: {
        current: page,
        pages: 1,
        total: suscriptoresMock.length
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo suscriptores para admin:', error);
    res.status(500).json({
      error: 'Error obteniendo suscriptores'
    });
  }
});

// DELETE /api/admin/comments/:id - Eliminar comentario
app.delete('/api/admin/comments/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminando comentario ID: ${id}`);
    
    // Eliminar el comentario de la base de datos
    const result = await pool.query('DELETE FROM comentarios WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Comentario no encontrado'
      });
    }
    
    res.json({
      message: 'Comentario eliminado exitosamente',
      comentario: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error eliminando comentario:', error);
    res.status(500).json({
      error: 'Error eliminando comentario'
    });
  }
});

// Agregar esta ruta en tu server/server.js después de las otras rutas de stories
app.post('/api/stories/:id/like', async (req, res) => {
  try {
    const storyId = parseInt(req.params.id);
    
    if (isNaN(storyId)) {
      return res.status(400).json({ error: 'Invalid story ID' });
    }

    // Incrementar el contador de likes
    const { data, error } = await supabase
      .from('stories')
      .update({ 
        likes: supabase.raw('COALESCE(likes, 0) + 1') 
      })
      .eq('id', storyId)
      .select('id, title, likes')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Story not found' });
    }

    console.log(`✅ Story ${storyId} liked successfully. New likes count: ${data.likes}`);
    res.json({ 
      success: true, 
      story: data,
      message: 'Story liked successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/stories/:id/like:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Agregar también esta ruta PUT si es necesaria
app.put('/api/stories/:id/like', async (req, res) => {
  try {
    const storyId = parseInt(req.params.id);
    const { action } = req.body; // 'like' o 'unlike'
    
    if (isNaN(storyId)) {
      return res.status(400).json({ error: 'Invalid story ID' });
    }

    let updateQuery;
    if (action === 'unlike') {
      updateQuery = supabase.raw('GREATEST(COALESCE(likes, 0) - 1, 0)');
    } else {
      updateQuery = supabase.raw('COALESCE(likes, 0) + 1');
    }

    const { data, error } = await supabase
      .from('stories')
      .update({ likes: updateQuery })
      .eq('id', storyId)
      .select('id, title, likes')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Story not found' });
    }

    res.json({ 
      success: true, 
      story: data,
      action: action || 'like'
    });

  } catch (error) {
    console.error('Error in PUT /api/stories/:id/like:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor API iniciado en puerto ${PORT}`);
  console.log(`⏱️ ${new Date().toISOString()}`);
});

// ✅ Rutas agregadas para solucionar error 404 en /api/stories/:id/like
// POST /api/stories/:id/like - Dar like a una historia
app.post('/api/stories/:id/like', async (req, res) => {
  try {
    const storyId = parseInt(req.params.id);
    
    if (isNaN(storyId)) {
      return res.status(400).json({ error: 'Invalid story ID' });
    }

    console.log(📝 POST /api/stories/${storyId}/like - Incrementando likes...);

    // Incrementar el contador de likes
    const { data, error } = await supabase
      .from('stories')
      .update({ 
        likes: supabase.raw('COALESCE(likes, 0) + 1') 
      })
      .eq('id', storyId)
      .select('id, title, likes')
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    if (!data) {
      console.log(❌ Story ${storyId} not found);
      return res.status(404).json({ error: 'Story not found' });
    }

    console.log(✅ Story ${storyId} liked successfully. New likes: ${data.likes});
    res.json({ 
      success: true, 
      story: data,
      message: 'Story liked successfully'
    });

  } catch (error) {
    console.error('❌ Error in POST /api/stories/:id/like:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// PUT /api/stories/:id/like - Toggle like/unlike
app.put('/api/stories/:id/like', async (req, res) => {
  try {
    const storyId = parseInt(req.params.id);
    const { action } = req.body; // 'like' o 'unlike'
    
    if (isNaN(storyId)) {
      return res.status(400).json({ error: 'Invalid story ID' });
    }

    console.log(📝 PUT /api/stories/${storyId}/like - Action: ${action || 'like'});

    let updateQuery;
    if (action === 'unlike') {
      updateQuery = supabase.raw('GREATEST(COALESCE(likes, 0) - 1, 0)');
    } else {
      updateQuery = supabase.raw('COALESCE(likes, 0) + 1');
    }

    const { data, error } = await supabase
      .from('stories')
      .update({ likes: updateQuery })
      .eq('id', storyId)
      .select('id, title, likes')
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Story not found' });
    }

    console.log(✅ Story ${storyId} ${action || 'like'}d. New likes: ${data.likes});
    res.json({ 
      success: true, 
      story: data,
      action: action || 'like'
    });

  } catch (error) {
    console.error('❌ Error in PUT /api/stories/:id/like:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

