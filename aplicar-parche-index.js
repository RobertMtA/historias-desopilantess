// Script para añadir el interceptor fetch al archivo index.html principal

const fs = require('fs');
const path = require('path');

// Ruta al archivo index.html principal
const indexPath = path.join(__dirname, 'index.html');

// Leer el archivo index.html
console.log(`📝 Leyendo archivo index.html...`);
let indexContent = '';
try {
  indexContent = fs.readFileSync(indexPath, 'utf8');
  console.log(`✅ Archivo leído correctamente`);
} catch (error) {
  console.error(`❌ Error al leer el archivo: ${error.message}`);
  process.exit(1);
}

// Comprobar si el parche ya está aplicado
if (indexContent.includes('VALID_STORY_IDS')) {
  console.log(`⚠️ El parche ya está aplicado al archivo index.html`);
  process.exit(0);
}

// Script del interceptor fetch para añadir
const interceptorScript = `
  <!-- Script para interceptar y manejar errores 404 de API -->
  <script>
    // Código para interceptar fetch y evitar errores 404 en api/stories
    (function() {
      const originalFetch = window.fetch;
      const VALID_STORY_IDS = Array.from({ length: 21 }, (_, i) => i + 1);
      
      window.fetch = function(url, options) {
        if (url && typeof url === 'string' && url.includes('/api/stories/')) {
          const urlParts = url.split('/');
          const idIndex = urlParts.indexOf('stories') + 1;
          
          if (idIndex < urlParts.length) {
            const storyId = parseInt(urlParts[idIndex]);
            
            if (!VALID_STORY_IDS.includes(storyId)) {
              console.log(\`📝 Interceptando petición para historia inexistente ID: \${storyId}\`);
              
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
        
        return originalFetch.apply(this, arguments);
      };
    })();
  </script>
`;

// Insertar el script justo antes de </head>
const newContent = indexContent.replace('</head>', `${interceptorScript}\n  </head>`);

// Guardar el archivo modificado
console.log(`📝 Aplicando parche al archivo index.html...`);
try {
  fs.writeFileSync(indexPath, newContent, 'utf8');
  console.log(`✅ Parche aplicado correctamente al archivo index.html`);
} catch (error) {
  console.error(`❌ Error al escribir el archivo: ${error.message}`);
  process.exit(1);
}

console.log(`🎉 El proceso de aplicación del parche ha finalizado correctamente.`);
