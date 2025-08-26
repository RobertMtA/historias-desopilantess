/**
 * PARCHE AUTOMÁTICO PARA REDIRIGIR PETICIONES A LA API LOCAL
 * Utilizar cuando Railway no está disponible
 */
(function() {
  const oldUrl = 'historias-desopilantes-production.up.railway.app';
  const newUrl = 'localhost:3000';
  
  console.log('🔄 Instalando redirección automática para peticiones API (modo LOCAL)...');
  
  // Guardar la función fetch original
  const originalFetch = window.fetch;
  
  // Reemplazar con nuestra función que redirige URLs
  window.fetch = function(resource, options) {
    if (typeof resource === 'string' && 
        (resource.includes(oldUrl) || 
         resource.includes('historias-desopilantes-react-production.up.railway.app'))) {
      console.log('🔀 Redirigiendo a servidor local:', resource);
      // Cambiar https:// por http:// para el servidor local
      resource = resource.replace(/https?:\/\/[^\/]+\//, 'http://localhost:3000/');
    }
    return originalFetch.call(this, resource, options);
  };
  
  // También parchear XMLHttpRequest para redirigir
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (typeof url === 'string' && 
        (url.includes(oldUrl) || 
         url.includes('historias-desopilantes-react-production.up.railway.app'))) {
      console.log('🔀 Redirigiendo XHR a servidor local:', url);
      url = url.replace(/https?:\/\/[^\/]+\//, 'http://localhost:3000/');
    }
    return originalOpen.call(this, method, url, ...args);
  };
  
  // Notificar al usuario
  console.log('✅ Parche de redirección a servidor LOCAL instalado correctamente');
  console.log('ℹ️ Las peticiones API se dirigirán a: http://localhost:3000');
})();
