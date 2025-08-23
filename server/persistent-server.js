const http = require('http');
const url = require('url');

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
        resolve({});
      }
    });
    req.on('error', () => {
      resolve({});
    });
  });
}

// Función para enviar respuesta JSON
function sendJSON(res, statusCode, data) {
  try {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    });
    res.end(JSON.stringify(data));
  } catch (error) {
    console.error('💥 Error enviando respuesta:', error.message);
  }
}

const server = http.createServer(async (req, res) => {
  try {
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
    
    // Ruta de prueba
    if (method === 'GET' && pathname === '/api/test') {
      console.log('✅ Ruta /api/test accedida');
      sendJSON(res, 200, {
        message: '✅ Servidor persistente funcionando correctamente',
        timestamp: new Date().toISOString(),
        method: method,
        url: pathname,
        port: 3008,
        uptime: process.uptime()
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
          sendJSON(res, 401, { error: 'Credenciales inválidas' });
          return;
        }
        
      } catch (error) {
        console.error('💥 Error parseando body:', error.message);
        sendJSON(res, 400, { error: 'Error parseando datos' });
        return;
      }
    }
    
    // Ruta 404
    console.log('❓ Ruta no encontrada:', method, pathname);
    sendJSON(res, 404, {
      error: 'Ruta no encontrada',
      method: method,
      url: pathname
    });
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
    try {
      sendJSON(res, 500, {
        error: 'Error interno del servidor'
      });
    } catch (sendError) {
      console.error('💥 Error enviando respuesta de error:', sendError.message);
    }
  }
});

const PORT = 3008;

server.on('error', (error) => {
  console.error('💥 Error del servidor:', error.message);
});

server.listen(PORT, '127.0.0.1', () => {
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
