// Test del sistema de emails mejorado con logo
const { sendContactEmail, sendConfirmationEmail } = require('./server/config/emailConfig');

// Datos de prueba
const testContactData = {
  nombre: 'Roberto Gaona',
  email: 'marcolisander@gmail.com', // Cambiar por tu email para hacer pruebas
  asunto: 'Hola como esta?',
  mensaje: 'Es increíble lo que haces',
  tipoConsulta: 'historia'
};

async function testEmails() {
  console.log('🧪 Iniciando prueba del sistema de emails...');
  
  try {
    console.log('📧 Enviando email al administrador...');
    const adminEmailResult = await sendContactEmail(testContactData);
    console.log('✅ Resultado email admin:', adminEmailResult);
    
    console.log('📧 Enviando email de confirmación al usuario...');
    const confirmationEmailResult = await sendConfirmationEmail(testContactData);
    console.log('✅ Resultado email confirmación:', confirmationEmailResult);
    
    console.log('✅ Prueba completada con éxito!');
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar prueba
testEmails();
