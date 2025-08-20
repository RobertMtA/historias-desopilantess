const http = require('http');
const url = require('url');

// Función para parsear JSON del body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Función para enviar respuesta JSON
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;
  
  console.log(`${new Date().toISOString()} - ${method} ${pathname}`);
  
  // Manejo de CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    });
    res.end();
    return;
  }
  
  try {
    // Ruta de prueba
    if (method === 'GET' && pathname === '/api/test') {
      console.log('✅ Ruta /api/test accedida');
      sendJSON(res, 200, {
        message: '✅ Servidor HTTP nativo funcionando correctamente',
        timestamp: new Date(),
        method: method,
        url: pathname,
        port: 3006
      });
      return;
    }
    
    // Ruta de login
    if (method === 'POST' && pathname === '/api/admin/auth/login') {
      console.log('🔐 POST /api/admin/auth/login - Iniciando proceso');
      
      try {
        const body = await parseBody(req);
        console.log('📧 Body recibido:', body);
        
        const { email, password } = body;
        
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password ? '***presente***' : '***ausente***');
        
        // Validar que tenemos los datos
        if (!email || !password) {
          console.log('❌ Faltan email o password');
          sendJSON(res, 400, { error: 'Email y contraseña son requeridos' });
          return;
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
          sendJSON(res, 200, response);
          return;
        } else {
          console.log('❌ Credenciales incorrectas');
          console.log('❌ Email esperado: robertogaona1985@gmail.com, recibido:', email);
          console.log('❌ Password esperado: admin123, recibido:', password);
          sendJSON(res, 401, { error: 'Credenciales inválidas' });
          return;
        }
        
      } catch (error) {
        console.error('💥 Error parseando body:', error);
        sendJSON(res, 400, { error: 'Error parseando datos' });
        return;
      }
    }
    
    // Ruta 404
    console.log('❓ Ruta no encontrada:', method, pathname);
    sendJSON(res, 404, {
      error: 'Ruta no encontrada',
      method: method,
      url: pathname,
      availableRoutes: [
        'GET /api/test',
        'POST /api/admin/auth/login'
      ]
    });
    
  } catch (error) {
    console.error('💥 Error general:', error);
    sendJSON(res, 500, {
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

const PORT = 3006;

server.listen(PORT, '127.0.0.1', () => {
  console.log('🚀 Servidor HTTP nativo ejecutándose en puerto', PORT);
  console.log('🔗 API Test: http://localhost:' + PORT + '/api/test');
  console.log('🔐 API Login: http://localhost:' + PORT + '/api/admin/auth/login');
  console.log('⚡ Servidor listo para recibir peticiones');
});

server.on('error', (error) => {
  console.error('💥 Error del servidor:', error);
});

process.on('SIGINT', () => {
  console.log('🛑 Cerrando servidor...');
  server.close(() => {
    process.exit(0);
  });
});
