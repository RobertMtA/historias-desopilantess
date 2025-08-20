const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware básico
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ruta de prueba
app.get('/api/test', (req, res) => {
  console.log('Petición recibida en /api/test');
  res.json({ 
    message: '✅ Servidor backend funcionando correctamente', 
    timestamp: new Date(),
    cors: 'enabled'
  });
});

// Ruta de login simple para probar
app.post('/api/admin/auth/login', (req, res) => {
  console.log('🔐 Petición de login recibida:', req.body);
  console.log('📧 Email recibido:', req.body.email);
  console.log('🔑 Password recibido:', req.body.password ? '***' : 'NO PASSWORD');
  
  const { email, password } = req.body;
  
  // Credenciales de prueba
  if (email === 'robertogaona1985@gmail.com' && password === 'admin123') {
    console.log('✅ Credenciales correctas, enviando respuesta exitosa');
    res.json({
      message: 'Login exitoso',
      token: 'fake-jwt-token-for-testing',
      admin: {
        id: '1',
        email: 'robertogaona1985@gmail.com',
        nombre: 'Admin',
        rol: 'superadmin'
      }
    });
  } else {
    console.log('❌ Credenciales incorrectas');
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

// Manejo de errores
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Ruta 404
app.use('*', (req, res) => {
  console.log('Ruta no encontrada:', req.originalUrl);
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = 3005;

app.listen(PORT, '127.0.0.1', (err) => {
  if (err) {
    console.error('Error al iniciar servidor:', err);
    return;
  }
  console.log(`🚀 Servidor de prueba ejecutándose en puerto ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`🔐 Login URL: http://localhost:${PORT}/api/admin/auth/login`);
});

module.exports = app;
