/**
 * DIAGNÓSTICO Y SOLUCIÓN PARA ENDPOINTS EN RAILWAY
 * 
 * Este script verifica directamente los endpoints en Railway y
 * confirma que estén funcionando correctamente.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// URL base de Railway
const RAILWAY_URL = 'historias-desopilantes-production.up.railway.app';

// Endpoints a verificar
const ENDPOINTS_TO_CHECK = [
  { path: '/', name: 'Root' },
  { path: '/health', name: 'Health Check' },
  { path: '/api/test', name: 'API Test' },
  { path: '/api/routes', name: 'API Routes' },
  { path: '/api/stories', name: 'Stories List' },
  { path: '/api/stories/1', name: 'Story Detail' },
  { path: '/api/stories/1/comments', name: 'Story Comments' },
  { path: '/api/stories/1/likes', name: 'Story Likes' },
];

// ANSI colors for console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Función para hacer una petición GET
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsedData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            error: 'Failed to parse JSON'
          });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Verificar si un endpoint está registrado en la lista de rutas
function isEndpointRegistered(routesData, endpoint) {
  if (!routesData || !routesData.routes) return false;
  
  return routesData.routes.some(route => {
    // Convertir parámetros dinámicos para comparación (ej: :id -> 1)
    const normalizedRoutePath = route.path.replace(/:id/g, '1');
    return normalizedRoutePath === endpoint;
  });
}

// Función principal para diagnosticar
async function diagnoseEndpoints() {
  console.log(`${colors.cyan}=======================================${colors.reset}`);
  console.log(`${colors.cyan}   Diagnóstico de API en Railway${colors.reset}`);
  console.log(`${colors.cyan}=======================================${colors.reset}\n`);
  
  console.log(`${colors.blue}🔍 Verificando endpoints en: ${RAILWAY_URL}${colors.reset}\n`);
  
  // Primero verificar el endpoint de rutas para tener la lista de rutas registradas
  let routesData = null;
  try {
    console.log(`${colors.yellow}Obteniendo lista de rutas disponibles...${colors.reset}`);
    const routesResponse = await makeRequest(`https://${RAILWAY_URL}/api/routes`);
    
    if (routesResponse.statusCode === 200) {
      routesData = routesResponse.body;
      console.log(`${colors.green}✅ Lista de rutas obtenida correctamente${colors.reset}`);
      
      // Mostrar rutas disponibles
      console.log(`${colors.yellow}Rutas registradas en el servidor:${colors.reset}`);
      routesData.routes.forEach(route => {
        console.log(`  - ${route.method} ${route.path}`);
      });
      console.log('');
    } else {
      console.log(`${colors.red}❌ Error al obtener lista de rutas: ${routesResponse.statusCode}${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Error al conectar con el endpoint de rutas: ${error.message}${colors.reset}`);
  }
  
  // Verificar cada endpoint
  console.log(`${colors.yellow}Verificando endpoints individuales...${colors.reset}`);
  
  let results = [];
  for (const endpoint of ENDPOINTS_TO_CHECK) {
    process.stdout.write(`  - ${endpoint.name} (${endpoint.path}): `);
    
    try {
      const response = await makeRequest(`https://${RAILWAY_URL}${endpoint.path}`);
      
      const isRegistered = isEndpointRegistered(routesData, endpoint.path);
      const isSuccess = response.statusCode >= 200 && response.statusCode < 300;
      
      if (isSuccess) {
        console.log(`${colors.green}✅ OK (${response.statusCode})${colors.reset}`);
        results.push({
          endpoint: endpoint.path,
          status: 'ok',
          statusCode: response.statusCode,
          isRegistered
        });
      } else {
        console.log(`${colors.red}❌ Error (${response.statusCode})${colors.reset}`);
        results.push({
          endpoint: endpoint.path,
          status: 'error',
          statusCode: response.statusCode,
          isRegistered
        });
      }
    } catch (error) {
      console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
      results.push({
        endpoint: endpoint.path,
        status: 'error',
        error: error.message,
        isRegistered: false
      });
    }
  }
  
  // Analizar los resultados
  console.log(`\n${colors.blue}📊 Resultados del diagnóstico:${colors.reset}`);
  
  const failedEndpoints = results.filter(r => r.status === 'error');
  const missingEndpoints = results.filter(r => !r.isRegistered);
  
  if (failedEndpoints.length === 0) {
    console.log(`${colors.green}✅ Todos los endpoints están funcionando correctamente${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Se encontraron ${failedEndpoints.length} endpoints con errores${colors.reset}`);
    failedEndpoints.forEach(endpoint => {
      console.log(`  - ${endpoint.endpoint}: ${endpoint.statusCode || endpoint.error}`);
    });
  }
  
  if (missingEndpoints.length > 0) {
    console.log(`${colors.yellow}⚠️ Se encontraron ${missingEndpoints.length} endpoints no registrados en la lista de rutas${colors.reset}`);
    missingEndpoints.forEach(endpoint => {
      console.log(`  - ${endpoint.endpoint}`);
    });
  }
  
  // Verificar servidor Railway
  console.log(`\n${colors.blue}🔧 Verificando servidor Railway:${colors.reset}`);
  const serverPath = path.join(__dirname, 'server.js');
  
  if (fs.existsSync(serverPath)) {
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Verificar si están definidas las rutas que fallan
    const routeChecks = {
      comments: serverContent.includes('/api/stories/:id/comments'),
      likes: serverContent.includes('/api/stories/:id/likes'),
      like: serverContent.includes('/api/stories/:id/like'),
      modules: serverContent.includes('const fs = require(\'fs\')') && serverContent.includes('const path = require(\'path\')'),
      catchAll: serverContent.includes('app.use(\'*\'')
    };
    
    console.log(`  - Ruta de comentarios: ${routeChecks.comments ? colors.green + '✓ Definida' : colors.red + '✗ No definida'}${colors.reset}`);
    console.log(`  - Ruta de likes: ${routeChecks.likes ? colors.green + '✓ Definida' : colors.red + '✗ No definida'}${colors.reset}`);
    console.log(`  - Ruta de like (singular): ${routeChecks.like ? colors.green + '✓ Definida' : colors.red + '✗ No definida'}${colors.reset}`);
    console.log(`  - Módulos path y fs: ${routeChecks.modules ? colors.green + '✓ Importados' : colors.red + '✗ No importados'}${colors.reset}`);
    console.log(`  - Middleware catch-all: ${routeChecks.catchAll ? colors.green + '✓ Definido' : colors.red + '✗ No definido'}${colors.reset}`);
    
    if (!routeChecks.modules) {
      console.log(`\n${colors.red}❌ Los módulos path y fs no están importados correctamente${colors.reset}`);
      console.log(`${colors.yellow}📝 Ejecuta el script de solución de endpoints 404${colors.reset}`);
    }
    
    if (!routeChecks.comments || !routeChecks.likes || !routeChecks.like) {
      console.log(`\n${colors.red}❌ Faltan definiciones de rutas importantes${colors.reset}`);
      console.log(`${colors.yellow}📝 Ejecuta el script de solución de endpoints 404${colors.reset}`);
    }
    
    // Verificar posición del middleware catch-all
    if (routeChecks.catchAll) {
      const catchAllPos = serverContent.indexOf('app.use(\'*\'');
      const commentsPos = serverContent.indexOf('/api/stories/:id/comments');
      
      if (commentsPos > catchAllPos && catchAllPos !== -1 && commentsPos !== -1) {
        console.log(`\n${colors.red}❌ PROBLEMA CRÍTICO: El middleware catch-all está definido antes que algunas rutas${colors.reset}`);
        console.log(`${colors.yellow}📝 Ejecuta el script de solución de endpoints 404${colors.reset}`);
      }
    }
  } else {
    console.log(`${colors.red}❌ No se encontró el archivo server.js${colors.reset}`);
  }
  
  // Recomendaciones finales
  console.log(`\n${colors.cyan}=======================================${colors.reset}`);
  console.log(`${colors.cyan}   Recomendaciones${colors.reset}`);
  console.log(`${colors.cyan}=======================================${colors.reset}`);
  
  if (failedEndpoints.length > 0 || missingEndpoints.length > 0) {
    console.log(`
1. ${colors.yellow}Ejecuta el script de solución de endpoints 404:${colors.reset}
   node solucionar-endpoints-404.js
   
2. ${colors.yellow}Despliega nuevamente a Railway:${colors.reset}
   railway up
   
3. ${colors.yellow}Verifica que los cambios se hayan aplicado ejecutando este script nuevamente${colors.reset}
   
4. ${colors.yellow}Si sigues teniendo problemas, considera crear un nuevo servicio en Railway${colors.reset}`);
  } else {
    console.log(`
${colors.green}¡La API parece estar configurada correctamente!${colors.reset}

Si sigues teniendo problemas en el frontend, verifica:
1. La configuración de CORS en el servidor
2. La URL de API configurada en el frontend
3. La caché del navegador (prueba en modo incógnito)
4. Los Service Workers que podrían estar interceptando peticiones`);
  }
}

// Ejecutar diagnóstico
diagnoseEndpoints().catch(error => {
  console.error('Error inesperado:', error);
});
