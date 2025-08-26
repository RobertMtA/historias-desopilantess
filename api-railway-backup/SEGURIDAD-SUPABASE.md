# Guía de Seguridad para Supabase en Historias Desopilantes

## Problema detectado

Se han identificado vulnerabilidades de seguridad en la base de datos de Supabase:

- Las tablas `stories`, `comments`, `likes` y `subscribers` son públicamente accesibles
- No se ha configurado Row Level Security (RLS) en estas tablas
- Esto permite que cualquier usuario pueda leer, insertar, modificar o eliminar datos sin restricciones

## ¿Qué es Row Level Security (RLS)?

Row Level Security es una característica de PostgreSQL que permite controlar qué filas pueden ser accedidas por diferentes usuarios. En lugar de conceder permisos a nivel de tabla, RLS permite definir políticas que determinan qué filas específicas pueden ser leídas, insertadas, actualizadas o eliminadas por cada usuario.

## ¿Por qué es importante?

Sin RLS habilitado:
- Cualquier usuario podría acceder a todos los datos
- Los usuarios podrían modificar información que no les pertenece
- No hay separación entre datos de diferentes usuarios
- La seguridad depende completamente de la aplicación frontend (inseguro)

## Solución implementada

Se ha creado un script (`habilitar-rls-supabase.js`) que:

1. Habilita RLS en cada una de las tablas vulnerables
2. Crea políticas de seguridad específicas para cada tabla
3. Verifica la correcta aplicación de estas políticas

### Políticas implementadas

#### Tabla `stories`:
- **SELECT**: Todos los usuarios (incluyendo anónimos) pueden ver todas las historias
- **INSERT**: Solo usuarios autenticados pueden crear historias
- **UPDATE/DELETE**: Solo el autor de una historia puede modificarla o eliminarla

#### Tabla `comments`:
- **SELECT**: Todos los usuarios pueden ver todos los comentarios
- **INSERT**: Solo usuarios autenticados pueden crear comentarios
- **UPDATE/DELETE**: Solo el autor de un comentario puede modificarlo o eliminarlo

#### Tabla `likes`:
- **SELECT**: Todos los usuarios pueden ver todos los likes
- **INSERT**: Solo usuarios autenticados pueden dar like
- **UPDATE/DELETE**: Solo el usuario que dio like puede quitarlo

#### Tabla `subscribers`:
- **SELECT**: Usuarios solo pueden ver su propia información (y administradores)
- **INSERT**: Usuarios autenticados y anónimos pueden suscribirse
- **UPDATE/DELETE**: Usuarios solo pueden modificar su propia suscripción (y administradores)

## Cómo verificar la configuración

1. Accede al dashboard de Supabase
2. Navega a la sección "Table Editor"
3. Selecciona cada tabla y comprueba que "RLS Enabled" está activado
4. En la pestaña "Policies" verifica que existen políticas para cada operación (SELECT, INSERT, UPDATE, DELETE)

## Consideraciones para desarrollo

Al tener RLS activado, recuerda:

1. Las solicitudes a Supabase desde el frontend deben incluir el token de autenticación:
   ```javascript
   const { data, error } = await supabase
     .from('stories')
     .select()
     .eq('id', storyId);
   ```

2. Para operaciones privilegiadas (como administración), utiliza la clave `service_role` en el backend:
   ```javascript
   // Solo en código del servidor, nunca en el frontend
   const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
   ```

3. Al probar la API, asegúrate de estar autenticado correctamente

## Consultas lentas detectadas

Las consultas lentas identificadas en el dashboard de Supabase son principalmente operaciones del sistema interno de Supabase y no requieren optimización por tu parte. Las consultas más lentas son:

- Selección de zonas horarias: 0.12s (59 llamadas)
- Consultas de metadatos: ~0.30s

Estas consultas son ejecutadas por Supabase internamente y no afectan significativamente el rendimiento de tu aplicación.

## Próximos pasos recomendados

1. **Autenticación**: Asegúrate de que tu aplicación utiliza correctamente el sistema de autenticación de Supabase
2. **Pruebas**: Verifica que todas las funciones de la aplicación siguen funcionando con RLS habilitado
3. **Monitoreo**: Configura alertas en Supabase para detectar cualquier intento de acceso no autorizado
4. **Backups**: Asegúrate de tener una estrategia de respaldo de datos configurada

## Recursos adicionales

- [Documentación oficial de RLS en Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Mejores prácticas de seguridad para Supabase](https://supabase.com/docs/guides/auth/managing-user-data)
- [Depuración de políticas RLS](https://supabase.com/docs/guides/auth/row-level-security#debugging-policies)
