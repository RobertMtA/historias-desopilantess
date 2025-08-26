// Prueba simple sin SSL con codificación corregida
const { Client } = require('pg');
require('dotenv').config();

console.log('Configuración:');
console.log('Usuario:', process.env.PGUSER);
console.log('Contraseña:', process.env.PGPASSWORD ? '******' : 'NO CONFIGURADA');
console.log('Host:', process.env.PGHOST);
console.log('Base de datos:', process.env.PGDATABASE);

const config = {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
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
    
    // Mostrar lista de bases de datos disponibles
    return client.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
  })
  .then(res => {
    console.log('\nBases de datos disponibles:');
    res.rows.forEach(row => {
      console.log('- ' + row.datname);
    });
    return client.end();
  })
  .then(() => {
    console.log('\n✓ Conexión cerrada correctamente');
  })
  .catch(err => {
    console.error('Error:', err.message);
    
    // Sugerencias específicas según el error
    if (err.message.includes('no existe la base de datos') || err.message.includes('does not exist')) {
      console.error('\nSUGERENCIA: La base de datos especificada no existe.');
      console.error('Intenta con otra base de datos como "postgres" que suele ser la predeterminada.');
    } else if (err.message.includes('password')) {
      console.error('\nSUGERENCIA: Hay un problema con la contraseña.');
      console.error('Verifica que la contraseña sea correcta en el archivo .env');
    }
    
    process.exit(1);
  });