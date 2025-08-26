# Configuración de Emails para Historias Desopilantes

## Problema: Autenticación de Gmail

Actualmente estás recibiendo el error:
```
Username and Password not accepted. For more information, go to https://support.google.com/mail/?p=BadCredentials
```

Esto ocurre porque Google ha desactivado la opción de "Permitir aplicaciones menos seguras" y ahora requiere que uses contraseñas de aplicación.

## Solución: Configurar Contraseña de Aplicación

1. Ve a https://myaccount.google.com/
2. Selecciona "Seguridad" en el menú lateral
3. En la sección "Acceso a Google", busca "Verificación en 2 pasos" y actívala si no lo está
4. Una vez activada, busca "Contraseñas de aplicación"
5. Selecciona "Crear una nueva contraseña de aplicación"
6. Elige "Otra (nombre personalizado)" y escribe "Historias Desopilantes"
7. Copia la contraseña generada (será algo como "abcd efgh ijkl mnop")
8. Actualiza la contraseña en tu archivo de configuración

## Pasos para Actualizar la Contraseña

1. Abre el archivo `server/config/emailConfig.js`
2. Busca esta línea:
   ```javascript
   pass: process.env.GMAIL_APP_PASSWORD || 'rvpg mkjr prpk okvz'
   ```
3. Reemplaza `'rvpg mkjr prpk okvz'` con tu nueva contraseña de aplicación
4. Para mayor seguridad, usa variables de entorno:
   - Si estás usando Railway o similar, configura la variable `GMAIL_APP_PASSWORD`
   - Si estás en desarrollo local, crea un archivo `.env` con:
     ```
     GMAIL_EMAIL=tu@gmail.com
     GMAIL_APP_PASSWORD=tu-contraseña-de-aplicación
     ```

## Probando la Configuración

Una vez actualizada la contraseña, ejecuta:
```
node test-emails-logo.js
```

Si funciona correctamente, deberías ver mensajes de éxito y los emails se enviarán con el logo.

## Implementación del Logo en Emails

El logo ahora está configurado en los emails tanto para el administrador como para los usuarios. El archivo `logo-email-base64.txt` contiene el logo en formato base64 que se usa en los emails.

Si necesitas actualizar el logo, simplemente ejecuta `node generate-logo-base64.js` y se generará un nuevo archivo con el logo en base64.
