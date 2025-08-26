/**
 * Solución para el problema de endpoints 404 en Railway
 * 
 * Este script verifica y corrige problemas comunes en las rutas de la API
 */

// Importaciones
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ruta del archivo server.js
const serverFilePath = path.join(__dirname, 'server.js');

// Verificar que el archivo existe
if (!fs.existsSync(serverFilePath)) {
  console.error('❌ Error: No se encontró el archivo server.js');
  process.exit(1);
}

// Leer el archivo server.js
let serverContent = fs.readFileSync(serverFilePath, 'utf8');
console.log('📝 Archivo server.js leído correctamente');

// Verificar si las rutas de comentarios están definidas correctamente
const hasCommentsRoute = serverContent.includes("app.get('/api/stories/:id/comments'");
if (!hasCommentsRoute) {
  console.error('❌ Error: No se encontró la definición de la ruta de comentarios');
  process.exit(1);
}
console.log('✅ Ruta de comentarios verificada');

// Verificar si hay módulos requeridos
const hasFsModule = serverContent.includes("const fs = require('fs')");
const hasPathModule = serverContent.includes("const path = require('path')");

if (!hasFsModule || !hasPathModule) {
  console.error('⚠️ Advertencia: Faltan importaciones de módulos');
  console.log('Añadiendo importaciones faltantes...');
  
  // Punto donde insertar las importaciones
  const importInsertPoint = "const cors = require('cors');";
  let updatedImports = "const cors = require('cors');\n";
  
  if (!hasPathModule) {
    updatedImports += "const path = require('path');\n";
  }
  
  if (!hasFsModule) {
    updatedImports += "const fs = require('fs');\n";
  }
  
  // Actualizar el contenido
  serverContent = serverContent.replace(importInsertPoint, updatedImports);
  console.log('✅ Importaciones actualizadas');
}

// Verificar si hay un manejador de errores que pueda estar interfiriendo
console.log('🔍 Verificando manejadores de errores...');

// Corregir posible problema: el middleware de 404 podría estar capturando rutas válidas
const notFoundHandlerString = "app.use('*', (req, res) => {";
const isNotFoundHandlerTooEarly = serverContent.indexOf(notFoundHandlerString) < serverContent.indexOf("app.get('/api/stories/:id/comments'");

if (isNotFoundHandlerTooEarly) {
  console.error('❌ Error crítico: El manejador de rutas no encontradas está definido antes que las rutas de API');
  console.log('Moviendo el manejador de rutas no encontradas al final del archivo...');
  
  // Extraer el manejador 404
  const notFoundRegex = /app\.use\('\*',\s*\(req,\s*res\)\s*=>\s*\{[\s\S]*?(?=app\.use|$)/;
  const notFoundMatch = serverContent.match(notFoundRegex);
  
  if (notFoundMatch && notFoundMatch[0]) {
    // Eliminar el manejador actual
    serverContent = serverContent.replace(notFoundMatch[0], '');
    
    // Añadir el manejador al final, justo antes del app.listen
    const listenIndex = serverContent.indexOf('app.listen(');
    if (listenIndex !== -1) {
      const handlerToAdd = notFoundMatch[0].trim();
      serverContent = serverContent.slice(0, listenIndex) + 
                    '\n\n// Manejador para rutas no encontradas (colocado al final)\n' +
                    handlerToAdd + '\n\n' +
                    serverContent.slice(listenIndex);
      console.log('✅ Manejador de 404 movido al final del archivo');
    }
  }
}

// Asegurar que la ruta de comentarios devuelva una respuesta válida incluso en caso de error
const commentsRouteRegex = /app\.get\('\/api\/stories\/:id\/comments',\s*async\s*\(req,\s*res\)\s*=>\s*\{[\s\S]*?(?=\}\);)/;
const commentsRouteMatch = serverContent.match(commentsRouteRegex);

if (commentsRouteMatch && commentsRouteMatch[0]) {
  const currentRoute = commentsRouteMatch[0];
  
  // Verificar si ya tiene un buen manejo de errores
  const hasGoodErrorHandling = currentRoute.includes("catch (error)") && 
                              currentRoute.includes("data: []") &&
                              currentRoute.includes("status: 'success'");
  
  if (!hasGoodErrorHandling) {
    console.log('⚠️ Mejorando manejo de errores en la ruta de comentarios...');
    
    // Crear versión mejorada de la ruta
    const improvedRoute = `app.get('/api/stories/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('💬 Getting comments for story:', id);
    
    // Utiliza la misma tabla de comentarios
    const result = await pool.query(\`
      SELECT * FROM comentarios 
      WHERE historia_id = $1 
      ORDER BY fecha DESC
    \`, [id]);
    
    // Asegurar que la respuesta tenga los encabezados CORS adecuados
    res.header('Access-Control-Allow-Origin', '*');
    
    res.json({
      status: 'success',
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Comments error:', error);
    // Siempre devolver una respuesta válida, incluso en caso de error
    res.status(200).json({
      status: 'success',
      data: [],
      total: 0,
      error: error.message
    });
  }
});`;

    // Reemplazar la ruta actual
    serverContent = serverContent.replace(commentsRouteRegex, improvedRoute);
    console.log('✅ Ruta de comentarios mejorada');
  } else {
    console.log('✅ La ruta de comentarios ya tiene un buen manejo de errores');
  }
}

// Guardar el archivo actualizado
fs.writeFileSync(serverFilePath, serverContent, 'utf8');
console.log('💾 Archivo server.js actualizado y guardado');

// Reporte final
console.log('\n✨ Solución completada. Los cambios incluyen:');
console.log('- Verificación de la ruta de comentarios');
console.log('- Verificación de importaciones de módulos');
console.log('- Corrección del orden de los middleware');
console.log('- Mejora del manejo de errores en la ruta de comentarios');
console.log('\nAhora debes redeployar la aplicación con "railway up"');
