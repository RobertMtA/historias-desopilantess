const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Leer logo desde archivo si existe, o usar un valor por defecto
let logoBase64;
try {
  const logoPath = path.join(__dirname, '..', 'logo-email-base64.txt');
  if (fs.existsSync(logoPath)) {
    logoBase64 = fs.readFileSync(logoPath, 'utf8');
    console.log('✅ Logo cargado desde archivo');
  } else {
    console.log('⚠️ Archivo de logo no encontrado, usando logo por defecto');
    logoBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA1MTIgNTEyJyB3aWR0aD0nMTIwJyBoZWlnaHQ9JzEyMCc+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9J2JnR3JhZGllbnQnIHgxPScwJScgeTE9JzAlJyB4Mj0nMTAwJScgeTI9JzEwMCUnPgogICAgICA8c3RvcCBvZmZzZXQ9JzAlJyBzdHlsZT0nc3RvcC1jb2xvcjojMWU0MGFmO3N0b3Atb3BhY2l0eToxJyAvPgogICAgICA8c3RvcCBvZmZzZXQ9JzUwJScgc3R5bGU9J3N0b3AtY29sb3I6IzYzNjZmMTtzdG9wLW9wYWNpdHk6MScgLz4KICAgICAgPHN0b3Agb2Zmc2V0PScxMDAlJyBzdHlsZT0nc3RvcC1jb2xvcjojZWM0ODk5O3N0b3Atb3BhY2l0eToxJyAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9JzUxMicgaGVpZ2h0PSc1MTInIGZpbGw9J3VybCgjYmdHcmFkaWVudCknIHJ4PSc4MCcgcnk9JzgwJy8+CiAgPGcgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMjU2LCAyMDApJz4KICAgIDxwYXRoIGQ9J00tMTIwIC02MCBRLTEyMCAtODAsIC0xMDAgLTgwIEwxMDAgLTgwIFExMjAgLTgwLCAxMjAgLTYwIEwxMjAgNDAgUTEyMCA2MCwgMTAwIDYwIEwtMjAgNjAgTC02MCAxMDAgTC00MCA2MCBMLTEwMCA2MCBRLTEyMCA2MCwgLTEyMCA0MCBaJyBmaWxsPSd3aGl0ZScvPgogICAgPHRleHQgeD0nMCcgeT0nMTAnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZvbnQtZmFtaWx5PSdBcmlhbCBCbGFjaywgc2Fucy1zZXJpZicgZm9udC1zaXplPSc3MicgZm9udC13ZWlnaHQ9JzkwMCcgZmlsbD0nIzFlNDBhZic+SEQ8L3RleHQ+CiAgPC9nPgo8L3N2Zz4=';
  }
} catch (error) {
  console.error('Error cargando logo:', error);
  logoBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA1MTIgNTEyJyB3aWR0aD0nMTIwJyBoZWlnaHQ9JzEyMCc+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9J2JnR3JhZGllbnQnIHgxPScwJScgeTE9JzAlJyB4Mj0nMTAwJScgeTI9JzEwMCUnPgogICAgICA8c3RvcCBvZmZzZXQ9JzAlJyBzdHlsZT0nc3RvcC1jb2xvcjojMWU0MGFmO3N0b3Atb3BhY2l0eToxJyAvPgogICAgICA8c3RvcCBvZmZzZXQ9JzUwJScgc3R5bGU9J3N0b3AtY29sb3I6IzYzNjZmMTtzdG9wLW9wYWNpdHk6MScgLz4KICAgICAgPHN0b3Agb2Zmc2V0PScxMDAlJyBzdHlsZT0nc3RvcC1jb2xvcjojZWM0ODk5O3N0b3Atb3BhY2l0eToxJyAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9JzUxMicgaGVpZ2h0PSc1MTInIGZpbGw9J3VybCgjYmdHcmFkaWVudCknIHJ4PSc4MCcgcnk9JzgwJy8+CiAgPGcgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMjU2LCAyMDApJz4KICAgIDxwYXRoIGQ9J00tMTIwIC02MCBRLTEyMCAtODAsIC0xMDAgLTgwIEwxMDAgLTgwIFExMjAgLTgwLCAxMjAgLTYwIEwxMjAgNDAgUTEyMCA2MCwgMTAwIDYwIEwtMjAgNjAgTC02MCAxMDAgTC00MCA2MCBMLTEwMCA2MCBRLTEyMCA2MCwgLTEyMCA0MCBaJyBmaWxsPSd3aGl0ZScvPgogICAgPHRleHQgeD0nMCcgeT0nMTAnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZvbnQtZmFtaWx5PSdBcmlhbCBCbGFjaywgc2Fucy1zZXJpZicgZm9udC1zaXplPSc3MicgZm9udC13ZWlnaHQ9JzkwMCcgZmlsbD0nIzFlNDBhZic+SEQ8L3RleHQ+CiAgPC9nPgo8L3N2Zz4=';
}

