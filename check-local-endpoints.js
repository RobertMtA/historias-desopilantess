const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:4000';
const ENDPOINTS_TO_CHECK = [
  { method: 'GET', path: '/api/test' },
  { method: 'GET', path: '/api/stories/1/likes' },
  { method: 'GET', path: '/api/stories/1/comments' },
  { method: 'POST', path: '/api/stories/1/likes', data: {} }
];

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Función para probar un endpoint
async function testEndpoint(method, path, data = null) {
  const url = \\\\;
  console.log(\\Probando \ \\\);
  
  try {
    const config = {
      method,
      url,
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    };
    
    if (data && (method.toLowerCase() === 'post' || method.toLowerCase() === 'put')) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    console.log(\\✓ \ \ - \ \\\);
    console.log(JSON.stringify(response.data, null, 2));
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    const statusCode = error.response?.status || 'Sin respuesta';
    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
    
    console.log(\\✗ \ \ - \: \\\);
    return { success: false, status: statusCode, error: errorMessage };
  }
}

// Función principal para ejecutar todas las pruebas
async function checkEndpoints() {
  console.log(\\n\=== VERIFICANDO ENDPOINTS EN \ ===\n\\);
  
  for (const endpoint of ENDPOINTS_TO_CHECK) {
    await testEndpoint(endpoint.method, endpoint.path, endpoint.data);
    console.log(); // Separador
  }
  
  console.log(\\n\=== VERIFICACIÓN COMPLETADA ===\n\\);
}

// Ejecutar pruebas
checkEndpoints().catch(error => {
  console.error(\\Error ejecutando pruebas:\\, error);
});
