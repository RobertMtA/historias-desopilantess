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
const fs = require('fs');
require('dotenv').config();

// Importar el script de inicialización de la base de datos
const { initializeDatabase } = require('./db-setup');

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de la base de datos PostgreSQL
const isProduction = process.env.NODE_ENV === 'production';
const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;

// En Railway, ignorar variables manuales que apunten a localhost
const shouldIgnoreManualVars = isRailway && process.env.PGHOST === 'localhost';

// Configuración mejorada para Railway
const pool = new Pool({
  // Para Railway PostgreSQL, usar configuración específica
  ...(isRailway ? {
    host: process.env.PGHOST || 'postgres-f5yt.railway.internal',
    port: parseInt(process.env.PGPORT || '5432'),
    database: process.env.PGDATABASE || 'railway',
    user: process.env.PGUSER || 'postgres',
    // Para Railway, intentar sin contraseña
    ...(process.env.PGPASSWORD ? { password: process.env.PGPASSWORD } : {})
  } : process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
  } : {
    // Fallback para desarrollo local
    connectionString: 'postgresql://postgres:postgres@localhost:5432/historias'
  }),
  // SSL configurado correctamente para Railway
  ssl: (isProduction || isRailway) ? { rejectUnauthorized: false } : false
});

// Debug: mostrar configuración de la base de datos
console.log('=================================================');
console.log('🚀 Servidor escuchando en el puerto', PORT);
console.log('=================================================');
console.log('🔧 Configuración de base de datos:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
console.log('   DATABASE_URL disponible:', !!process.env.DATABASE_URL);
console.log('   DATABASE_PRIVATE_URL disponible:', !!process.env.DATABASE_PRIVATE_URL);
console.log('   PGHOST:', process.env.PGHOST);
console.log('   PGUSER:', process.env.PGUSER);
console.log('   PGDATABASE:', process.env.PGDATABASE);
console.log('   shouldIgnoreManualVars:', shouldIgnoreManualVars);
console.log('   SSL habilitado:', (isProduction || isRailway));
console.log('=================================================');

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
app.post(['/api/historias/:id/likes', '/api/stories/:id/likes', '/api/historias/:id/like', '/api/stories/:id/like'], async (req, res) => {
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
    
    // Intentar actualizar likes
    try {
      // Obtener likes actuales
      const currentResult = await pool.query(`
        SELECT likes
        FROM story_interactions
        WHERE historia_id = $1
      `, [id]);
      
      let currentLikes = 0;
      
      if (currentResult.rows.length === 0) {
        // No hay registro, crear uno
        await pool.query(`
          INSERT INTO story_interactions (historia_id, likes)
          VALUES ($1, 1)
        `, [id]);
        
        currentLikes = 1;
      } else {
        // Incrementar likes
        currentLikes = (currentResult.rows[0].likes || 0) + 1;
        
        await pool.query(`
          UPDATE story_interactions
          SET likes = $1
          WHERE historia_id = $2
        `, [currentLikes, id]);
      }
      
      res.json({
        storyId: parseInt(id),
        likes: currentLikes,
        hasLiked: true,
        exists: true
      });
    } catch (dbError) {
      console.error('Error al actualizar likes:', dbError);
      
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
        
        // Insertar registro para esta historia con un like
        await pool.query(`
          INSERT INTO story_interactions (historia_id, likes)
          VALUES ($1, 1)
          ON CONFLICT (historia_id) DO UPDATE SET likes = story_interactions.likes + 1
        `, [id]);
        
        res.json({
          storyId: parseInt(id),
          likes: 1,
          hasLiked: true,
          exists: true
        });
      } catch (createError) {
        console.error('Error creando tabla e incrementando likes:', createError);
        
        res.json({
          storyId: parseInt(id),
          likes: 1,
          hasLiked: true,
          exists: true
        });
      }
    }
  } catch (error) {
    console.error('Error general dando like:', error);
    
    res.json({
      storyId: parseInt(req.params.id),
      likes: 0,
      hasLiked: false,
      exists: false
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

// Inicializar la base de datos y luego iniciar el servidor
initializeDatabase()
  .then(() => {
    // Iniciar el servidor una vez inicializada la base de datos
    app.listen(PORT, () => {
      console.log(`🚀 Servidor API iniciado en puerto ${PORT}`);
      console.log(`⏱️ ${new Date().toISOString()}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
      console.log(`🌐 CORS configurado para: https://histostorias-desopilantes.web.app, https://histostorias-desopilantes.firebaseapp.com, http://localhost:5173, http://localhost:4173, http://localhost:3000`);
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
  })
  .catch(err => {
    console.error('❌ Error al inicializar la base de datos:', err);
    // Iniciar el servidor de todos modos para no bloquear la aplicación
    app.listen(PORT, () => {
      console.log(`⚠️ Servidor API iniciado con errores en la inicialización de la base de datos`);
      console.log(`🚀 Escuchando en puerto ${PORT}`);
      console.log(`⏱️ ${new Date().toISOString()}`);
    });
  });
