const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Configuración de CORS más robusta
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
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ CORS: Permitiendo origen ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ CORS: Bloqueando origen ${origin}`);
      callback(new Error('No permitido por CORS'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type', 
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token'
  ]
};

// Middleware global CORS
app.use(cors(corsOptions));

// Middleware adicional para headers CORS manuales
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://histostorias-desopilantes.web.app',
    'https://histostorias-desopilantes.firebaseapp.com'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,X-Access-Token');
  
  // Log de requests para debugging
  console.log(`📝 ${req.method} ${req.url} from ${origin || 'no-origin'}`);
  
  // Responder a preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔍 Preflight request received');
    res.status(200).end();
    return;
  }
  
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conectado a MongoDB Atlas');
})
.catch((error) => {
  console.error('❌ Error conectando a MongoDB Atlas:', error);
});

// Rutas
app.use('/api/subscribers', require('./routes/subscribers'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/stories', require('./routes/stories'));

// Servir archivos estáticos de la aplicación React construida
app.use(express.static(path.join(__dirname, 'dist')));

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Servidor backend funcionando correctamente', timestamp: new Date() });
});

// Ruta de prueba específica para contactos
app.get('/api/contact/test', (req, res) => {
  res.json({ 
    message: '✅ Ruta de contacto funcionando correctamente', 
    timestamp: new Date(),
    mongoStatus: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado'
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor', 
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal' 
  });
});

// Ruta 404 para API
app.use('/api/*', (req, res) => {
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
