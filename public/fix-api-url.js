
/**
 * PARCHE AUTOMÁTICO PARA REDIRIGIR PETICIONES A LA API
 * No eliminar hasta que se resuelva el problema de URLs
 */
(function() {
  const oldUrl = 'historias-desopilantes-production.up.railway.app';
  const newUrl = 'historias-desopilantes-react-production.up.railway.app';
  
  console.log('🔄 Instalando redirección automática para peticiones API...');
  
  // Guardar la función fetch original
  const originalFetch = window.fetch;
  
  // Reemplazar con nuestra función que redirige URLs
  window.fetch = function(resource, options) {
    if (typeof resource === 'string' && resource.includes(oldUrl)) {
      console.log('🔀 Redirigiendo:', resource);
      resource = resource.replace(oldUrl, newUrl);
    }
    return originalFetch.call(this, resource, options);
  };
  
  // También parchear XMLHttpRequest para redirigir
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (typeof url === 'string' && url.includes(oldUrl)) {
      console.log('🔀 Redirigiendo XHR:', url);
      url = url.replace(oldUrl, newUrl);
    }
    return originalOpen.call(this, method, url, ...args);
  };
  
  console.log('✅ Parche de redirección instalado correctamente');
})();