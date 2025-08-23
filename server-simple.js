const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Configuración CORS simple y funcional
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://histostorias-desopilantes.web.app',
    'https://histostorias-desopilantes.firebaseapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Rutas básicas de la API
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Servidor funcionando correctamente', timestamp: new Date() });
});

// Ruta para likes de historias (simulada)
app.get('/api/stories/:id/likes', (req, res) => {
  const { id } = req.params;
  res.json({
    storyId: parseInt(id),
    likes: Math.floor(Math.random() * 100),
    hasLiked: false
  });
});

app.post('/api/stories/:id/likes', (req, res) => {
  const { id } = req.params;
  res.json({
    storyId: parseInt(id),
    likes: Math.floor(Math.random() * 100) + 1,
    hasLiked: true,
    message: 'Like agregado exitosamente'
  });
});

// Ruta para contacto (simulada)
app.post('/api/contact', (req, res) => {
  console.log('📨 Mensaje de contacto recibido:', req.body);
  res.json({
    message: 'Mensaje enviado exitosamente. Te responderemos pronto.',
    success: true
  });
});

app.get('/api/contact/test', (req, res) => {
  res.json({ 
    message: '✅ Ruta de contacto funcionando correctamente', 
    timestamp: new Date()
  });
});

// Todas las demás rutas sirven la aplicación React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📊 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});

module.exports = app;
