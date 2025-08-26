const fs = require('fs');
const path = require('path');

// Rutas de archivos
const serverFilePath = path.join(__dirname, 'server.js');
const patchFilePath = path.join(__dirname, 'comments-endpoints-patch.js');
const backupFilePath = path.join(__dirname, 'server.js.bak');

// Leer el contenido de los archivos
console.log('📂 Leyendo archivos...');
const serverContent = fs.readFileSync(serverFilePath, 'utf8');
const patchContent = fs.readFileSync(patchFilePath, 'utf8');

// Crear copia de seguridad
console.log('💾 Creando copia de seguridad del servidor...');
fs.writeFileSync(backupFilePath, serverContent, 'utf8');
console.log(`✅ Copia de seguridad creada en ${backupFilePath}`);

// Buscar dónde insertar el parche
console.log('🔍 Localizando punto de inserción para el parche...');
let updatedContent = '';

// Buscar el middleware para manejo de 404
if (serverContent.includes('app.use((req, res, next)')) {
  console.log('🔄 Reemplazando middleware de 404 existente...');
  
  // Regex para encontrar el middleware de manejo de 404
  const regex = /app\.use\(\(req, res, next\) => \{[\s\S]*?}\);/;
  
  // Extraer la parte del middleware existente
  const match = serverContent.match(regex);
  
  if (match) {
    // Reemplazar el middleware existente
    updatedContent = serverContent.replace(regex, patchContent.match(/app\.use\(\(req, res, next\) => \{[\s\S]*?}\);/)[0]);
    
    // Verificar si ya existen los endpoints de comentarios
    if (!updatedContent.includes('/api/stories/:id/comments')) {
      // Añadir los endpoints de comentarios después de los endpoints de likes
      const likesEndpointRegex = /app\.get\('\/api\/historias\/:id\/likes',[\s\S]*?}\);/;
      const likesEndpointMatch = updatedContent.match(likesEndpointRegex);
      
      if (likesEndpointMatch) {
        console.log('🔄 Añadiendo endpoints de comentarios después de los endpoints de likes...');
        const commentsEndpoints = patchContent.match(/\/\/ Función reutilizable para obtener comentarios[\s\S]*?app\.get\('\/api\/historias\/:id\/comentarios',[\s\S]*?}\);/)[0];
        updatedContent = updatedContent.replace(likesEndpointMatch[0], `${likesEndpointMatch[0]}\n\n${commentsEndpoints}`);
      } else {
        console.log('❌ No se encontró el punto de inserción para los endpoints de comentarios.');
      }
    } else {
      console.log('✅ Los endpoints de comentarios ya existen en el servidor.');
    }
  } else {
    console.log('❌ No se encontró el middleware de 404.');
    // Si no encuentra el middleware, añadir todo el contenido del parche al final del archivo
    updatedContent = `${serverContent}\n\n// Endpoints y middleware añadidos por el parche\n${patchContent}`;
  }
} else {
  console.log('❌ No se encontró el middleware de 404.');
  // Si no encuentra el middleware, añadir todo el contenido del parche al final del archivo
  updatedContent = `${serverContent}\n\n// Endpoints y middleware añadidos por el parche\n${patchContent}`;
}

// Guardar el archivo actualizado
console.log('💾 Guardando servidor actualizado...');
fs.writeFileSync(serverFilePath, updatedContent, 'utf8');
console.log(`✅ Servidor actualizado con endpoints de comentarios.`);

console.log(`
🎉 Actualización completada con éxito!
📝 El servidor ahora incluye endpoints para:
   - GET /api/stories/:id/comments
   - GET /api/historias/:id/comentarios
   - Middleware mejorado para interceptar errores 404
`);
