const express = require('express');
const cors = require('cors');
const app = express();

// Middleware básico con manejo de errores
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  console.log('✅ Ruta /api/test accedida');
  res.json({ 
    message: '✅ Servidor backend funcionando correctamente', 
    timestamp: new Date(),
    cors: 'enabled',
    port: 3005
  });
});

// Ruta de login
app.post('/api/admin/auth/login', async (req, res) => {
  try {
    console.log('🔐 POST /api/admin/auth/login - Iniciando proceso');
    console.log('📧 Body recibido:', req.body);
    
    const { email, password } = req.body;
    
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password ? '***presente***' : '***ausente***');
    
    // Validar que tenemos los datos
    if (!email || !password) {
      console.log('❌ Faltan email o password');
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }
    
    // Credenciales de prueba
    if (email === 'robertogaona1985@gmail.com' && password === 'admin123') {
      console.log('✅ Credenciales correctas - Login exitoso');
      const response = {
        message: 'Login exitoso',
        token: 'fake-jwt-token-for-testing-' + Date.now(),
        admin: {
          id: '1',
          email: 'robertogaona1985@gmail.com',
          nombre: 'Roberto Gaona',
          rol: 'superadmin'
        }
      };
      
      console.log('📤 Enviando respuesta exitosa');
      return res.status(200).json(response);
    } else {
      console.log('❌ Credenciales incorrectas');
      console.log('❌ Email esperado: robertogaona1985@gmail.com, recibido:', email);
      console.log('❌ Password esperado: admin123, recibido:', password);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
  } catch (error) {
    console.error('💥 Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('💥 Error global:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor', 
    message: error.message 
  });
});

// Ruta 404
app.use('*', (req, res) => {
  console.log('❓ Ruta no encontrada:', req.method, req.originalUrl);
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    method: req.method,
    url: req.originalUrl,
    availableRoutes: [
      'GET /api/test',
      'POST /api/admin/auth/login'
    ]
  });
});

const PORT = 3005;

// Manejo de proceso
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT (Ctrl+C), cerrando servidor...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Promesa rechazada no manejada:', reason);
  process.exit(1);
});

const server = app.listen(PORT, '127.0.0.1', (err) => {
  if (err) {
    console.error('💥 Error al iniciar servidor:', err);
    process.exit(1);
  }
  console.log('🚀 Servidor ejecutándose en puerto', PORT);
  console.log('🔗 API Test: http://localhost:' + PORT + '/api/test');
  console.log('🔐 API Login: http://localhost:' + PORT + '/api/admin/auth/login');
  console.log('⚡ Servidor listo para recibir peticiones');
});

server.on('error', (error) => {
  console.error('💥 Error del servidor:', error);
  process.exit(1);
});

module.exports = app;
