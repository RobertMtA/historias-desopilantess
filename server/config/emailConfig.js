const nodemailer = require('nodemailer');

// Configuración del transportador de Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL || 'robertogaona1985@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD || 'rvpg mkjr prpk okvz'
    }
  });
};

// Función para enviar email de notificación
const sendContactEmail = async (contactData) => {
  const transporter = createTransporter();
  
  const { nombre, email, asunto, mensaje, tipoConsulta } = contactData;
  
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
    console.log('Email enviado exitosamente:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error: error.message };
  }
};

// Función para enviar email de confirmación al usuario
const sendConfirmationEmail = async (contactData) => {
  const transporter = createTransporter();
  
  const { nombre, email, asunto } = contactData;
  
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
    console.log('Email de confirmación enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error enviando email de confirmación:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendContactEmail,
  sendConfirmationEmail
};
