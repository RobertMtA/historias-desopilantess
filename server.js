const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuración de CORS específica
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://histostorias-desopilantes.web.app',
    'https://histostorias-desopilantes.firebaseapp.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
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

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3009;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📊 Modo: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});

module.exports = app;
