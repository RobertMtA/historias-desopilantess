/**
 * test-basic-connection.js
 * 
 * Script para probar la conexión básica a PostgreSQL 
 * sin configuración SSL
 */

// Importar el módulo pg
const { Client } = require('pg');

// Configuración de la conexión - sin SSL
const config = {
  user: 'postgres',
  password: 'tu_contraseña_aquí', // <-- REEMPLAZA ESTO con tu contraseña real
  host: 'localhost',              // <-- El valor típico en Railway
  port: 5432,
  database: 'railway',
  // Sin configuración SSL
};

console.log('=== PRUEBA BÁSICA DE CONEXIÓN POSTGRESQL ===');
console.log('Configuración:');
console.log(`- Host: ${config.host}`);
console.log(`- Puerto: ${config.port}`);
console.log(`- Base de datos: ${config.database}`);
console.log(`- Usuario: ${config.user}`);
console.log(`- Contraseña: ${config.password ? '********' : 'no configurada'}`);
console.log('\nIniciando conexión...');

// Crear un cliente PostgreSQL
const client = new Client(config);

// Conectar y ejecutar una consulta simple
client.connect()
  .then(() => {
    console.log('✓ ¡Conexión exitosa!');
    return client.query('SELECT NOW() as time');
  })
  .then(result => {
    console.log(`✓ Hora del servidor: ${result.rows[0].time}`);
    return client.end();
  })
  .then(() => {
    console.log('✓ Conexión cerrada correctamente');
  })
  .catch(err => {
    console.error('Error de conexión:', err.message);
    if (err.message.includes('password')) {
      console.error('\nEl error parece estar relacionado con la contraseña.');
      console.error('Verifica que la contraseña esté correctamente configurada en el script.');
    }
    if (err.message.includes('SSL')) {
      console.error('\nError de SSL detectado.');
      console.error('El servidor parece requerir o no soportar SSL.');
    }
  });
