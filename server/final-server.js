const http = require('http');

console.log('🚀 INICIANDO SERVIDOR DEFINITIVO - Puerto 3009');

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method === 'GET' && req.url.startsWith('/api/test')) {
    console.log('✅ API TEST - Respondiendo');
    res.writeHead(200);
    res.end(JSON.stringify({
      message: '✅ Servidor definitivo funcionando',
      port: 3009,
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  if (req.method === 'POST' && req.url === '/api/admin/auth/login') {
    console.log('🔐 LOGIN REQUEST - Procesando');
    
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('📧 Email recibido:', data.email);
        console.log('🔑 Password recibido:', data.password ? 'SÍ' : 'NO');
        
        if (data.email === 'robertogaona1985@gmail.com' && data.password === 'admin123') {
          console.log('✅ LOGIN EXITOSO');
          res.writeHead(200);
          res.end(JSON.stringify({
            message: 'Login exitoso',
            token: 'jwt-token-' + Date.now(),
            admin: {
              id: '1',
              email: 'robertogaona1985@gmail.com',
              nombre: 'Roberto Gaona',
              rol: 'superadmin'
            }
          }));
        } else {
          console.log('❌ CREDENCIALES INCORRECTAS');
          res.writeHead(401);
          res.end(JSON.stringify({ error: 'Credenciales inválidas' }));
        }
      } catch (error) {
        console.log('💥 ERROR PARSING:', error.message);
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Error en datos' }));
      }
    });
    
    req.on('error', (error) => {
      console.log('💥 ERROR EN REQUEST:', error.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Error interno' }));
    });
    
    return;
  }
  
  console.log('❓ Ruta no encontrada:', req.method, req.url);
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
});

server.on('error', (error) => {
  console.error('💥 SERVER ERROR:', error.message);
});

server.listen(3009, '127.0.0.1', () => {
  console.log('🚀 SERVIDOR EJECUTÁNDOSE EN PUERTO 3009');
  console.log('🔗 Test: http://localhost:3009/api/test');
  console.log('🔐 Login: http://localhost:3009/api/admin/auth/login');
  console.log('⚡ LISTO PARA PETICIONES');
});

// Mantener proceso activo
const keepAlive = setInterval(() => {
  console.log(`⏰ ${new Date().toLocaleTimeString()} - Servidor activo`);
}, 30000);

process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  clearInterval(keepAlive);
  server.close();
  process.exit(0);
});
