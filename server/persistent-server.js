const http = require('http');
const express = require('express');
const path = require('path');
const cors = require('cors');
const storiesRoutes = require('./routes/stories');

console.log('🔧 Configurando servidor persistente...');

// Configurar process para evitar cierre inesperado
process.stdin.resume();
process.on('exit', () => console.log('🛑 Proceso terminando...'));
process.on('SIGINT', () => {
  console.log('🛑 Ctrl+C detectado, cerrando servidor...');
  process.exit(0);
});
process.on('uncaughtException', (error) => {
  console.error('💥 Excepción no capturada:', error.message);
  console.log('🔄 Continuando servidor...');
});

const app = express();
const PORT = 3008;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Rutas de la API
app.use('/api/stories', storiesRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
  console.log('✅ Ruta /api/test accedida');
  res.status(200).json({
    message: '✅ Servidor persistente funcionando correctamente',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    port: PORT,
    uptime: process.uptime()
  });
});

// Ruta de login (ejemplo, se puede mover a un archivo de rutas)
app.post('/api/admin/auth/login', async (req, res) => {
  console.log('🔐 POST /api/admin/auth/login - Iniciando proceso');
  
  try {
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
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
  } catch (error) {
    console.error('💥 Error parseando body:', error.message);
    return res.status(400).json({ error: 'Error parseando datos' });
  }
});

// Ruta 404 - Manejador de errores para rutas no encontradas
app.use((req, res) => {
  console.log('❓ Ruta no encontrada:', req.method, req.originalUrl);
  res.status(404).json({
    error: 'Ruta no encontrada',
    method: req.method,
    url: req.originalUrl
  });
});

// Manejador de errores general
app.use((err, req, res, next) => {
  console.error('💥 Error general:', err.message);
  res.status(500).json({
    error: 'Error interno del servidor',
    details: err.message
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log('🚀 Servidor persistente ejecutándose en puerto', PORT);
  console.log('🔗 API Test: http://localhost:' + PORT + '/api/test');
  console.log('🔐 API Login: http://localhost:' + PORT + '/api/admin/auth/login');
  console.log('⚡ Servidor listo para recibir peticiones');
  console.log('🔄 Configurado para mantenerse activo');
});

// Mantener el proceso activo
setInterval(() => {
  // No hacer nada, solo mantener el proceso vivo
}, 5000);
