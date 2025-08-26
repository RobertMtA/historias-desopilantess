# Guía para obtener tus credenciales de Supabase

Para conectar tu aplicación "Historias Desopilantes" con Supabase, necesitas obtener las credenciales correctas y configurarlas en el archivo `.env.supabase`. Sigue estos pasos:

## 1. Accede a tu panel de control de Supabase

- Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Inicia sesión con tu cuenta
- Selecciona tu proyecto (con ID: hxxcdxddueexcqvfhiti)

## 2. Obtén las credenciales de conexión

### Método 1: Desde la sección de Base de Datos
1. En el menú lateral, haz clic en **Configuración** (Settings)
2. Selecciona **Database**
3. Desplázate hasta la sección **Connection Info** o **Connection Pooling**
4. Aquí encontrarás los datos de conexión:
   - Host: db.hxxcdxddueexcqvfhiti.supabase.co
   - Puerto: 5432
   - Base de datos: postgres
   - Usuario: postgres
   - Contraseña: [Tu contraseña]

### Método 2: Desde Project Settings
1. En el menú lateral, haz clic en **Project Settings**
2. Busca la sección **Database Password**
3. Copia la contraseña mostrada

## 3. Actualiza tu archivo `.env.supabase`

Una vez que tengas la contraseña correcta, actualiza el archivo `.env.supabase` reemplazando "Supabase2025" con tu contraseña real en todas las URLs:

```bash
# Configuración de Supabase PostgreSQL
# Configuración simplificada para una conexión más fiable

# URL General (para todos los usos)
SUPABASE_DB_URL=postgresql://postgres:TU_CONTRASEÑA_REAL@db.hxxcdxddueexcqvfhiti.supabase.co:5432/postgres

# Conexión directa (recomendada para aplicaciones persistentes, VMs, contenedores)
SUPABASE_DIRECT_URL=postgresql://postgres:TU_CONTRASEÑA_REAL@db.hxxcdxddueexcqvfhiti.supabase.co:5432/postgres
```

## 4. Considera la lista blanca de IP

Si sigues teniendo problemas de conexión después de actualizar la contraseña:

1. Ve a **Database Settings** en Supabase
2. Busca la sección **Network Restrictions** o **IP Allow List**
3. Añade tu dirección IP actual a la lista blanca

## 5. Prueba la conexión

Después de actualizar las credenciales, ejecuta:

```bash
node probar-conexion-supabase.js
```

Si la conexión funciona, continúa con el despliegue completo:

```bash
.\desplegar-completo-supabase.ps1
```

## Solución de problemas

### Error: password authentication failed
- La contraseña en `.env.supabase` no coincide con la configurada en Supabase
- Solución: Obtén la contraseña correcta del panel de control de Supabase

### Error: getaddrinfo ENOTFOUND
- El hostname es incorrecto o no es accesible
- Solución: Verifica que el ID del proyecto sea correcto en las URLs

### Error: timeout
- Tu IP podría estar bloqueada o hay problemas de red
- Solución: Añade tu IP a la lista blanca en la configuración de Supabase
