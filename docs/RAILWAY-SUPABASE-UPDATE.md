## Guía de Actualización de Railway con Supabase

Este documento explica cómo actualizar correctamente el servidor en Railway para que utilice Supabase como base de datos en lugar de PostgreSQL de Railway.

### 1. Preparación

Antes de actualizar Railway, asegúrate de que:

1. Has configurado correctamente Supabase con las tablas necesarias
2. Has actualizado el servidor para usar la configuración de Supabase
3. Has probado localmente que todo funciona correctamente

### 2. Actualización de Variables de Entorno en Railway

1. Ve al panel de control de Railway: https://railway.app/dashboard
2. Selecciona tu proyecto "historias-desopilantes"
3. Haz clic en la pestaña "Variables"
4. Agrega las siguientes variables de entorno:

```
SUPABASE_DB_URL=postgresql://postgres:tu_contraseña@db.hxxcdxddueexcqvfhiti.supabase.co:5432/postgres
SUPABASE_DIRECT_URL=postgresql://postgres:tu_contraseña@db.hxxcdxddueexcqvfhiti.supabase.co:5432/postgres
NODE_ENV=production
PORT=4000
```

Reemplaza `tu_contraseña` con la contraseña real de Supabase.

### 3. Despliegue en Railway

#### Opción 1: Desde GitHub (recomendada)

Si tu proyecto en Railway está configurado para desplegarse automáticamente desde GitHub:

1. Haz commit de todos los cambios en tu repositorio:
   ```
   git add .
   git commit -m "Migración a Supabase"
   git push origin main
   ```

2. Railway detectará los cambios y desplegará automáticamente la nueva versión.

3. Puedes verificar el estado del despliegue en la sección "Deployments" en Railway.

#### Opción 2: Mediante Railway CLI

Si prefieres usar la línea de comandos:

1. Instala Railway CLI si aún no lo tienes:
   ```
   npm i -g @railway/cli
   ```

2. Inicia sesión:
   ```
   railway login
   ```

3. Vincula tu proyecto:
   ```
   railway link
   ```

4. Despliega los cambios:
   ```
   railway up
   ```

### 4. Verificación

Una vez completado el despliegue:

1. Abre tu aplicación en Railway para verificar que se ha desplegado correctamente.
2. Comprueba los logs para asegurarte de que no hay errores de conexión.
3. Verifica que la aplicación puede conectarse correctamente a Supabase.
4. Haz algunas pruebas para asegurarte de que los comentarios funcionan correctamente.

### 5. Solución de Problemas

Si encuentras problemas con el despliegue:

1. **Error de conexión a Supabase**:
   - Verifica que las variables de entorno están configuradas correctamente
   - Confirma que la IP de Railway está en la lista blanca de Supabase
   - Revisa los logs para ver mensajes de error específicos

2. **Error en el servidor**:
   - Revisa los logs de Railway para identificar el problema
   - Prueba a desplegar una versión anterior conocida que funcione
   - Verifica que todos los archivos necesarios están incluidos en el despliegue

3. **Problemas de CORS**:
   - Añade los dominios de Railway a la variable CORS_ALLOWED_ORIGINS en Supabase

### 6. Rollback (si es necesario)

Si necesitas volver a la versión anterior:

1. En Railway, ve a la sección "Deployments"
2. Busca la última implementación exitosa
3. Haz clic en los tres puntos y selecciona "Rollback to this deployment"

Esto restaurará la versión anterior del servidor mientras solucionas los problemas.
