# Implementación Ultra-Definitiva: Historias Desopilantes

Este documento proporciona la solución completa para implementar la aplicación "Historias Desopilantes" tanto en Firebase (frontend) como en Railway (backend con PostgreSQL).

## Arquitectura

La aplicación utiliza una arquitectura dividida:

1. **Frontend**: Aplicación React alojada en Firebase
2. **Backend**: Servidor Express alojado en Railway
3. **Base de datos**: PostgreSQL alojado en Railway

## Archivos clave creados

### Scripts de despliegue y configuración

- `api-railway/deploy-railway-optimizado.ps1`: Script PowerShell para automatizar el despliegue a Railway
- `api-railway/verificar-estado-railway.ps1`: Script para verificar el estado de los servicios en Railway
- `api-railway/test-db-connection.js`: Script para probar la conexión a PostgreSQL

### Servidor y configuración de base de datos

- `api-railway/server-auto-init.js`: Servidor Express con inicialización automática de la base de datos
- `api-railway/create-tables-direct.js`: Script para crear tablas directamente en Railway
- `api-railway/Dockerfile.optimized`: Docker optimizado para Railway

### Documentación

- `api-railway/POSTGRESQL-RAILWAY-GUIDE.md`: Guía completa sobre PostgreSQL en Railway

## Guía de implementación

### 1. Configuración inicial

Antes de comenzar, asegúrate de tener instalado:

- Node.js y npm
- Railway CLI (`npm install -g @railway/cli`)
- Firebase CLI (`npm install -g firebase-tools`) - para el frontend

### 2. Despliegue del backend en Railway

1. Navega al directorio `api-railway`
2. Ejecuta el script de despliegue:

```powershell
.\deploy-railway-optimizado.ps1
```

Este script realizará los siguientes pasos:
- Iniciar sesión en Railway (si es necesario)
- Seleccionar el proyecto
- Configurar variables de entorno
- Seleccionar el Dockerfile y servidor a utilizar
- Iniciar el despliegue
- Opcionalmente, inicializar la base de datos

### 3. Verificación del despliegue

Después del despliegue, puedes verificar el estado:

```powershell
.\verificar-estado-railway.ps1
```

Este script te permitirá:
- Ver el estado de los servicios
- Revisar las variables de entorno
- Ver los logs recientes
- Probar la conexión a la base de datos
- Abrir la URL del servicio en el navegador

### 4. Solución de problemas

Si encuentras problemas con la conexión a PostgreSQL:

1. Ejecuta el script de prueba de conexión:

```powershell
railway run node test-db-connection.js
```

2. Consulta la guía detallada en `POSTGRESQL-RAILWAY-GUIDE.md`

### 5. Estructura de archivos

La aplicación utiliza las siguientes tablas en PostgreSQL:

- `historias`: Almacena las historias principales
- `comentarios`: Almacena los comentarios asociados a las historias
- `story_interactions`: Almacena likes y vistas de las historias

## Endpoints API

El backend expone los siguientes endpoints:

- `GET /api/historias`: Obtener todas las historias
- `GET /api/historias/:id`: Obtener una historia específica
- `GET /api/historias/:id/comentarios`: Obtener comentarios de una historia
- `POST /api/historias/:id/comentarios`: Agregar un comentario
- `POST /api/historias/:id/likes`: Dar like a una historia

## Despliegue continuo

Para actualizar el backend después de realizar cambios:

1. Haz tus cambios en los archivos correspondientes
2. Ejecuta el script de despliegue nuevamente

## Mantenimiento

Para asegurarte de que la aplicación sigue funcionando correctamente:

1. Verifica regularmente los logs (`railway logs`)
2. Comprueba la conexión a la base de datos
3. Monitorea el uso de recursos en Railway

## Solución a problemas comunes

### Error: getaddrinfo ENOTFOUND postgres.railway.internal

Solución: Usa `localhost` como host en lugar de `postgres.railway.internal`.

### Error: connect ENETUNREACH

Solución: Verifica que el servicio PostgreSQL esté en el mismo proyecto de Railway y usa `localhost` como host.

### Error: password authentication failed for user "postgres"

Solución: Verifica las variables de entorno `PGPASSWORD` o `POSTGRES_PASSWORD`.

## Conclusión

Con esta implementación, la aplicación "Historias Desopilantes" debería estar completamente funcional, con el frontend servido desde Firebase y el backend con la base de datos PostgreSQL ejecutándose en Railway.
