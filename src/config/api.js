// Configuración de la API
const API_CONFIG = {
  // URL base para desarrollo local
  development: 'http://localhost:3009',
  
  // URL base para producción (Railway)
  production: 'https://historias-desopilantes-production.up.railway.app',
  
  // Función para obtener la URL base correcta
  getBaseURL: () => {
    // Siempre usar Railway por ahora ya que el servidor local tiene problemas
    return API_CONFIG.production;
    
    // TODO: Restaurar lógica de desarrollo cuando se solucione servidor local
    // if (window.location.hostname.includes('web.app') || window.location.hostname.includes('firebaseapp.com')) {
    //   return API_CONFIG.production;
    // }
    // return process.env.NODE_ENV === 'production' 
    //   ? API_CONFIG.production 
    //   : API_CONFIG.development;
  },
  
  // URLs completas de los endpoints
  endpoints: {
    // Test endpoint
    test: '/api/test',
    
    // Stories
    stories: '/api/stories',
    storyLikes: (id) => `/api/stories/${id}/likes`,
    storyLike: (id) => `/api/stories/${id}/like`,
    storyComment: (id) => `/api/stories/${id}/comment`,
    storyComments: (id) => `/api/stories/${id}/comments`,
    
    // Contact
    contact: '/api/contact',
    
    // Subscribers
    subscribers: '/api/subscribers',
    
    // Admin
    adminLogin: '/api/admin/auth/login',
    adminStats: '/api/admin/historias/stats/general',
    adminHistorias: '/api/admin/historias',
    adminHistoria: (id) => `/api/admin/historias/${id}`
  }
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint) => {
  const baseURL = API_CONFIG.getBaseURL();
  return `${baseURL}${endpoint}`;
};

// Exportar configuración
export default API_CONFIG;
