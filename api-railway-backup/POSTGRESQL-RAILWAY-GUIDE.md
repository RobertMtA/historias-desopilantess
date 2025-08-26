# Guía para PostgreSQL en Railway

## Conexión a PostgreSQL en Railway

La conexión a PostgreSQL en Railway puede ser un poco complicada debido a la forma en que los servicios se conectan dentro de los contenedores de Railway. Esta guía te ayudará a configurar correctamente la conexión y solucionar los problemas más comunes.

## Variables de entorno importantes

Railway proporciona las siguientes variables de entorno para conectarse a PostgreSQL:

- `DATABASE_URL`: URL completa de conexión (ejemplo: `postgresql://postgres:password@localhost:5432/railway`)
- `PGUSER`: Usuario de PostgreSQL (normalmente `postgres`)
- `PGPASSWORD`: Contraseña de PostgreSQL
- `PGHOST`: Host de PostgreSQL (normalmente `localhost` dentro del mismo proyecto)
- `PGPORT`: Puerto de PostgreSQL (normalmente `5432`)
- `PGDATABASE`: Nombre de la base de datos (normalmente `railway`)

## Formas de conectarse

### 1. Usando la URL de conexión

```javascript
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
```

### 2. Usando parámetros individuales

```javascript
const { Client } = require('pg');

const client = new Client({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

## Problemas comunes y soluciones

### Error: getaddrinfo ENOTFOUND postgres.railway.internal

Este error ocurre cuando se intenta usar una URL interna de Railway que no es accesible desde el servicio.

**Solución**: Usa los parámetros individuales en lugar de la URL de conexión. Asegúrate de que `PGHOST` sea `localhost`.

### Error: connect ENETUNREACH

Este error indica que el host no es alcanzable debido a problemas de red.

**Soluciones**:
1. Verifica que el servicio PostgreSQL esté en el mismo proyecto de Railway
2. Usa `localhost` como host
3. Verifica las reglas de firewall de Railway

### Error: password authentication failed for user "postgres"

**Soluciones**:
1. Verifica que estés usando la contraseña correcta
2. Asegúrate de que la variable `PGPASSWORD` o `POSTGRES_PASSWORD` tenga el valor correcto
3. Intenta regenerar la contraseña en el panel de Railway

## Mejores prácticas

### Configuración de conexión robusta

```javascript
// Configuración de la base de datos para Railway
const getDbConfig = () => {
  // Intentar usar la URL de conexión directa si está disponible
  if (process.env.DATABASE_URL) {
    console.log('📊 Usando DATABASE_URL para la conexión');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    };
  }
  
  // De lo contrario, usar parámetros individuales
  return {
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD,
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432'),
    database: process.env.PGDATABASE || 'railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
};
```

### Inicialización de tablas al arrancar

Es una buena práctica verificar y crear las tablas necesarias al iniciar el servidor:

```javascript
async function initializeDatabase() {
  const client = new Client(getDbConfig());
  
  try {
    await client.connect();
    
    // Crear tablas si no existen
    await client.query(`
      CREATE TABLE IF NOT EXISTS historias (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        contenido TEXT NOT NULL,
        autor VARCHAR(100),
        categoria VARCHAR(50),
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Más tablas...
    
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  } finally {
    await client.end();
  }
}
```

## Comandos útiles de Railway

### Ver logs del servicio

```
railway logs
```

### Ejecutar un script en el entorno de Railway

```
railway run node mi-script.js
```

### Abrir el servicio en el navegador

```
railway open
```

### Ver variables de entorno

```
railway variables
```

## Verificación de la conexión a PostgreSQL

Puedes usar este pequeño script para verificar la conexión a PostgreSQL:

```javascript
const { Client } = require('pg');

// Obtener configuración
const config = {
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD,
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'railway',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

console.log('Intentando conectar con configuración:', {
  user: config.user,
  host: config.host,
  port: config.port,
  database: config.database,
  // No mostrar contraseña
});

async function testConnection() {
  const client = new Client(config);
  
  try {
    console.log('Conectando a PostgreSQL...');
    await client.connect();
    console.log('¡Conexión exitosa!');
    
    // Verificar versión de PostgreSQL
    const result = await client.query('SELECT version()');
    console.log('Versión de PostgreSQL:', result.rows[0].version);
    
    // Listar tablas
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Tablas encontradas:', tables.rows.length);
    tables.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('Error de conexión:', error);
  } finally {
    await client.end();
    console.log('Conexión cerrada');
  }
}

testConnection();
```

Guarda este script como `test-db-connection.js` y ejecútalo con Railway:

```
railway run node test-db-connection.js
```

## Conclusión

Railway facilita la configuración de PostgreSQL, pero es importante entender cómo funcionan las conexiones entre servicios dentro del mismo proyecto. Utilizando las técnicas descritas en esta guía, deberías poder conectar tu aplicación Node.js a PostgreSQL en Railway sin problemas.
