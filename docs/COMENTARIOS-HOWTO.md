# GUÍA: CÓMO ACTIVAR COMENTARIOS EN HISTORIAS DESOPILANTES

## Descripción General
Este documento explica cómo activar y gestionar la funcionalidad de comentarios en la aplicación web "Historias Desopilantes".

## Requisitos
- Acceso a la base de datos PostgreSQL en Railway
- Acceso al servidor API en Railway
- Credenciales de Firebase para el frontend

## Pasos para Activar Comentarios

### 1. Preparación del Entorno Local

#### Verificar el archivo .env.server
Asegúrate de que el archivo `.env.server` contiene la configuración correcta:

```
DATABASE_URL=postgresql://postgres:tu_password@containers-us-west-XXX.railway.app:7890/railway
DB_USER=postgres
DB_HOST=containers-us-west-XXX.railway.app
DB_NAME=railway
DB_PASSWORD=tu_password
DB_PORT=7890
```

### 2. Activar Servidor de Comentarios Local

Para probar localmente, ejecuta:

```powershell
.ejecutar-servidor-comentarios.ps1
```

Este script:
- Verifica la configuración
- Detiene procesos Node.js activos
- Instala dependencias
- Inicia el servidor en el puerto 4000

### 3. Actualizar Comentarios en la Base de Datos

Para cargar los comentarios de ejemplo:

```powershell
.actualizar-comentarios-railway-mejorado.ps1
```

Este script:
- Verifica dependencias
- Crea las tablas necesarias si no existen
- Limpia los comentarios existentes
- Inserta comentarios de ejemplo en la base de datos
- Prueba la conexión a la API

### 4. Verificar Funcionamiento

#### Verificación Local
1. Abre [http://localhost:5173](http://localhost:5173) en tu navegador
2. Navega a cualquier historia (ejemplo: [http://localhost:5173/historia/1](http://localhost:5173/historia/1))
3. Desplázate hasta la sección de comentarios
4. Verifica que los comentarios se muestran correctamente

#### Verificación en Producción
1. Abre [https://histostorias-desopilantes.web.app](https://histostorias-desopilantes.web.app)
2. Navega a cualquier historia
3. Verifica que los comentarios se cargan desde Railway

## Solución de Problemas

### No se ven los comentarios
- **Causa posible**: Problemas de CORS
  - **Solución**: Verifica la configuración CORS en `servidor-ultra-definitivo-comments.js`

- **Causa posible**: Problemas de conexión a la base de datos
  - **Solución**: Verifica las credenciales en el archivo `.env.server`

- **Causa posible**: Frontend usa URL incorrecta
  - **Solución**: Verifica la URL base en `src/config/api.js`

### Errores en la consola
- **Causa posible**: Servidor no está en ejecución
  - **Solución**: Ejecuta `.ejecutar-servidor-comentarios.ps1`

- **Causa posible**: Error en las consultas SQL
  - **Solución**: Verifica que la tabla 'comentarios' existe y tiene la estructura correcta

## Comandos Útiles

### Verificar estado de la API
```
curl http://localhost:4000/api/test
```

### Verificar comentarios de una historia
```
curl http://localhost:4000/api/stories/1/comments
```

## Mantenimiento

### Actualización de Comentarios
Para actualizar o añadir nuevos comentarios:

1. Edita el archivo `mock-comments.js` con los nuevos comentarios
2. Ejecuta `.actualizar-comentarios-railway-mejorado.ps1` para actualizar la base de datos
