# Solución para el error de autenticación en Supabase

## Problema identificado

Al intentar conectar con Supabase, obtenemos el error:

```
❌ Error al conectar a Supabase PostgreSQL: password authentication failed for user "postgres"
```

Esto significa que el host (db.hxxcdxddueexcqvfhiti.supabase.co) es correcto, pero la contraseña no.

## Pasos para solucionar

1. **Encuentra la contraseña correcta de Supabase**:
   - Inicia sesión en tu panel de control de Supabase: https://supabase.com/dashboard
   - Selecciona tu proyecto (con ID: hxxcdxddueexcqvfhiti)
   - Ve a "Configuración" → "Database"
   - Busca la contraseña en la sección "Connection Info" o "Connection String"
   - La contraseña también podría estar en "Project Settings" → "Database Password"

2. **Actualiza el archivo .env.supabase**:
   - Reemplaza "Supabase2025" por la contraseña real en todas las URLs
   - Asegúrate de no incluir caracteres especiales sin escapar correctamente

3. **Verifica que la conexión funciona**:
   - Ejecuta `node probar-conexion-supabase.js`
   - Si funciona, continúa con `node init-supabase-db.js`

## Ejemplo de cómo debe quedar el archivo .env.supabase

```
# Configuración de Supabase PostgreSQL
# Configuración simplificada para una conexión más fiable

# URL General (para todos los usos)
SUPABASE_DB_URL=postgresql://postgres:TU_CONTRASEÑA_REAL@db.hxxcdxddueexcqvfhiti.supabase.co:5432/postgres

# Conexión directa (recomendada para aplicaciones persistentes, VMs, contenedores)
SUPABASE_DIRECT_URL=postgresql://postgres:TU_CONTRASEÑA_REAL@db.hxxcdxddueexcqvfhiti.supabase.co:5432/postgres

# Agrupador de transacciones (recomendado para funciones sin servidor, conexiones breves)
SUPABASE_TRANSACTION_POOLER_URL=postgresql://postgres:TU_CONTRASEÑA_REAL@db.hxxcdxddueexcqvfhiti.supabase.co:5432/postgres

# Conexión simplificada (alternativa si las anteriores no funcionan)
SUPABASE_SIMPLIFIED_URL=postgres://postgres:TU_CONTRASEÑA_REAL@db.hxxcdxddueexcqvfhiti.supabase.co:5432/postgres
```

## Notas adicionales

- Si la contraseña contiene caracteres especiales, podrían necesitar ser codificados en la URL
- Asegúrate de que la IP desde donde te conectas esté en la lista blanca de Supabase
- Verifica que la política de acceso en Supabase permita conexiones desde tu entorno
