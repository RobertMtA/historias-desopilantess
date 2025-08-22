const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3009;

// Configuración CORS específica para tu dominio
const corsOptions = {
  origin: [
    'https://histostorias-desopilantes.web.app',
    'https://histostorias-desopilantes.firebaseapp.com',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Aplicar CORS
app.use(cors(corsOptions));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Headers de seguridad básicos
app.use((req, res, next) => {
  res.header('X-Powered-By', 'Historias-API');
  next();
});

// Endpoint de prueba
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint called from:', req.get('origin') || 'unknown');
  res.json({
    status: 'success',
    message: '✅ API funcionando correctamente desde Railway',
    timestamp: new Date().toISOString(),
    server: 'Railway-Clean',
    cors: 'Configured'
  });
});

// Endpoint para formulario de contacto
app.post('/api/contact', (req, res) => {
  console.log('📧 Contact form submitted:', {
    name: req.body.name,
    email: req.body.email,
    hasMessage: !!req.body.message
  });
  
  const { name, email, message } = req.body;
  
  // Validación básica
  if (!name || !email || !message) {
    return res.status(400).json({
      status: 'error',
      message: 'Faltan campos obligatorios'
    });
  }
  
  // Simular procesamiento exitoso
  res.json({
    status: 'success',
    message: 'Mensaje enviado correctamente',
    data: { 
      name, 
      email,
      received: new Date().toISOString()
    }
  });
});

// Endpoint para obtener likes de una historia
app.get('/api/stories/:id/likes', (req, res) => {
  const { id } = req.params;
  console.log(`👍 Getting likes for story ${id}`);
  
  // Simular datos de likes
  res.json({
    status: 'success',
    storyId: parseInt(id),
    likes: Math.floor(Math.random() * 150) + 10,
    hasLiked: false
  });
});

// Endpoint para dar like a una historia
app.post('/api/stories/:id/likes', (req, res) => {
  const { id } = req.params;
  console.log(`❤️ Like added to story ${id}`);
  
  // Simular agregar like
  res.json({
    status: 'success',
    message: 'Like agregado exitosamente',
    storyId: parseInt(id),
    likes: Math.floor(Math.random() * 150) + 11,
    hasLiked: true
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 'error',
    message: `Endpoint no encontrado: ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /api/test',
      'POST /api/contact',
      'GET /api/stories/:id/likes',
      'POST /api/stories/:id/likes'
    ]
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('💥 Server error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`🌍 CORS configured for: ${corsOptions.origin.join(', ')}`);
  console.log(`📝 Available endpoints:`);
  console.log(`   GET  /api/test`);
  console.log(`   POST /api/contact`);
  console.log(`   GET  /api/stories/:id/likes`);
  console.log(`   POST /api/stories/:id/likes`);
});

module.exports = app;
