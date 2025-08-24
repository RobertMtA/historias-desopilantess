# Estado de la API Historias Desopilantes

Este documento proporciona una visión general del estado actual de la API y su configuración.

## Resumen de la Configuración

| Componente | Estado |
|------------|--------|
| API Server | ✅ Activo en Railway |
| PostgreSQL | ✅ Configurado en Railway |
| CORS | ✅ Configurado para permitir frontend |
| Endpoints | ✅ Disponibles en español e inglés |

## URL de la API

```
https://historias-desopilantes-production.up.railway.app
```

## Endpoints Disponibles

### Historias

- `GET /api/historias` - Obtener todas las historias
- `GET /api/historias/:id` - Obtener una historia específica
- `GET /api/stories` - Versión en inglés para obtener todas las historias
- `GET /api/stories/:id` - Versión en inglés para obtener una historia específica

### Likes

- `GET /api/historias/:id/likes` - Obtener likes de una historia (español)
- `POST /api/historias/:id/likes` - Dar like a una historia (español)
- `POST /api/historias/:id/like` - Alternativa sin "s" (español)
- `GET /api/stories/:id/likes` - Obtener likes de una historia (inglés)
- `POST /api/stories/:id/likes` - Dar like a una historia (inglés)
- `POST /api/stories/:id/like` - Alternativa sin "s" (inglés)

### Comentarios

- `GET /api/historias/:id/comentarios` - Obtener comentarios (español)
- `POST /api/historias/:id/comentarios` - Añadir comentario (español)
- `GET /api/stories/:id/comments` - Obtener comentarios (inglés)
- `POST /api/stories/:id/comments` - Añadir comentario (inglés)

### Contacto

- `POST /api/contact` - Formulario de contacto (compatible con campos en español e inglés)

## Bases de Datos

### PostgreSQL

- **Tabla `story_interactions`**: Almacena likes y vistas de historias
- **Tabla `comentarios`**: Almacena comentarios de las historias

## Resolución de Problemas Comunes

### Error CORS

Si experimentas errores CORS en el frontend:

1. Verifica que el dominio del frontend está en la lista de `allowedOrigins` en el archivo `server.js`.
2. Comprueba que estás usando la URL correcta para conectarte a la API.
3. Asegúrate de que el navegador no está bloqueando las solicitudes.

### Problemas con Likes o Comentarios

Si los likes o comentarios no funcionan correctamente:

1. Ejecuta `railway run node verify-database.js` para comprobar que las tablas existen.
2. Verifica que estás usando los endpoints correctos en el frontend.

### Error en la Base de Datos

Si hay problemas conectando a la base de datos:

1. Asegúrate de que la variable `DATABASE_URL` está correctamente configurada en Railway.
2. Comprueba que la instancia de PostgreSQL en Railway está activa.
3. Verifica que el usuario tiene permisos suficientes para crear tablas y modificarlas.

## Próximas Mejoras

1. Implementar autenticación para acciones como likes y comentarios
2. Mejorar el manejo de errores y mensajes al usuario
3. Optimizar las consultas a la base de datos
4. Implementar caché para mejorar el rendimiento
