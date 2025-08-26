const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Configuración CORS específica
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '🎉 Historias Desopilantes API is running!',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    server: 'Railway',
    environment: process.env.RAILWAY_ENVIRONMENT || 'development'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: {
      node_version: process.version,
      railway_env: !!process.env.RAILWAY_ENVIRONMENT,
      port: PORT
    }
  });
});

// Endpoint de prueba
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint called from:', req.get('origin') || 'unknown');
  res.json({
    status: 'success',
    message: '✅ API funcionando correctamente desde Railway',
    timestamp: new Date().toISOString(),
    server: 'Railway-Simplified',
    cors: 'Configured',
    environment: process.env.RAILWAY_ENVIRONMENT || 'development'
  });
});

// Dashboard endpoint (mock data for now)
app.get('/api/dashboard', (req, res) => {
  console.log('📊 Dashboard endpoint called');
  
  const mockStats = {
    historias: 6,
    comentarios: 18,
    suscriptores: 13
  };
  
  res.json({
    status: 'success',
    data: mockStats,
    timestamp: new Date().toISOString(),
    note: 'Mock data - database not connected yet'
  });
});

// Endpoint para formulario de contacto
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({
      status: 'error',
      message: 'Todos los campos son requeridos'
    });
  }
  
  console.log('📧 Contact form submitted:', {
    name,
    email,
    messageLength: message.length
  });
  
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

// Endpoint para obtener likes de una historia (mock)
app.get('/api/stories/:id/likes', (req, res) => {
  const { id } = req.params;
  console.log(`❤️ Getting likes for story ${id}`);
  
  res.json({
    status: 'success',
    storyId: parseInt(id),
    likes: Math.floor(Math.random() * 150) + 10,
    hasLiked: false,
    note: 'Mock data - database not connected yet'
  });
});

// Endpoint para dar like a una historia (mock)
app.post('/api/stories/:id/likes', (req, res) => {
  const { id } = req.params;
  console.log(`❤️ Like added to story ${id}`);
  
  res.json({
    status: 'success',
    message: 'Like agregado exitosamente',
    storyId: parseInt(id),
    likes: Math.floor(Math.random() * 150) + 11,
    hasLiked: true,
    note: 'Mock data - database not connected yet'
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 'error',
    message: `Endpoint no encontrado: ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/test',
      'GET /api/dashboard',
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
    timestamp: new Date().toISOString(),
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Historias Desopilantes API Server running!`);
  console.log(`🌍 Port: ${PORT}`);
  console.log(`🔗 Environment: ${process.env.RAILWAY_ENVIRONMENT || 'development'}`);
  console.log(`🌐 CORS configured for: ${corsOptions.origin.join(', ')}`);
  console.log(`📝 Available endpoints:`);
  console.log(`   GET  / (root)`);
  console.log(`   GET  /health`);
  console.log(`   GET  /api/test`);
  console.log(`   GET  /api/dashboard`);
  console.log(`   POST /api/contact`);
  console.log(`   GET  /api/stories/:id/likes`);
  console.log(`   POST /api/stories/:id/likes`);
  console.log(`🎉 Server ready for requests!`);
});

module.exports = app;
