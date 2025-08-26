/**
 * PARCHE AUTOMÁTICO PARA REDIRIGIR PETICIONES A LA API LOCAL
 * Este archivo redirige las peticiones al servidor local de comentarios
 */
(function() {
  const originalUrl = 'historias-desopilantes-production.up.railway.app';
  const localServerUrl = 'localhost:4000';
  
  console.log('🔄 Instalando redirección automática para peticiones API...');
  
  // Guardar la función fetch original
  const originalFetch = window.fetch;
  
  // Reemplazar con nuestra función que redirige URLs
  window.fetch = function(resource, options) {
    if (typeof resource === 'string' && resource.includes(originalUrl)) {
      console.log('🔀 Redirigiendo:', resource);
      resource = resource.replace(originalUrl, localServerUrl);
      
      // Asegurarse de usar http:// para localhost
      if (resource.includes(localServerUrl) && !resource.startsWith('http')) {
        resource = 'http://' + resource;
      }
      
      console.log('🚀 URL transformada:', resource);
    }
    return originalFetch.call(this, resource, options);
  };
  
  // También parchear XMLHttpRequest para redirigir
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (typeof url === 'string' && url.includes(originalUrl)) {
      console.log('🔀 Redirigiendo XHR:', url);
      url = url.replace(originalUrl, localServerUrl);
      
      // Asegurarse de usar http:// para localhost
      if (url.includes(localServerUrl) && !url.startsWith('http')) {
        url = 'http://' + url;
      }
      
      console.log('🚀 URL XHR transformada:', url);
    }
    return originalOpen.call(this, method, url, ...args);
  };
  
  console.log('✅ Parche de redirección instalado correctamente');
  console.log('📣 Las peticiones a Railway se redirigirán al servidor local en http://localhost:4000');
})();
