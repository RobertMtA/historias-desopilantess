# API de Historias Desopilantes para Railway

Esta es la API backend para la aplicación "Historias Desopilantes", que proporciona endpoints para historias, comentarios y likes.

## Endpoints disponibles

### Historias
- `GET /api/historias` o `GET /api/stories` - Obtener todas las historias
- `GET /api/historias/:id` o `GET /api/stories/:id` - Obtener una historia específica

### Comentarios
- `GET /api/historias/:id/comentarios` o `GET /api/stories/:id/comments` - Obtener comentarios de una historia
- `POST /api/historias/:id/comentarios` o `POST /api/stories/:id/comments` - Añadir un comentario a una historia

### Likes
- `GET /api/historias/:id/likes` o `GET /api/stories/:id/likes` - Obtener likes de una historia
- `POST /api/historias/:id/likes` o `POST /api/stories/:id/like` - Dar like a una historia

## Diagnóstico y configuración
- `GET /api/diagnostico` - Verificar el estado de las tablas
- `POST /api/setup` - Crear tablas necesarias

## Despliegue en Railway

Para desplegar esta API en Railway:

1. Conecta tu repositorio a Railway
2. Asegúrate de que Railway detecte Node.js correctamente
3. Agrega un servicio de PostgreSQL
4. Configura la variable de entorno `DATABASE_URL` (Railway lo hace automáticamente)
5. Ejecuta `npm run setup` para inicializar las tablas (puedes hacerlo con el comando "Run" en Railway)

## Variables de entorno

- `PORT`: Puerto en el que se ejecutará el servidor (por defecto: 3000)
- `NODE_ENV`: Entorno de ejecución (development/production)
- `DATABASE_URL`: URL de conexión a PostgreSQL
