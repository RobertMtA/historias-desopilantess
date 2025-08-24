# Análisis del problema de los IDs 404

## Diagnóstico

Al revisar la estructura de la base de datos y el servidor de desarrollo, he detectado el siguiente problema:

1. **Múltiples tablas relacionadas con stories/historias:**
   - `stories`: Tabla principal de historias (IDs del 1 al 21)
   - `story_interactions`: Tabla para interacciones (likes, vistas) con historias
   - `comments`: Tabla de comentarios en inglés
   - `comentarios`: Tabla de comentarios en español

2. **El error 404 en `/api/stories/23/likes` (y otros IDs superiores a 21)** se debe a que:
   - La base de datos solo tiene historias con IDs del 1 al 21
   - Cuando se intenta acceder a IDs superiores (22, 23, etc.), el servidor devuelve 404 porque no encuentra esas historias

## Solución

Para resolver este problema, tenemos estas opciones:

1. **Verificar el código del frontend:**
   - Revisar por qué el frontend está intentando acceder a historias con IDs superiores al 21
   - Puede haber un bucle o lógica que está generando estos IDs incorrectos

2. **Modificar la ruta del servidor:**
   - Modificar el endpoint `/api/stories/:id/likes` para manejar IDs inexistentes de forma más elegante
   - En lugar de devolver un error 404, podría devolver un objeto con likes=0

3. **Hacer que el frontend verifique los IDs válidos:**
   - Primero obtener la lista completa de historias disponibles
   - Luego solo solicitar likes para las historias que existen

## Implementación recomendada

1. **Verificar el frontend:** Buscar dónde está haciendo las peticiones de likes y asegurar que solo se soliciten likes para historias existentes.

2. **Modificar el servidor:** 
   ```javascript
   app.get('/api/stories/:id/likes', async (req, res) => {
     try {
       const { id } = req.params;
       console.log(`🔍 Obteniendo likes para historia ID: ${id}`);
       
       const result = await pool.query('SELECT likes FROM stories WHERE id = $1', [id]);
       
       // Si la historia no existe, devolver objeto con likes=0 en lugar de error 404
       if (result.rows.length === 0) {
         return res.json({
           storyId: parseInt(id),
           likes: 0,
           hasLiked: false,
           exists: false  // Indicador para frontend
         });
       }
       
       const response = {
         storyId: parseInt(id),
         likes: result.rows[0].likes || 0,
         hasLiked: false,
         exists: true
       };
       
       console.log(`✅ Likes obtenidos:`, response);
       res.json(response);
     } catch (error) {
       console.error('❌ Error getting story likes:', error);
       res.status(500).json({ error: 'Error al obtener likes de la historia' });
     }
   });
   ```

## Conclusión

El problema no es crítico pero está causando errores 404 que aparecen en la consola. La solución más rápida y práctica es modificar el endpoint del servidor para que maneje IDs no existentes de manera más elegante, devolviendo un objeto con likes=0 en lugar de un error 404.
