# Actualización del Frontend para Supabase

Este documento describe las modificaciones necesarias en el frontend para que funcione correctamente con el backend actualizado que utiliza Supabase en lugar de PostgreSQL en Railway.

## Cambios Necesarios

Buenas noticias: **No se requieren cambios en el código del frontend**.

La migración de PostgreSQL en Railway a Supabase se ha realizado manteniendo la misma estructura de API y endpoints. Esto significa que el frontend seguirá funcionando exactamente igual que antes, sin necesidad de modificar ninguna URL o lógica de comunicación.

## Comprobaciones Recomendadas

Aunque no se requieren cambios, es recomendable verificar:

1. **Funcionamiento de comentarios**: Confirmar que los comentarios se muestran correctamente en todas las páginas de historias.
2. **Formulario de comentarios**: Verificar que se pueden enviar nuevos comentarios sin errores.
3. **Tiempos de carga**: Comprobar que la carga de comentarios mantiene un rendimiento adecuado.

## Configuración Específica (opcional)

Si en el futuro deseas aprovechar más características de Supabase directamente desde el frontend (como autenticación, storage, etc.), podrías considerar:

1. Instalar el cliente de Supabase:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Configurar el cliente:
   ```javascript
   import { createClient } from '@supabase/supabase-js';

   const supabaseUrl = 'https://hxxcdxddueexcqvfhiti.supabase.co';
   const supabaseKey = 'tu-clave-publica-de-supabase';
   
   const supabase = createClient(supabaseUrl, supabaseKey);
   ```

3. Usar el cliente para operaciones directas:
   ```javascript
   // Ejemplo: obtener comentarios directamente
   const { data, error } = await supabase
     .from('comentarios')
     .select('*')
     .eq('historia_id', storiaId);
   ```

Sin embargo, estos cambios son opcionales y solo serían necesarios si decides implementar características adicionales en el futuro.

## Despliegue del Frontend

Para asegurarte de que el frontend está utilizando la última versión del backend:

1. Compila el proyecto:
   ```bash
   npm run build
   ```

2. Despliega en Firebase:
   ```bash
   firebase deploy
   ```

## Solución de Problemas

Si encuentras problemas con los comentarios después de la migración:

1. Abre la consola del navegador para ver si hay errores de API
2. Verifica que la URL del API en el frontend apunta al servidor correcto
3. Comprueba que CORS está configurado correctamente en el backend
4. Asegúrate de que los endpoints del API responden como se espera usando herramientas como Postman
