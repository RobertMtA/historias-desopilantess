/**
 * Script para verificar el estado actual de la API desplegada
 * 
 * Este script se conecta a la API desplegada en Railway y verifica:
 * 1. Si la API está en línea y responde
 * 2. Qué endpoints están disponibles y funcionando
 * 3. El estado de la conexión a la base de datos
 */

const axios = require('axios');

// Configuración
// Reemplazar con URL de Railway cuando esté desplegado
const API_URL = process.env.API_URL || 'https://historias-desopilantes-react-production.up.railway.app';
const TIMEOUT = 8000; // 8 segundos de timeout para peticiones lentas

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Función para verificar un endpoint específico
 */
async function checkEndpoint(method, path) {
  try {
    console.log(`${colors.blue}Verificando ${method} ${path}...${colors.reset}`);
    
    const response = await axios({
      method,
      url: `${API_URL}${path}`,
      timeout: TIMEOUT,
      validateStatus: status => true // No rechazar por código de estado
    });
    
    const status = response.status;
    const statusText = response.statusText || '';
    
    // Colorear según estado
    let statusColor = colors.red;
    if (status >= 200 && status < 300) statusColor = colors.green;
    else if (status >= 300 && status < 400) statusColor = colors.yellow;
    else if (status >= 400 && status < 500) statusColor = colors.red;
    else if (status >= 500) statusColor = colors.red;
    
    console.log(`  ${statusColor}${status} ${statusText}${colors.reset}`);
    
    // Análisis adicional para respuestas 404
    if (status === 404) {
      console.log(`  ${colors.red}⚠️ El endpoint no está registrado o accesible${colors.reset}`);
    }
    
    return { path, method, status, ok: status >= 200 && status < 300 };
  } catch (error) {
    console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
    return { path, method, status: 'ERROR', error: error.message, ok: false };
  }
}

/**
 * Verificación completa del sistema
 */
async function checkApiStatus() {
  console.log(`\n${colors.magenta}=== VERIFICACIÓN DEL ESTADO DE LA API ===${colors.reset}`);
  console.log(`${colors.cyan}URL: ${API_URL}${colors.reset}\n`);
  
  // Verificar estado general del servidor
  console.log(`${colors.yellow}>> Verificando estado general de la API...${colors.reset}`);
  const healthCheck = await checkEndpoint('GET', '/health');
  
  // Si el healthcheck falla, terminamos la verificación
  if (!healthCheck.ok) {
    console.log(`\n${colors.red}❌ La API no está en línea o no responde correctamente.${colors.reset}`);
    console.log(`${colors.red}Verifique que la URL sea correcta y que el servicio esté ejecutándose.${colors.reset}\n`);
    return;
  }
  
  console.log(`\n${colors.yellow}>> Verificando endpoints principales...${colors.reset}`);
  // Verificar endpoints principales
  await checkEndpoint('GET', '/api/test');
  await checkEndpoint('GET', '/api/historias');
  await checkEndpoint('GET', '/api/stories');
  
  // Verificar endpoints de comentarios y likes (elegimos ID 1 como prueba)
  console.log(`\n${colors.yellow}>> Verificando endpoints de comentarios...${colors.reset}`);
  await checkEndpoint('GET', '/api/historias/1/comentarios');
  await checkEndpoint('GET', '/api/stories/1/comments');
  
  console.log(`\n${colors.yellow}>> Verificando endpoints de likes...${colors.reset}`);
  await checkEndpoint('GET', '/api/historias/1/likes');
  await checkEndpoint('GET', '/api/stories/1/likes');
  
  console.log(`\n${colors.magenta}=== VERIFICACIÓN COMPLETA ===\n${colors.reset}`);
  console.log(`Si algún endpoint muestra código 404, verificar que esté correctamente registrado en server.js`);
  console.log(`Si la API responde pero los datos no se guardan, verificar la conexión a la base de datos.\n`);
}

// Ejecutar verificación
checkApiStatus().catch(error => {
  console.error(`\n${colors.red}Error en la verificación:${colors.reset}`, error);
});
