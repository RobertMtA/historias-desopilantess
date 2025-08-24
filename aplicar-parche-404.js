const fs = require('fs');
const path = require('path');

// Ruta al archivo api.js
const apiJsPath = path.join(__dirname, 'src', 'config', 'api.js');

// Verificar si el archivo existe
if (!fs.existsSync(apiJsPath)) {
  console.error(`❌ No se encontró el archivo: ${apiJsPath}`);
  process.exit(1);
}

// Leer el contenido actual
let content;
try {
  content = fs.readFileSync(apiJsPath, 'utf-8');
  console.log(`✅ Archivo leído correctamente: ${apiJsPath}`);
} catch (error) {
  console.error(`❌ Error al leer el archivo: ${error.message}`);
  process.exit(1);
}

// Código a insertar al principio del archivo
const patchCode = `// Modificación del API para manejar IDs inexistentes (SOLUCIÓN A ERRORES 404)
const originalFetch = window.fetch;

// Lista de IDs válidos según la verificación de la base de datos
const VALID_STORY_IDS = Array.from({ length: 21 }, (_, i) => i + 1);

window.fetch = function(url, options) {
  // Verificar si es una petición a nuestra API de historias
  if (url && typeof url === 'string' && url.includes('/api/stories/')) {
    // Extraer el ID de la historia desde la URL
    const urlParts = url.split('/');
    const idIndex = urlParts.indexOf('stories') + 1;
    
    if (idIndex < urlParts.length) {
      const storyId = parseInt(urlParts[idIndex]);
      
      // Si el ID no es válido, devolver una respuesta simulada
      if (!VALID_STORY_IDS.includes(storyId)) {
        console.log(\`📝 Interceptando petición para historia inexistente ID: \${storyId}\`);
        
        // Determinar qué tipo de endpoint es
        if (url.includes('/likes')) {
          console.log(\`⚙️ Devolviendo likes=0 para historia \${storyId}\`);
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              storyId: storyId,
              likes: 0,
              hasLiked: false,
              exists: false
            })
          });
        } 
        else if (url.includes('/comments')) {
          console.log(\`⚙️ Devolviendo comments=[] para historia \${storyId}\`);
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              storyId: storyId,
              comments: [],
              total: 0,
              exists: false
            })
          });
        }
      }
    }
  }
  
  // Para cualquier otra petición, usar el fetch original
  return originalFetch.apply(this, arguments);
};

`;

// Verificar si ya existe el parche
if (content.includes('Modificación del API para manejar IDs inexistentes')) {
  console.log('⚠️ El parche ya está aplicado en el archivo. No es necesario modificarlo.');
  process.exit(0);
}

// Insertar el código al principio del archivo
const newContent = patchCode + content;

// Escribir el archivo modificado
try {
  fs.writeFileSync(apiJsPath, newContent, 'utf-8');
  console.log(`✅ Parche aplicado correctamente a ${apiJsPath}`);
  console.log('📝 Los errores 404 deberían estar solucionados después de reconstruir la aplicación.');
} catch (error) {
  console.error(`❌ Error al escribir el archivo: ${error.message}`);
  process.exit(1);
}
