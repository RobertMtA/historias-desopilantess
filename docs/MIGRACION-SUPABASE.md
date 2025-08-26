# Migración a Supabase - Guía de Implementación

## Introducción

Este documento explica cómo hemos migrado la base de datos PostgreSQL de Railway a Supabase para solucionar los problemas de conectividad y mejorar la estabilidad de la aplicación "Historias Desopilantes".

## ¿Por qué Supabase?

Supabase ofrece varias ventajas sobre Railway PostgreSQL:

1. **Mayor estabilidad**: Conexiones más confiables y menos problemas de SSL
2. **Interfaz de administración**: Panel de control intuitivo para gestionar bases de datos
3. **Compatibilidad total con PostgreSQL**: No requiere cambios en el código SQL
4. **Capa gratuita generosa**: Perfecto para proyectos como este
5. **Escalabilidad**: Fácil de escalar si el proyecto crece

## Archivos Creados/Modificados

1. **db-config-supabase.js**: Configuración de la conexión a Supabase
2. **.env.supabase**: Variables de entorno para las credenciales de Supabase
3. **init-supabase-db.js**: Script para inicializar la base de datos en Supabase
4. **actualizar-servidor-supabase.js**: Script para actualizar el servidor existente
5. **ejecutar-servidor-comentarios-supabase.ps1**: Script para ejecutar el servidor con Supabase

## Pasos para la Migración

### 1. Configurar las credenciales de Supabase

Edita el archivo `.env.supabase` con tus credenciales de Supabase:

```
SUPABASE_HOST=db.supabase.com
SUPABASE_PORT=5432
SUPABASE_USER=postgres
SUPABASE_PASSWORD=tu_contraseña
SUPABASE_DATABASE=postgres
SUPABASE_SSL=true
```

Estas credenciales se pueden obtener desde el panel de control de Supabase, en la sección de "Database".

### 2. Actualizar el servidor para usar Supabase

Ejecuta el script:

```powershell
node actualizar-servidor-supabase.js
```

Este script modifica `servidor-ultra-definitivo-comments.js` para usar la configuración de Supabase en lugar de Railway.

### 3. Inicializar la base de datos en Supabase

Ejecuta:

```powershell
node init-supabase-db.js
```

Este script:
- Crea las tablas necesarias en Supabase
- Inserta 49 historias de prueba
- Agrega 3 comentarios por historia
- Configura registros de interacciones (likes, visualizaciones)

### 4. Ejecutar el servidor con Supabase

Ejecuta:

```powershell
./ejecutar-servidor-comentarios-supabase.ps1
```

Este script automatiza todo el proceso:
- Verifica las configuraciones necesarias
- Actualiza el servidor para usar Supabase
- Ofrece inicializar la base de datos
- Inicia el servidor conectado a Supabase

## Estructura de la Base de Datos

La base de datos en Supabase mantiene la misma estructura:

1. **Tabla `historias`**:
   - id (SERIAL PRIMARY KEY)
   - titulo (VARCHAR)
   - contenido (TEXT)
   - autor (VARCHAR)
   - categoria (VARCHAR)
   - fecha (TIMESTAMP)
   - activo (BOOLEAN)

2. **Tabla `comentarios`**:
   - id (SERIAL PRIMARY KEY)
   - historia_id (INTEGER, FK)
   - autor (VARCHAR)
   - contenido (TEXT)
   - fecha (TIMESTAMP)
   - activo (BOOLEAN)

3. **Tabla `story_interactions`**:
   - id (SERIAL PRIMARY KEY)
   - historia_id (INTEGER, FK)
   - likes (INTEGER)
   - views (INTEGER)

## Solución de Problemas

### Error de conexión a Supabase

Si encuentras errores de conexión:

1. Verifica que las credenciales en `.env.supabase` sean correctas
2. Confirma que la IP desde donde te conectas esté en la lista blanca de Supabase
3. Comprueba la configuración SSL (debe estar habilitada)

### Error al inicializar la base de datos

Si el script `init-supabase-db.js` falla:

1. Verifica si las tablas ya existen y si necesitan ser eliminadas primero
2. Comprueba los permisos del usuario de la base de datos
3. Revisa los logs para identificar problemas específicos de SQL

## Ventajas de esta Migración

1. **Mayor confiabilidad**: La conexión a Supabase es más estable
2. **Menos código de infraestructura**: Supabase gestiona muchos aspectos de forma automática
3. **Mejor rendimiento**: Supabase está optimizado para PostgreSQL
4. **Facilidad de mantenimiento**: Panel de administración visual para gestionar datos
5. **Mejor integración con el frontend**: Posibilidad de usar APIs de Supabase en el futuro

## Próximos Pasos

1. Actualizar la documentación del proyecto
2. Considerar el uso de características adicionales de Supabase (autenticación, almacenamiento)
3. Implementar tests automatizados para las conexiones a la base de datos
4. Actualizar scripts de CI/CD para el nuevo flujo con Supabase
5. Monitorizar el rendimiento de la aplicación con la nueva configuración
