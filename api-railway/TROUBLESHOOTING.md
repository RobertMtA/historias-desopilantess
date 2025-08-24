# Guía de Resolución de Problemas para la API de Historias Desopilantes

Este documento proporciona soluciones para los problemas más comunes que pueden ocurrir con la API de Historias Desopilantes desplegada en Railway.

## Problemas con endpoints que no responden (404)

Si encuentras que algunos endpoints devuelven 404 a pesar de estar definidos en el código:

### Posibles causas:

1. **Problema de despliegue incompleto**
   - Railway puede no haber desplegado la versión más reciente del código.

2. **Error en el orden de definición de rutas**
   - Las rutas más específicas deben definirse antes que las más generales.

3. **Conflicto con middleware**
   - Algún middleware podría estar interceptando las solicitudes.

### Soluciones:

1. **Forzar un nuevo despliegue completo**:
   ```powershell
   cd api-railway
   railway up --no-cache
   ```

2. **Verificar los endpoints activos**:
   ```powershell
   node check-api-status.js
   ```

3. **Revisar y corregir el orden de las rutas en `server.js`**:
   - Asegúrate de que rutas como `/api/stories/:id/comments` se definan antes que `/api/stories/:id`.

## Problemas con CORS

Si el frontend recibe errores CORS al conectar con la API:

### Posibles causas:

1. **Configuración CORS incompleta**
   - Las cabeceras CORS podrían no estar aplicándose correctamente.

2. **El origen no está en la lista de permitidos**
   - La URL de origen del frontend podría no estar en la lista de `allowedOrigins`.

### Soluciones:

1. **Verificar configuración CORS en `server.js`**:
   ```javascript
   // Asegúrate de que tu dominio esté incluido
   const allowedOrigins = [
     'https://historias-desopilantes.web.app',
     'https://tu-dominio-frontend.com',
     'http://localhost:5173',
     'http://localhost:3000'
   ];
   ```

2. **Aplicar cabeceras CORS manualmente en rutas problemáticas**:
   ```javascript
   app.get('/api/historias/:id/comentarios', async (req, res) => {
     // Aplicar cabeceras CORS manualmente
     res.header('Access-Control-Allow-Origin', '*');
     res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
     res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
     
     // Resto del código...
   });
   ```

## Problemas con la base de datos

Si los datos no se guardan o las consultas fallan:

### Posibles causas:

1. **Tablas no existentes**
   - Las tablas necesarias podrían no haberse creado.

2. **Problemas de conexión**
   - La cadena de conexión podría ser incorrecta o la base de datos no estar disponible.

3. **Permisos insuficientes**
   - El usuario podría no tener permisos para realizar operaciones.

### Soluciones:

1. **Verificar y crear tablas**:
   ```powershell
   railway run node verify-database.js
   ```

2. **Verificar conexión a la base de datos**:
   ```javascript
   // En la consola de Railway, ejecutar:
   railway run node -e "
   const { Pool } = require('pg');
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false }
   });
   pool.query('SELECT NOW()', (err, res) => {
     console.log(err ? err : res.rows[0]);
     pool.end();
   });"
   ```

3. **Recrear las variables de entorno en Railway**:
   - Ve al dashboard de Railway
   - Selecciona tu proyecto
   - Ve a la sección "Variables"
   - Verifica que `DATABASE_URL` esté correctamente configurada

## Problemas con el rendimiento o tiempos de respuesta

Si la API es lenta o se bloquea:

### Posibles causas:

1. **Consultas ineficientes**
   - Las consultas SQL podrían no estar optimizadas.

2. **Falta de índices**
   - Las tablas podrían no tener índices adecuados.

3. **Recursos insuficientes**
   - El plan de Railway podría no proporcionar recursos suficientes.

### Soluciones:

1. **Optimizar consultas**:
   - Utiliza selectores específicos en lugar de `SELECT *`
   - Añade cláusulas WHERE efectivas

2. **Añadir índices a tablas críticas**:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_comentarios_historia_id 
   ON comentarios(historia_id);
   
   CREATE INDEX IF NOT EXISTS idx_story_interactions_historia_id 
   ON story_interactions(historia_id);
   ```

3. **Implementar caché para endpoints frecuentes**:
   ```javascript
   // Implementar caché simple en memoria
   const cache = {};
   
   app.get('/api/historias', async (req, res) => {
     const cacheKey = 'all_historias';
     
     if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < 300000) {
       return res.json(cache[cacheKey].data);
     }
     
     // Consulta normal...
     const result = await client.query('SELECT * FROM historias');
     
     // Guardar en caché
     cache[cacheKey] = {
       data: result.rows,
       timestamp: Date.now()
     };
     
     return res.json(result.rows);
   });
   ```

## Contacto y soporte

Si continúas experimentando problemas después de intentar estas soluciones, por favor:

1. Revisa los logs de Railway para obtener más información sobre el error.
2. Verifica que todos los cambios hayan sido desplegados correctamente.
3. Contacta al equipo de desarrollo para soporte adicional.

---

Documento creado para el mantenimiento de la API de Historias Desopilantes.
Última actualización: Julio 2023
