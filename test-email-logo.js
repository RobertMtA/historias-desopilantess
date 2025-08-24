const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Crear una función para probar el envío de correos
async function testSendEmail() {
    try {
        // Leer la configuración del transportador
        const transporterConfig = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.GMAIL_EMAIL || 'tu-correo@gmail.com',
                pass: process.env.GMAIL_APP_PASSWORD || 'tu-contraseña-app'
            }
        };

        // Crear el transportador
        const transporter = nodemailer.createTransport(transporterConfig);

        // Verificar conexión
        await transporter.verify();
        console.log('✅ Conexión SMTP verificada correctamente');

        // Leer logo desde archivo
        const logoPath = path.join(__dirname, 'api-railway', 'logo-email-base64.txt');
        let logoBase64;
        
        if (fs.existsSync(logoPath)) {
            logoBase64 = fs.readFileSync(logoPath, 'utf8');
            console.log('✅ Logo cargado desde archivo');
        } else {
            console.log('⚠️ Archivo de logo no encontrado');
            // Logo alternativo por defecto como respaldo
            logoBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA1MTIgNTEyJyB3aWR0aD0nMTIwJyBoZWlnaHQ9JzEyMCc+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9J2JnR3JhZGllbnQnIHgxPScwJScgeTE9JzAlJyB4Mj0nMTAwJScgeTI9JzEwMCUnPgogICAgICA8c3RvcCBvZmZzZXQ9JzAlJyBzdHlsZT0nc3RvcC1jb2xvcjojMWU0MGFmO3N0b3Atb3BhY2l0eToxJyAvPgogICAgICA8c3RvcCBvZmZzZXQ9JzUwJScgc3R5bGU9J3N0b3AtY29sb3I6IzYzNjZmMTtzdG9wLW9wYWNpdHk6MScgLz4KICAgICAgPHN0b3Agb2Zmc2V0PScxMDAlJyBzdHlsZT0nc3RvcC1jb2xvcjojZWM0ODk5O3N0b3Atb3BhY2l0eToxJyAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9JzUxMicgaGVpZ2h0PSc1MTInIGZpbGw9J3VybCgjYmdHcmFkaWVudCknIHJ4PSc4MCcgcnk9JzgwJy8+CiAgPGcgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMjU2LCAyMDApJz4KICAgIDxwYXRoIGQ9J00tMTIwIC02MCBRLTEyMCAtODAsIC0xMDAgLTgwIEwxMDAgLTgwIFExMjAgLTgwLCAxMjAgLTYwIEwxMjAgNDAgUTEyMCA2MCwgMTAwIDYwIEwtMjAgNjAgTC02MCAxMDAgTC00MCA2MCBMLTEwMCA2MCBRLTEyMCA2MCwgLTEyMCA0MCBaJyBmaWxsPSd3aGl0ZScvPgogICAgPHRleHQgeD0nMCcgeT0nMTAnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZvbnQtZmFtaWx5PSdBcmlhbCBCbGFjaywgc2Fucy1zZXJpZicgZm9udC1zaXplPSc3MicgZm9udC13ZWlnaHQ9JzkwMCcgZmlsbD0nIzFlNDBhZic+SEQ8L3RleHQ+CiAgPC9nPgo8L3N2Zz4=';
        }

        // Crear plantilla HTML para el correo de prueba
        const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Prueba de Email con Logo</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding: 20px;
                    background: linear-gradient(135deg, #1e40af 0%, #6366f1 50%, #ec4899 100%);
                    border-radius: 8px;
                    color: white;
                }
                .logo-container {
                    margin-bottom: 15px;
                }
                .content {
                    background-color: #f9f9f9;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                .footer {
                    font-size: 12px;
                    text-align: center;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    <img src="${logoBase64}" alt="Historias Desopilantes Logo" width="120" height="120" style="margin: 0 auto; display: block;">
                </div>
                <h1>📧 Prueba de Email con Logo</h1>
                <p>Historias Desopilantes</p>
            </div>
            
            <div class="content">
                <h2>Este es un correo de prueba</h2>
                <p>Este correo se envía para comprobar que el logo de Historias Desopilantes se muestra correctamente.</p>
                <p>Si puedes ver el logo en la cabecera de este correo, significa que la configuración de base64 está funcionando correctamente.</p>
                <p>Fecha y hora de prueba: ${new Date().toLocaleString('es-AR')}</p>
            </div>
            
            <div class="footer">
                <p>© ${new Date().getFullYear()} Historias Desopilantes - Todos los derechos reservados</p>
            </div>
        </body>
        </html>
        `;

        // Configurar opciones del correo
        const mailOptions = {
            from: '"Historias Desopilantes" <test@historias-desopilantes.web.app>',
            to: "tu-correo@gmail.com", // Reemplaza con tu correo para la prueba
            subject: "🧪 Prueba de Email con Logo - Historias Desopilantes",
            html: htmlTemplate,
        };

        // Enviar el correo de prueba
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Correo de prueba enviado exitosamente');
        console.log('📧 ID del mensaje:', info.messageId);
        console.log('📧 URL de vista previa:', nodemailer.getTestMessageUrl(info));

    } catch (error) {
        console.error('❌ Error al enviar el correo de prueba:', error);
    }
}

// Ejecutar la función de prueba
testSendEmail().then(() => {
    console.log('Prueba completada');
}).catch(error => {
    console.error('Error en prueba:', error);
});
