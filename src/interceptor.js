// Interceptor de API mejorado para evitar errores 404
// Este archivo debe importarse al inicio de la aplicación (en main.jsx o index.js)

// Lista de IDs válidos según la verificación de la base de datos
const VALID_STORY_IDS = Array.from({ length: 21 }, (_, i) => i + 1);

// Guardar referencia al fetch original
const originalFetch = window.fetch;

// Reemplazar la función fetch global con nuestra versión mejorada
window.fetch = function(url, options) {
  // Solo interceptar si es una URL (string) y contiene '/api/stories/'
  if (url && typeof url === 'string' && url.includes('/api/stories/')) {
    // Extraer el ID de la historia de la URL
    try {
      const urlObj = new URL(url, window.location.origin);
      const pathParts = urlObj.pathname.split('/');
      const storiesIndex = pathParts.indexOf('stories');
      
      if (storiesIndex !== -1 && storiesIndex + 1 < pathParts.length) {
        const storyIdStr = pathParts[storiesIndex + 1];
        const storyId = parseInt(storyIdStr);
        
        // Si el ID no está en la lista de IDs válidos, interceptar la petición
        if (!isNaN(storyId) && !VALID_STORY_IDS.includes(storyId)) {
          console.log(`📝 Interceptando petición para historia inexistente ID: ${storyId}`);
          
          // Determinar qué tipo de endpoint es
          if (url.includes('/likes')) {
            console.log(`⚙️ Devolviendo likes=0 para historia ${storyId}`);
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                storyId: storyId,
                likes: 0,
                hasLiked: false,
                exists: false
              }),
              text: () => Promise.resolve(JSON.stringify({
                storyId: storyId,
                likes: 0,
                hasLiked: false,
                exists: false
              })),
              status: 200,
              statusText: 'OK (intercepted)',
              headers: new Headers({
                'Content-Type': 'application/json'
              })
            });
          } 
          else if (url.includes('/comments')) {
            console.log(`⚙️ Devolviendo comments=[] para historia ${storyId}`);
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                storyId: storyId,
                comments: [],
                total: 0,
                exists: false
              }),
              text: () => Promise.resolve(JSON.stringify({
                storyId: storyId,
                comments: [],
                total: 0,
                exists: false
              })),
              status: 200,
              statusText: 'OK (intercepted)',
              headers: new Headers({
                'Content-Type': 'application/json'
              })
            });
          }
        }
      }
    } catch (error) {
      console.error('Error en interceptor fetch:', error);
      // Si hay un error en el análisis, continuar con la petición original
    }
  }
  
  // Para cualquier otra petición, usar el fetch original
  return originalFetch.apply(this, arguments);
};

// Para integrar en la aplicación React:
// Importar este archivo en el entry point (index.js o main.jsx)
// import './interceptor.js';
