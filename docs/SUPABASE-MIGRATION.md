# Migración a Supabase - Historias Desopilantes

Este documento explica cómo migrar la aplicación "Historias Desopilantes" de PostgreSQL en Railway a Supabase, solucionando los problemas de conectividad experimentados anteriormente.

## 🌟 Ventajas de usar Supabase

- **APIs listas para usar**: No es necesario conectarse directamente a PostgreSQL
- **Autenticación integrada**: JWT y gestión de usuarios incluida
- **Gestión de permisos**: Políticas de seguridad a nivel de base de datos
- **Plan gratuito generoso**: Hasta 10,000 usuarios y 500MB de almacenamiento
- **Compatibilidad total**: Sigue siendo PostgreSQL por debajo

## 📋 Requisitos previos

1. Tener una cuenta en [Supabase](https://supabase.com)
2. Haber creado un proyecto en Supabase
3. Tener acceso a las claves API (anon y service)

## 🔧 Configuración inicial

### 1. Crear archivo `.env.supabase` con las credenciales

```
SUPABASE_URL=https://tu-proyecto-id.supabase.co
SUPABASE_ANON_KEY=tu-clave-anon-key
SUPABASE_SERVICE_KEY=tu-clave-service-key
```

### 2. Instalar dependencias de Supabase

```bash
npm install @supabase/supabase-js
```

### 3. Verificar la conexión

```bash
node verificar-supabase-api.js
```

### 4. Inicializar la base de datos

```bash
node init-supabase-api.js
```

## 🚀 Despliegue

### Actualizar servidor para usar Supabase API

```bash
node actualizar-servidor-supabase-api.js
```

### Despliegue completo (Firebase, GitHub y Railway)

```powershell
./desplegar-completo-supabase.ps1
```

### Despliegues individuales

- **Sólo Firebase (frontend)**: `./actualizar-firebase-supabase.ps1`
- **Sólo Railway (backend)**: `./actualizar-railway-supabase.ps1`

## 🛠️ Solución de problemas

### No se puede conectar a Supabase

1. Verifica que las claves API sean correctas
2. Comprueba si la IP está bloqueada en las políticas de seguridad
3. Ejecuta `node verificar-supabase-api.js` para diagnóstico

### Tablas no existentes

Si el script muestra error porque las tablas no existen, ejecuta:

```bash
node init-supabase-api.js
```

### Errores en Railway

1. Verifica que las variables de entorno estén configuradas en Railway
2. Comprueba que la función de autorización esté correctamente implementada

## 📚 Estructura de archivos importantes

- `db-config-supabase.js`: Configuración de conexión a Supabase
- `models/Historia.js`: Modelo para interactuar con historias
- `models/Comentario.js`: Modelo para interactuar con comentarios
- `verificar-supabase-api.js`: Script para verificar la conexión
- `init-supabase-api.js`: Script para inicializar la base de datos

## 🧩 API de Supabase vs. PostgreSQL directo

### Antes (PostgreSQL directo)

```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function getHistorias() {
  const client = await pool.connect();
  const result = await client.query('SELECT * FROM historias');
  client.release();
  return result.rows;
}
```

### Después (API de Supabase)

```javascript
const { supabasePublic } = require('./db-config-supabase');

async function getHistorias() {
  const { data, error } = await supabasePublic
    .from('historias')
    .select('*');
  
  if (error) throw error;
  return data;
}
```

## 🔒 Seguridad y políticas de acceso

Supabase permite configurar políticas de seguridad a nivel de base de datos. Para la aplicación "Historias Desopilantes", hemos configurado:

1. **Acceso público (anon)**: Lectura de historias y comentarios
2. **Acceso de servicio**: Escritura y administración completa

## 📝 Notas adicionales

- La migración mantiene toda la funcionalidad existente
- Se han actualizado los modelos para usar la API de Supabase
- La estructura de la base de datos sigue siendo la misma
- Railway ahora solo aloja el servidor Express, no la base de datos
