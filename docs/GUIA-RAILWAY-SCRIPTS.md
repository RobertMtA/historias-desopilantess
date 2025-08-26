# Guía de Despliegue en Railway con PostgreSQL

Esta guía explica cómo usar los scripts actualizados para desplegar correctamente tu aplicación "Historias Desopilantes" en Railway con una base de datos PostgreSQL.

## Scripts disponibles

Hemos creado varios scripts para facilitarte el despliegue y la solución de problemas:

1. **deploy-railway-actualizado.ps1** - Script principal de despliegue actualizado para la versión actual de Railway CLI
2. **configurar-postgresql-railway.ps1** - Script para configurar correctamente las variables de entorno de PostgreSQL
3. **diagnostico-postgresql-railway.ps1** - Script para diagnosticar y solucionar problemas de conexión a PostgreSQL
4. **test-db-connection.js** - Script de Node.js que prueba la conexión a la base de datos

## Guía paso a paso

### 1. Despliegue inicial

Para hacer el despliegue inicial de tu aplicación:

1. Abre PowerShell y navega al directorio `api-railway`:

```powershell
cd api-railway
```

2. Ejecuta el script de despliegue actualizado:

```powershell
.\deploy-railway-actualizado.ps1
```

Este script te guiará a través del proceso de:
- Seleccionar proyecto y servicio
- Configurar variables de entorno para PostgreSQL
- Seleccionar la configuración de Docker y servidor
- Desplegar la aplicación

### 2. Configuración de PostgreSQL

Si necesitas configurar o actualizar las variables de PostgreSQL:

```powershell
.\configurar-postgresql-railway.ps1
```

Este script te permitirá:
- Configurar todas las variables necesarias para PostgreSQL
- Detectar automáticamente la configuración si usas un plugin de PostgreSQL en Railway
- Crear la cadena de conexión DATABASE_URL correctamente

### 3. Diagnóstico y solución de problemas

Si tienes problemas con la conexión a PostgreSQL:

```powershell
.\diagnostico-postgresql-railway.ps1
```

Este script te ayudará a:
- Identificar problemas comunes de conexión
- Aplicar soluciones automáticas para casos típicos
- Probar la conexión después de los cambios

## Problemas comunes y soluciones

### Error: getaddrinfo ENOTFOUND postgres.railway.internal

**Solución**: Configurar PGHOST como "localhost" en lugar de "postgres.railway.internal"

### Error: connect ENETUNREACH

**Solución**: 
1. Verificar que PostgreSQL está en el mismo proyecto de Railway
2. Usar "localhost" como host
3. Comprobar que el plugin de PostgreSQL está activo

### Error: password authentication failed

**Solución**:
1. Verificar y actualizar las contraseñas en las variables PGPASSWORD y POSTGRES_PASSWORD
2. Actualizar la contraseña en DATABASE_URL

## Mejores prácticas para Railway

1. **Usa localhost para conexiones internas**: Cuando tu servicio y PostgreSQL están en el mismo proyecto de Railway, usa "localhost" como host.

2. **Proporciona todas las variables**: Configura tanto DATABASE_URL como las variables individuales (PGUSER, PGPASSWORD, etc.).

3. **Inicializa la base de datos al arrancar**: Usa el servidor con auto-inicialización (server-auto-init.js) para crear las tablas necesarias automáticamente.

4. **Usa el plugin de PostgreSQL**: Railway proporciona un plugin fácil de configurar para PostgreSQL que configura automáticamente las variables de entorno.

## Recursos adicionales

- [Documentación oficial de Railway](https://docs.railway.app/)
- [Documentación de PostgreSQL en Railway](https://docs.railway.app/databases/postgresql)
- [Guía completa en POSTGRESQL-RAILWAY-GUIDE.md](./api-railway/POSTGRESQL-RAILWAY-GUIDE.md)

## Comandos útiles de Railway

```powershell
# Ver logs del servicio
railway logs

# Ver variables de entorno
railway variables

# Ejecutar un comando en el entorno de Railway
railway run <comando>

# Abrir la URL del servicio
railway open

# Redeplogar la aplicación
railway up
```
