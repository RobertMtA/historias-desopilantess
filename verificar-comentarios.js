// Verificador de Comentarios de Historias
// Este script prueba la funcionalidad de comentarios en todas las historias

require('dotenv').config();
const axios = require('axios');
const colors = require('colors/safe');

// URL base del servidor (por defecto apunta a Railway)
const BASE_URL = process.env.API_URL || 'https://historias-desopilantes-production.up.railway.app';

// Función para verificar un endpoint
async function testEndpoint(method, url, data = null) {
  console.log(colors.cyan(`Testing ${method} ${url}`));
  
  try {
    const config = {
      method,
      url,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 500,
      error: error.message,
      details: error.response?.data || {}
    };
  }
}

// Función principal
async function main() {
  console.log(colors.green('=== VERIFICADOR DE COMENTARIOS EN HISTORIAS ==='));
  console.log(colors.yellow(`Servidor: ${BASE_URL}`));
  
  try {
    // 1. Obtener todas las historias
    console.log(colors.cyan('\n1. Obteniendo todas las historias...'));
    const historiesResult = await testEndpoint('GET', `${BASE_URL}/api/historias`);
    
    if (!historiesResult.success) {
      console.log(colors.red(`Error al obtener historias: ${historiesResult.error}`));
      return;
    }
    
    const historias = historiesResult.data;
    console.log(colors.green(`✅ Se encontraron ${historias.length} historias`));
    
    // 2. Verificar los comentarios para cada historia
    console.log(colors.cyan('\n2. Verificando comentarios para cada historia...'));
    
    let totalComentarios = 0;
    let historiasConComentarios = 0;
    
    for (const historia of historias) {
      process.stdout.write(colors.yellow(`   Historia ID ${historia.id}: `));
      
      const comentariosResult = await testEndpoint('GET', `${BASE_URL}/api/historias/${historia.id}/comentarios`);
      
      if (!comentariosResult.success) {
        console.log(colors.red(`Error: ${comentariosResult.error}`));
        continue;
      }
      
      const comentarios = comentariosResult.data.comentarios || [];
      if (comentarios.length > 0) {
        console.log(colors.green(`${comentarios.length} comentarios`));
        totalComentarios += comentarios.length;
        historiasConComentarios++;
      } else {
        console.log(colors.yellow('Sin comentarios'));
      }
    }
    
    // 3. Mostrar resumen
    console.log(colors.cyan('\n3. Resumen:'));
    console.log(colors.green(`   - Total de historias: ${historias.length}`));
    console.log(colors.green(`   - Historias con comentarios: ${historiasConComentarios}`));
    console.log(colors.green(`   - Total de comentarios: ${totalComentarios}`));
    
    // 4. Probar la creación de un comentario
    console.log(colors.cyan('\n4. Probando crear un comentario...'));
    
    if (historias.length > 0) {
      const primeraHistoria = historias[0];
      const comentarioData = {
        nombre: 'Prueba Automatizada',
        comentario: 'Este es un comentario de prueba creado el ' + new Date().toLocaleString()
      };
      
      const crearComentarioResult = await testEndpoint(
        'POST', 
        `${BASE_URL}/api/historias/${primeraHistoria.id}/comentarios`,
        comentarioData
      );
      
      if (crearComentarioResult.success) {
        console.log(colors.green('✅ Comentario creado exitosamente:'));
        console.log(colors.green(JSON.stringify(crearComentarioResult.data, null, 2)));
      } else {
        console.log(colors.red(`❌ Error al crear comentario: ${crearComentarioResult.error}`));
        console.log(colors.red(JSON.stringify(crearComentarioResult.details, null, 2)));
      }
    }
    
    console.log(colors.green('\n=== VERIFICACIÓN COMPLETADA ==='));
    
  } catch (error) {
    console.log(colors.red(`\n❌ Error general: ${error.message}`));
  }
}

// Ejecutar el script
main().catch(error => {
  console.error(colors.red(`Error fatal: ${error.message}`));
  process.exit(1);
});
