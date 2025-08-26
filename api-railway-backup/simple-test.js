// Prueba simple sin SSL
const { Client } = require('pg');
require('dotenv').config();

console.log('Configuración:');
console.log('Usuario:', process.env.PGUSER);
console.log('Contraseña:', process.env.PGPASSWORD ? '******' : 'NO CONFIGURADA');
console.log('Host:', process.env.PGHOST);
console.log('Base de datos:', process.env.PGDATABASE);

const config = {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD, // <-- Asegúrate de que esté correctamente configurada
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT, 10),
  database: process.env.PGDATABASE,
  ssl: false
};

const client = new Client(config);

console.log('Conectando a PostgreSQL...');

client.connect()
  .then(() => {
    console.log('✓ Conexión exitosa!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Hora del servidor:', res.rows[0].now);
    return client.end();
  })
  .then(() => {
    console.log('✓ Conexión cerrada correctamente');
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
