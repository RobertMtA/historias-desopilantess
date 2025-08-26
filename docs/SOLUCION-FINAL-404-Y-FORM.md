# SOLUCIÓN FINAL A ERRORES 404 Y ADVERTENCIAS DE FORMULARIO

## Problemas identificados

1. **Errores 404 en peticiones a la API**:
   - El frontend estaba usando la URL de API correcta (buildApiUrl) pero la configuración en `src/config/api.js` apuntaba al puerto 3009 mientras el servidor estaba ejecutándose en el puerto 4000.

2. **Advertencia sobre campos de formulario sin atributos id/name**:
   - Los inputs del formulario de comentarios en `HistoriaCard.jsx` carecían de atributos `id` y `name`, lo que generaba advertencias en el navegador.

## Soluciones implementadas

### 1. Corrección de configuración de API

Actualizamos `src/config/api.js` para:
- Cambiar el puerto de desarrollo de 3009 a 4000
- Mejorar la lógica de detección de entorno para usar el servidor local cuando estamos en localhost

```javascript
// Configuración de la API
const API_CONFIG = {
  // URL base para desarrollo local
  development: 'http://localhost:4000',
  
  // URL base para producción (Railway)
  production: 'https://historias-desopilantes-production.up.railway.app',
  
  // Función para obtener la URL base correcta
  getBaseURL: () => {
    // Usar el servidor local si estamos en desarrollo, o Railway si estamos en producción
    if (window.location.hostname === 'localhost') {
      return API_CONFIG.development;
    }
    return API_CONFIG.production;
  },
  // ...
};
```

### 2. Corrección de campos de formulario

Agregamos atributos `id` y `name` a los campos del formulario de comentarios:

```jsx
<input
  type="text"
  placeholder="Tu nombre"
  value={userName}
  onChange={(e) => setUserName(e.target.value)}
  className="comment-name-input"
  maxLength="50"
  id={`comment-name-${storyId}`}
  name="userName"
/>
<textarea
  placeholder="Escribe tu comentario..."
  value={newComment}
  onChange={(e) => setNewComment(e.target.value)}
  className="comment-textarea"
  maxLength="500"
  rows="3"
  id={`comment-text-${storyId}`}
  name="commentText"
/>
```

### 3. Scripts de diagnóstico y solución

Creamos dos scripts para ayudar a diagnosticar y solucionar el problema:

1. `detectar-urls-hardcodeadas.js`: Para encontrar referencias directas a localhost:4000 en el código.
2. `reiniciar-con-puerto-correcto.ps1`: Script PowerShell para reiniciar la aplicación con la configuración correcta.

## Verificación

Para comprobar que los cambios resuelven el problema:

1. Ejecuta el script PowerShell `.\reiniciar-con-puerto-correcto.ps1`
2. Abre la aplicación en http://localhost:5173
3. Verifica que no aparezcan errores 404 en la consola
4. Confirma que no hay advertencias sobre campos de formulario sin atributos id/name

## Análisis de causa raíz

El problema surgió debido a una discrepancia en la configuración:
- El servidor se estaba ejecutando en el puerto 4000 (configurado en scripts)
- La configuración de la API en el frontend usaba el puerto 3009

Esto causaba que las peticiones generadas por el componente `HistoriaCard` intentaran acceder a un endpoint incorrecto.

## Recomendaciones futuras

1. **Centralizar configuración**: Mantener la configuración de puertos en un solo lugar (por ejemplo, en un archivo .env)
2. **Validación automática**: Implementar pruebas que verifiquen la consistencia de configuración entre frontend y backend
3. **Manejo de errores**: Mejorar el manejo de errores para detectar y reportar problemas de conexión de forma más clara

---

*Documento creado: 24 de agosto de 2025*