// Configuración del transportador de Gmail con configuración Railway-friendly
const createTransporter = () => {
  // Configuración específica para Railway con variables de entorno dedicadas
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // STARTTLS
    auth: {
      user: process.env.GMAIL_EMAIL || 'robertogaona1985@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD || 'rvpg mkjr prpk okvz'
    },
    connectionTimeout: 60000, // 60 segundos
    greetingTimeout: 30000,   // 30 segundos
    socketTimeout: 60000,     // 60 segundos
    debug: process.env.NODE_ENV !== 'production',
    logger: true,
    tls: {
      rejectUnauthorized: false
    }
  };
  
  console.log('📧 Configuración SMTP:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
    hasPassword: !!config.auth.pass
  });
  
  return nodemailer.createTransport(config);
};

// Función para enviar email de notificación
const sendContactEmail = async (contactData) => {
  try {
    const transporter = createTransporter();
    
    const { nombre, email, asunto, mensaje, tipoConsulta } = contactData;
    
    console.log('📧 Preparando email para admin...');
    
    // Verificar configuración
    const emailUser = process.env.GMAIL_EMAIL || 'robertogaona1985@gmail.com';
    const emailPass = process.env.GMAIL_APP_PASSWORD || 'rvpg mkjr prpk okvz';
    
    console.log('📧 Config verificada:', { 
      user: emailUser, 
      hasPassword: !!emailPass 
    });
    
    // Template del email
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuevo mensaje de contacto</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .field { margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #667eea; }
            .field-label { font-weight: bold; color: #667eea; font-size: 14px; text-transform: uppercase; margin-bottom: 5px; }
            .field-value { font-size: 16px; line-height: 1.5; }
            .tipo-consulta { display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
            .historia { background: #e8f5e8; color: #2d5a27; }
            .pregunta { background: #fff3cd; color: #856404; }
            .sugerencia { background: #d4edda; color: #155724; }
            .general { background: #d1ecf1; color: #0c5460; }
            .footer { margin-top: 30px; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; }
            .mensaje-content { background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6; font-style: italic; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="text-align: center; margin-bottom: 15px;">
                    <img src="${logoBase64}" alt="Historias Desopilantes Logo" width="120" height="120" style="margin: 0 auto; display: block;">
                </div>
                <h1>📧 Nuevo Mensaje de Contacto</h1>
                <p>Historias Desopilantes</p>
            </div>
            
            <div class="content">
                <div class="field">
                    <div class="field-label">👤 Nombre del remitente</div>
                    <div class="field-value">${nombre}</div>
                </div>
                
                <div class="field">
                    <div class="field-label">📧 Email de contacto</div>
                    <div class="field-value"><a href="mailto:${email}">${email}</a></div>
                </div>
                
                <div class="field">
                    <div class="field-label">📋 Tipo de consulta</div>
                    <div class="field-value">
                        <span class="tipo-consulta ${tipoConsulta}">
                            ${tipoConsulta === 'historia' ? '📖 Historia' : 
                              tipoConsulta === 'pregunta' ? '❓ Pregunta' : 
                              tipoConsulta === 'sugerencia' ? '💡 Sugerencia' : '💬 General'}
                        </span>
                    </div>
                </div>
                
                <div class="field">
                    <div class="field-label">📌 Asunto</div>
                    <div class="field-value">${asunto}</div>
                </div>
                
                <div class="field">
                    <div class="field-label">💬 Mensaje</div>
                    <div class="field-value">
                        <div class="mensaje-content">${mensaje.replace(/\n/g, '<br>')}</div>
                    </div>
                </div>
                
                <div class="field">
                    <div class="field-label">⏰ Fecha y hora</div>
                    <div class="field-value">${new Date().toLocaleString('es-AR', {
                        timeZone: 'America/Argentina/Buenos_Aires',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</div>
                </div>
            </div>
            
            <div class="footer">
                <p>Este mensaje fue enviado desde el formulario de contacto de <strong>Historias Desopilantes</strong></p>
                <p>Para responder, simplemente responde a este email o contacta directamente a: ${email}</p>
                <div style="margin-top: 15px; border-top: 1px solid #ddd; padding-top: 15px;">
                    <p style="font-size: 12px; color: #666;">© ${new Date().getFullYear()} Historias Desopilantes - Todos los derechos reservados</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"${nombre}" <${email}>`,
    to: process.env.GMAIL_EMAIL || 'robertogaona1985@gmail.com',
    subject: `[Historias Desopilantes] ${asunto}`,
    html: htmlTemplate,
    replyTo: email
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email admin enviado exitosamente:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error enviando email admin:', error);
    throw error; // Re-lanzar para que el catch exterior lo maneje
  }
} catch (error) {
  console.error('❌ Error general en sendContactEmail:', error);
  return { success: false, error: error.message };
}
};

// Función para enviar email de confirmación al usuario
const sendConfirmationEmail = async (contactData) => {
  try {
    const transporter = createTransporter();
    
    const { nombre, email, asunto } = contactData;
    
    console.log('📧 Preparando email de confirmación para:', email);
  
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mensaje recibido - Historias Desopilantes</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .message { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0; }
            .footer { margin-top: 30px; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; }
            .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="text-align: center; margin-bottom: 15px;">
                    <img src="${logoBase64}" alt="Historias Desopilantes Logo" width="120" height="120" style="margin: 0 auto; display: block;">
                </div>
                <h1>✅ ¡Mensaje Recibido!</h1>
                <p>Historias Desopilantes</p>
            </div>
            
            <div class="content">
                <div class="message">
                    <h2>¡Hola ${nombre}! 👋</h2>
                    <p>Hemos recibido tu mensaje con el asunto: <strong>"${asunto}"</strong></p>
                    <p>Te responderemos en un máximo de <strong>24 horas</strong>. ¡Gracias por contactarnos!</p>
                </div>
                
                <p>Mientras tanto, te invitamos a:</p>
                <ul>
                    <li>📖 Explorar nuestras <a href="#" style="color: #667eea;">historias más populares</a></li>
                    <li>🎬 Ver nuestra <a href="#" style="color: #667eea;">galería de videos</a></li>
                    <li>📱 Seguirnos en redes sociales para más contenido</li>
                </ul>
            </div>
            
            <div class="footer">
                <p><strong>Historias Desopilantes</strong></p>
                <p>Las historias más increíbles y divertidas del mundo</p>
                <div style="margin-top: 15px; border-top: 1px solid #ddd; padding-top: 15px;">
                    <p style="font-size: 12px; color: #666;">© ${new Date().getFullYear()} Historias Desopilantes - Todos los derechos reservados</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Historias Desopilantes" <${process.env.GMAIL_EMAIL || 'robertogaona1985@gmail.com'}>`,
    to: email,
    subject: `✅ Hemos recibido tu mensaje: ${asunto}`,
    html: htmlTemplate
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de confirmación enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error enviando email de confirmación:', error);
    throw error; // Re-lanzar para manejo exterior
  }
} catch (error) {
  console.error('❌ Error general en sendConfirmationEmail:', error);
  return { success: false, error: error.message };
}
};

module.exports = {
  sendContactEmail,
  sendConfirmationEmail
};
