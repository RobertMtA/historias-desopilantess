require('dotenv').config();

console.log('Variables de entorno cargadas:');
console.log('GMAIL_EMAIL:', process.env.GMAIL_EMAIL);
console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '***CONFIGURADA***' : 'NO CONFIGURADA');

const { sendContactEmail, sendConfirmationEmail } = require('./config/emailConfig');

const testData = {
  nombre: 'Roberto Gaona',
  email: 'test@example.com',
  asunto: 'Prueba del sistema de emails',
  mensaje: 'Este es un mensaje de prueba para verificar que el sistema de emails funciona correctamente.',
  tipoConsulta: 'pregunta'
};

console.log('\n🧪 Iniciando prueba de email...');

sendContactEmail(testData)
  .then(result => {
    console.log('✅ Resultado del email:', result);
    if (result.success) {
      console.log('🎉 ¡Email enviado exitosamente a robertogaona1985@gmail.com!');
    } else {
      console.log('❌ Error enviando email:', result.error);
    }
  })
  .catch(error => {
    console.error('❌ Error en la prueba:', error);
  });
