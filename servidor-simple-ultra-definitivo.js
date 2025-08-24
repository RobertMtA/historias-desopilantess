/**
 * SERVIDOR ULTRA DEFINITIVO SIMPLIFICADO (SIN POSTGRES)
 * 
 * Esta es una versión simplificada del servidor ultra definitivo que no requiere
 * una conexión a PostgreSQL para funcionar, perfecto para pruebas rápidas.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Configuración de la aplicación Express
const app = express();

// Lista de IDs válidos según la verificación de la base de datos
const VALID_STORY_IDS = Array.from({ length: 21 }, (_, i) => i + 1);

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

// MIDDLEWARE PARA VALIDAR IDs DE HISTORIAS - Intercepta antes de cualquier ruta
app.use('/api/stories/:id', (req, res, next) => {
  const id = parseInt(req.params.id);
  const isValidId = !isNaN(id) && VALID_STORY_IDS.includes(id);
  
  // Si no es un ID válido, devolvemos respuesta predeterminada basada en la ruta
  if (!isValidId) {
    console.log(`⚠️ Interceptando petición a historia inexistente ID: ${id}`);
    
    // Detectar el tipo de endpoint
    if (req.path.includes('/likes') || req.originalUrl.includes('/likes')) {
      console.log(`⚙️ Devolviendo likes=0 para historia inexistente ${id}`);
      return res.status(200).json({
        storyId: id,
        likes: 0,
        hasLiked: false,
        exists: false,
        intercepted: true
      });
    } 
    else if (req.path.includes('/comments') || req.originalUrl.includes('/comments')) {
      console.log(`⚙️ Devolviendo comments=[] para historia inexistente ${id}`);
      return res.status(200).json({
        storyId: id,
        comments: [],
        total: 0,
        exists: false,
        intercepted: true
      });
    }
    else {
      console.log(`⚙️ Devolviendo historia vacía para ID inexistente ${id}`);
      return res.status(200).json({
        id,
        exists: false,
        intercepted: true
      });
    }
  }
  
  next();
});

// RUTAS API BÁSICAS

// Ruta de prueba para verificar que el servidor está funcionando
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '✅ Servidor backend ultra definitivo funcionando correctamente', 
    timestamp: new Date(),
    version: 'ultra-definitivo-simplificado-v1.0.0'
  });
});

// Ruta específica para verificar IDs válidos (útil para el frontend)
app.get('/api/valid-ids', (req, res) => {
  res.json({ 
    validIds: VALID_STORY_IDS,
    min: Math.min(...VALID_STORY_IDS),
    max: Math.max(...VALID_STORY_IDS),
    count: VALID_STORY_IDS.length
  });
});

// RUTAS PARA HISTORIAS Y LIKES

// Ruta simplificada para obtener likes (sin base de datos)
app.get('/api/stories/:id/likes', (req, res) => {
  const id = parseInt(req.params.id);
  
  // Si el ID está en el rango válido, devolver un valor aleatorio
  if (VALID_STORY_IDS.includes(id)) {
    const randomLikes = Math.floor(Math.random() * 100) + 1;
    console.log(`✅ Devolviendo ${randomLikes} likes para historia ${id}`);
    
    return res.json({
      storyId: id,
      likes: randomLikes,
      hasLiked: false,
      exists: true
    });
  }
  
  // Para IDs no válidos, ya está manejado por el middleware, pero por si acaso:
  console.log(`⚠️ Historia ID: ${id} no encontrada, devolviendo likes=0`);
  return res.json({
    storyId: id,
    likes: 0,
    hasLiked: false,
    exists: false
  });
});

// Ruta simplificada para obtener comentarios (sin base de datos)
app.get('/api/stories/:id/comments', (req, res) => {
  const id = parseInt(req.params.id);
  
  // Si el ID está en el rango válido, devolver comentarios de muestra
  if (VALID_STORY_IDS.includes(id)) {
    console.log(`✅ Devolviendo comentarios de muestra para historia ${id}`);
    
    return res.json({
      storyId: id,
      comments: [
        {
          id: 1,
          storyId: id,
          userName: 'Usuario de Prueba',
          text: 'Este es un comentario de prueba para la historia ' + id,
          createdAt: new Date()
        }
      ],
      total: 1,
      exists: true
    });
  }
  
  // Para IDs no válidos, ya está manejado por el middleware, pero por si acaso:
  console.log(`⚠️ Historia ID: ${id} no encontrada, devolviendo comments=[]`);
  return res.json({
    storyId: id,
    comments: [],
    total: 0,
    exists: false
  });
});

// Ruta para dar like a una historia (simulada)
app.post('/api/stories/:id/likes', (req, res) => {
  const id = parseInt(req.params.id);
  
  // Simular éxito para cualquier ID
  res.json({
    storyId: id,
    success: true,
    message: 'Like registrado correctamente'
  });
});

// Ruta para agregar comentario a una historia (simulada)
app.post('/api/stories/:id/comments', (req, res) => {
  const id = parseInt(req.params.id);
  const { userName, text } = req.body;
  
  // Simular éxito para cualquier ID
  res.json({
    id: Date.now(),
    storyId: id,
    userName: userName || 'Anónimo',
    text: text || 'Comentario sin contenido',
    createdAt: new Date(),
    success: true
  });
});

// Ruta para capturar cualquier otra URL de API
app.use('/api/*', (req, res) => {
  console.log(`⚠️ Ruta de API no encontrada: ${req.originalUrl}`);
  res.status(200).json({ 
    error: 'Ruta de API no encontrada',
    path: req.originalUrl,
    success: false 
  });
});

// Todas las demás rutas sirven la aplicación React
app.get('*', (req, res) => {
  console.log(`📄 Sirviendo index.html para ruta: ${req.originalUrl}`);
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`\n\n🚀 Servidor ULTRA DEFINITIVO SIMPLIFICADO ejecutándose en puerto ${PORT}`);
  console.log(`📊 Modo: ${process.env.NODE_ENV || 'desarrollo'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`📋 IDs válidos: ${VALID_STORY_IDS.join(', ')}`);
  console.log(`\n💡 NOTA: Este servidor NO requiere conexión a PostgreSQL\n`);
});

module.exports = app;
