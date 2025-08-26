/**
 * Script para probar todos los endpoints de la API de Historias Desopilantes
 * Este script verifica que todos los endpoints estén funcionando correctamente
 */

const axios = require('axios');

// Configuración
const API_URL = process.env.API_URL || 'http://localhost:3009';
const TEST_HISTORIA_ID = 1;

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
  const url = `${API_URL}${path}`;
  console.log(`${colors.blue}Probando ${method} ${path}${colors.reset}`);
  
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
    
    console.log(`${colors.green}✓ ${method} ${path} - ${response.status} ${response.statusText}${colors.reset}`);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    const statusCode = error.response?.status || 'Sin respuesta';
    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
    
    console.log(`${colors.red}✗ ${method} ${path} - ${statusCode}: ${errorMessage}${colors.reset}`);
    return { success: false, status: statusCode, error: errorMessage };
  }
}

// Función principal para ejecutar todas las pruebas
async function runTests() {
  console.log(`\n${colors.yellow}=== PRUEBA DE ENDPOINTS DE HISTORIAS DESOPILANTES API ===\n${colors.reset}`);
  
  // Test de salud
  await testEndpoint('GET', '/health');
  await testEndpoint('GET', '/api/test');
  
  // Endpoints de historias (español)
  await testEndpoint('GET', '/api/historias');
  await testEndpoint('GET', `/api/historias/${TEST_HISTORIA_ID}`);
  
  // Endpoints de historias (inglés)
  await testEndpoint('GET', '/api/stories');
  await testEndpoint('GET', `/api/stories/${TEST_HISTORIA_ID}`);
  
  // Endpoints de comentarios (español)
  await testEndpoint('GET', `/api/historias/${TEST_HISTORIA_ID}/comentarios`);
  const comentarioData = { autor: 'Test User', contenido: 'Comentario de prueba desde test-endpoints.js' };
  await testEndpoint('POST', `/api/historias/${TEST_HISTORIA_ID}/comentarios`, comentarioData);
  
  // Endpoints de comentarios (inglés)
  await testEndpoint('GET', `/api/stories/${TEST_HISTORIA_ID}/comments`);
  const commentData = { autor: 'Test User', contenido: 'Test comment from test-endpoints.js' };
  await testEndpoint('POST', `/api/stories/${TEST_HISTORIA_ID}/comments`, commentData);
  
  // Endpoints de likes (español)
  await testEndpoint('GET', `/api/historias/${TEST_HISTORIA_ID}/likes`);
  await testEndpoint('POST', `/api/historias/${TEST_HISTORIA_ID}/likes`);
  await testEndpoint('POST', `/api/historias/${TEST_HISTORIA_ID}/like`);
  
  // Endpoints de likes (inglés)
  await testEndpoint('GET', `/api/stories/${TEST_HISTORIA_ID}/likes`);
  await testEndpoint('POST', `/api/stories/${TEST_HISTORIA_ID}/likes`);
  await testEndpoint('POST', `/api/stories/${TEST_HISTORIA_ID}/like`);
  
  // Endpoint de contacto
  const contactData = { nombre: 'Test User', email: 'test@example.com', mensaje: 'Mensaje de prueba desde test-endpoints.js' };
  await testEndpoint('POST', '/api/contact', contactData);
  
  console.log(`\n${colors.yellow}=== PRUEBAS COMPLETADAS ===\n${colors.reset}`);
}

// Ejecutar pruebas
runTests().catch(error => {
  console.error(`${colors.red}Error ejecutando pruebas:${colors.reset}`, error);
});
