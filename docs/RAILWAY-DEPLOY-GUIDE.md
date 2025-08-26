# Guía de Despliegue y Mantenimiento de la API Historias Desopilantes

Esta guía explica cómo desplegar y mantener la API de Historias Desopilantes en Railway.

## Requisitos

- Cuenta en [Railway](https://railway.app/)
- CLI de Railway instalado (`npm install -g @railway/cli`)
- Acceso al proyecto en Railway

## Despliegue

### Paso 1: Login en Railway

```bash
railway login
```

### Paso 2: Vincular el directorio con el proyecto de Railway

```bash
cd c:\Users\rober\Desktop\historias-desopilantes-react\api-railway
railway link
```

Sigue las instrucciones para seleccionar:
1. Tu espacio de trabajo
2. El proyecto "historias-desopilantes"
3. El entorno "production"
4. El servicio "historias-desopilantes"

### Paso 3: Desplegar la API

```bash
railway up
```

Este comando:
1. Indexa los archivos del proyecto
2. Los comprime y sube a Railway
3. Inicia el proceso de construcción y despliegue

### Paso 4: Verificar las tablas de la base de datos

```bash
railway run node verify-database.js
```

Este script verificará si las tablas necesarias existen y las creará si es necesario.

## Verificación

### Verificar el estado general de la API

```bash
railway run node check-status.js
```

Este script comprobará:
1. Si el servidor está respondiendo
2. Si la conexión a la base de datos funciona
3. Si las tablas necesarias existen

### Verificar manualmente desde el navegador

Accede a la URL de la API para verificar que está funcionando:

```
https://historias-desopilantes-production.up.railway.app/api/test
```

## Mantenimiento

### Actualizar el código

1. Realiza los cambios necesarios en el código
2. Pruébalos localmente
3. Despliega a Railway:

```bash
railway up
```

### Configuración de variables de entorno

En caso de necesitar añadir o modificar variables de entorno:

1. Ve al [Dashboard de Railway](https://railway.app/)
2. Selecciona tu proyecto
3. Ve a "Variables"
4. Añade o modifica las variables necesarias

Variables importantes:
- `DATABASE_URL`: Se configura automáticamente por Railway cuando tienes una base de datos PostgreSQL en tu proyecto
- `PORT`: Puerto en el que se ejecutará la aplicación (normalmente Railway lo gestiona)
- `NODE_ENV`: Entorno de ejecución (`production` en Railway)

### Monitorización

1. Ve al [Dashboard de Railway](https://railway.app/)
2. Selecciona tu proyecto y servicio
3. Revisa los logs para detectar posibles errores

## Solución de Problemas

### La API no responde

1. Verifica los logs en Railway
2. Asegúrate de que la aplicación está en ejecución
3. Comprueba si hay errores en el despliegue

### Problemas con la base de datos

1. Verifica que la variable `DATABASE_URL` está configurada correctamente
2. Ejecuta `railway run node verify-database.js` para verificar las tablas
3. Comprueba los permisos del usuario de la base de datos

### Problemas de CORS

1. Verifica que el dominio del frontend está en la lista de `allowedOrigins`
2. Asegúrate de que la configuración CORS está activa en `server.js`
3. Comprueba que las solicitudes desde el frontend incluyan los headers adecuados

## Comandos Útiles de Railway

- `railway logs`: Ver los logs de la aplicación
- `railway status`: Ver el estado de la aplicación
- `railway variables`: Gestionar variables de entorno
- `railway run <comando>`: Ejecutar un comando en el entorno de Railway
