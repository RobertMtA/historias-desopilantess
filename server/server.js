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

// Middleware de autenticación para rutas de admin
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const jwt = require('jsonwebtoken');
    const Admin = require('./models/Admin');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'historias-desopilantes-secret-key');
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin || !admin.activo) {
      return res.status(401).json({ error: 'Token inválido o usuario inactivo' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

app.use('/api/admin/historias', adminAuth, require('./routes/historias'));
app.use('/api/admin/comments', adminAuth, require('./routes/comments'));

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
