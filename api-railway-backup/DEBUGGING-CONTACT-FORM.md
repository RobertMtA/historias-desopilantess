# Guía de Depuración para Formulario de Contacto

Este documento proporciona información detallada sobre cómo depurar problemas con el formulario de contacto y el sistema de correo electrónico de Historias Desopilantes.

## Registro de Problemas Identificados

1. **Logo no visible en emails**: Se agregó soporte para incrustar el logo como base64 en los correos electrónicos.

2. **CORS errors**: Se actualizó la configuración CORS para permitir solicitudes desde todos los dominios relacionados con el sitio web, incluyendo variantes con errores tipográficos.

3. **Parámetros de la API**: Se agregó soporte para nombres de parámetros tanto en español como en inglés para el endpoint de contacto.

4. **Logging mejorado**: Se agregó registro detallado para facilitar la depuración de problemas.

## Pasos para Depurar el Sistema de Correo

### 1. Verificar credenciales SMTP en Railway

Railway almacena variables de entorno para la configuración SMTP:

```
GMAIL_EMAIL=tu-correo@gmail.com
GMAIL_APP_PASSWORD=tu-contraseña-app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

### 2. Probar el envío de correos localmente

Ejecutar el script de prueba:

```bash
node test-email-logo.js
```

Este script verifica:
- Conexión con el servidor SMTP
- Carga correcta del logo base64
- Envío de correo con el logo incrustado

### 3. Verificar el registro de Railway

Para identificar errores en producción:

```bash
railway logs
```

Buscar mensajes relacionados con:
- Errores de conexión SMTP
- Carga del archivo del logo
- Validación del formulario de contacto

### 4. Depurar problemas de validación de formulario

El backend ahora registra más información cuando ocurre un error de validación:

```javascript
console.log('❌ Validación fallida en formulario de contacto:', { 
  tieneNombre: !!nombre, 
  tieneEmail: !!email, 
  tieneMensaje: !!mensaje,
  bodyRecibido: req.body 
});
```

### 5. Verificar el contenido del archivo logo-email-base64.txt

El logo debe estar correctamente formateado como data URI:

```
data:image/svg+xml;base64,PHN2Z...
```

## Solución de Problemas Comunes

1. **Error "Cannot read properties of undefined"**: Asegúrate de que los campos del formulario estén correctamente nombrados (usando nombre/name, email, mensaje/message).

2. **Error CORS**: Verifica que el dominio del frontend esté incluido en la lista de corsOptions.

3. **Error 400 Bad Request**: Revisa los registros del servidor para ver qué campos faltan en la solicitud.

4. **Logo no visible**: Asegúrate de que el archivo logo-email-base64.txt exista en la carpeta api-railway.

5. **Error SMTP**: Verifica las credenciales de Gmail y confirma que la contraseña de aplicación esté configurada correctamente.

## Actualizaciones de Código Recientes

- Se mejoró el registro en el endpoint `/api/contact`
- Se agregó registro para datos procesados del formulario
- Se mejoró la gestión de errores y validación
- Se verificó la carga del archivo de logo en la inicialización

## Próximos Pasos

1. Validar la funcionalidad con el frontend actualizado
2. Agregar monitoreo para errores de envío de correo
3. Configurar notificaciones para fallos en el sistema de contacto
