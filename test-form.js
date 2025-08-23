// Test simple del formulario de contacto
fetch('http://localhost:3002/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nombre: 'Roberto Test',
    email: 'robertogaona1985@gmail.com',
    asunto: 'Prueba del formulario de contacto',
    mensaje: 'Este es un mensaje de prueba para verificar que el sistema funciona correctamente. ¡Espero recibir este email!',
    tipoConsulta: 'pregunta'
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ Respuesta del servidor:', data);
})
.catch(error => {
  console.error('❌ Error:', error);
});
