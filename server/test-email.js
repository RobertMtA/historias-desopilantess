const { sendContactEmail, sendConfirmationEmail } = require('./config/emailConfig');

// Datos de prueba
const testContactData = {
  nombre: 'Test Usuario',
  email: 'test@example.com',
  asunto: 'Mensaje de prueba',
  mensaje: 'Este es un mensaje de prueba para verificar que el sistema de emails funciona correctamente.',
  tipoConsulta: 'pregunta'
};

async function testEmails() {
  console.log('🧪 Probando sistema de emails...\n');
  
  try {
    // Probar email al administrador
    console.log('📧 Enviando email al administrador...');
    const adminResult = await sendContactEmail(testContactData);
    console.log('Resultado admin:', adminResult);
    
    // Probar email de confirmación
    console.log('\n📧 Enviando email de confirmación...');
    const confirmationResult = await sendConfirmationEmail(testContactData);
    console.log('Resultado confirmación:', confirmationResult);
    
    if (adminResult.success && confirmationResult.success) {
      console.log('\n✅ ¡Ambos emails enviados correctamente!');
    } else {
      console.log('\n❌ Algunos emails fallaron');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba de emails:', error);
  }
}

// Ejecutar prueba
testEmails();
