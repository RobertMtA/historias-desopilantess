const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ Conectado a MongoDB Atlas');
})
.catch((error) => {
  console.error('❌ Error conectando a MongoDB Atlas:', error);
});

// Importar rutas de autenticación
const { router: authRouter } = require('./routes/auth');

// Rutas públicas
app.use('/api/subscribers', require('./routes/subscribers'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/stories', require('./routes/stories'));

// Rutas de administración
app.use('/api/admin/auth', authRouter);
app.use('/api/admin/historias', require('./routes/historias'));

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Servidor backend funcionando correctamente', timestamp: new Date() });
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
