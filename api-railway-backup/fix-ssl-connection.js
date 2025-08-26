/**
 * fix-ssl-connection.js
 * 
 * Script para solucionar problemas de conexión SSL a PostgreSQL en Railway
 * 
 * Este script intenta múltiples estrategias de conexión y luego genera el código
 * correcto para conectarse a la base de datos según la estrategia que funcionó.
 */

// Cargar variables de entorno desde .env si existe
try {
  require('dotenv').config();
} catch (error) {
  console.log('Módulo dotenv no encontrado. Instalándolo...');
  console.log('Por favor, ejecuta el script nuevamente después de la instalación.');
  require('child_process').execSync('npm install dotenv --no-save');
  process.exit(0);
}

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Colores para la terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Configuración básica desde variables de entorno
const baseConfig = {
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE || 'railway',
  connectionTimeoutMillis: 10000 // 10 segundos
};

// Diferentes estrategias de conexión
const strategies = [
  {
    name: 'SSL con rejectUnauthorized=false',
    description: 'Usa SSL pero no verifica el certificado (solución común para Railway)',
    config: {
      ...baseConfig,
      ssl: {
        rejectUnauthorized: false
      }
    },
    code: `
const { Pool } = require('pg');

// Configuración con SSL (rejectUnauthorized=false)
const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT, 10),
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false
  }
});`
  },
  {
    name: 'Sin SSL',
    description: 'Conexión sin SSL (funciona en algunos entornos)',
    config: {
      ...baseConfig,
      ssl: false
    },
    code: `
const { Pool } = require('pg');

// Configuración sin SSL
const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT, 10),
  database: process.env.PGDATABASE,
  ssl: false
});`
  },
  {
    name: 'Solo URL con SSL',
    description: 'Usa la cadena de conexión completa con SSL',
    config: {
      connectionString: process.env.DATABASE_URL || `postgresql://${baseConfig.user}:${baseConfig.password}@${baseConfig.host}:${baseConfig.port}/${baseConfig.database}`,
      ssl: {
        rejectUnauthorized: false
      }
    },
    code: `
const { Pool } = require('pg');

// Configuración con URL de conexión y SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});`
  },
  {
    name: 'SSL con require=true',
    description: 'Usa SSL de forma explícita con require',
    config: {
      ...baseConfig,
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    code: `
const { Pool } = require('pg');

// Configuración con SSL explícito (require=true)
const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT, 10),
  database: process.env.PGDATABASE,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});`
  }
];

// Imprime información sobre la configuración
console.log(`${colors.cyan}${colors.bold}=== SOLUCIONADOR DE CONEXIÓN SSL POSTGRESQL ====${colors.reset}`);
console.log(`${colors.yellow}Probando conexión a PostgreSQL con varias configuraciones SSL...${colors.reset}\n`);
console.log(`${colors.cyan}Configuración detectada:${colors.reset}`);
console.log(`Host: ${process.env.PGHOST || 'localhost'}`);
console.log(`Puerto: ${process.env.PGPORT || '5432'}`);
console.log(`Base de datos: ${process.env.PGDATABASE || 'railway'}`);
console.log(`Usuario: ${process.env.PGUSER || 'postgres'}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '***configurado***' : 'no configurado'}`);
console.log('\n');

// Prueba una estrategia específica
async function testStrategy(strategy) {
  console.log(`${colors.cyan}[${strategy.name}] ${colors.yellow}Probando...${colors.reset}`);
  console.log(`${strategy.description}`);
  
  try {
    const pool = new Pool(strategy.config);
    
    // Intentar consultar
    const startTime = Date.now();
    const result = await pool.query('SELECT NOW() as time');
    const duration = Date.now() - startTime;
    
    // Éxito!
    console.log(`${colors.green}✓ Conexión exitosa (${duration}ms)${colors.reset}`);
    console.log(`${colors.green}✓ Hora del servidor: ${result.rows[0].time}${colors.reset}`);
    
    // Verificar tablas
    try {
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      if (tablesResult.rows.length > 0) {
        console.log(`${colors.green}✓ Tablas encontradas: ${tablesResult.rows.length}${colors.reset}`);
        tablesResult.rows.forEach((row, i) => {
          if (i < 5) { // Mostrar solo las primeras 5 tablas
            console.log(`  - ${row.table_name}`);
          }
        });
        if (tablesResult.rows.length > 5) {
          console.log(`  - ...y ${tablesResult.rows.length - 5} más`);
        }
      } else {
        console.log(`${colors.yellow}⚠ No se encontraron tablas en la base de datos${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.yellow}⚠ No se pudieron listar las tablas: ${error.message}${colors.reset}`);
    }
    
    await pool.end();
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
    
    // Más detalles sobre el error
    if (error.code) {
      console.log(`  Código de error: ${error.code}`);
    }
    
    return false;
  } finally {
    console.log('-'.repeat(60));
  }
}

// Prueba todas las estrategias y genera código
async function runTests() {
  const results = [];
  let successfulStrategy = null;
  
  // Probar cada estrategia
  for (const strategy of strategies) {
    const success = await testStrategy(strategy);
    results.push({ ...strategy, success });
    
    if (success && !successfulStrategy) {
      successfulStrategy = strategy;
    }
  }
  
  // Mostrar resultados
  console.log(`\n${colors.cyan}${colors.bold}=== RESULTADOS ====${colors.reset}`);
  
  const successCount = results.filter(r => r.success).length;
  if (successCount > 0) {
    console.log(`${colors.green}${successCount} de ${strategies.length} estrategias funcionaron correctamente.${colors.reset}`);
  } else {
    console.log(`${colors.red}Ninguna estrategia funcionó. Verifica tus credenciales y la disponibilidad del servidor.${colors.reset}`);
    return;
  }
  
  // Generar archivo con solución
  if (successfulStrategy) {
    await generateSolution(successfulStrategy);
  }
}

// Genera archivos con la solución que funcionó
async function generateSolution(strategy) {
  console.log(`\n${colors.cyan}${colors.bold}=== GENERANDO SOLUCIÓN ====${colors.reset}`);
  console.log(`${colors.green}Se usará la estrategia: ${strategy.name}${colors.reset}\n`);
  
  // Crear archivo db-config.js con la solución
  const dbConfigContent = `/**
 * db-config.js - Configuración de PostgreSQL para Railway
 * 
 * Este archivo fue generado automáticamente por fix-ssl-connection.js
 * Fecha: ${new Date().toISOString()}
 * 
 * Estrategia de conexión: ${strategy.name}
 * Descripción: ${strategy.description}
 */

const { Pool } = require('pg');
require('dotenv').config();

${strategy.code.trim()}

// Exportar pool para uso en otros archivos
module.exports = {
  pool,
  async testConnection() {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as time');
      client.release();
      return { success: true, time: result.rows[0].time };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
`;

  // Escribir archivo
  fs.writeFileSync('db-config.js', dbConfigContent, 'utf8');
  console.log(`${colors.green}✓ Archivo db-config.js creado${colors.reset}`);
  
  // Crear archivo de ejemplo
  const exampleContent = `/**
 * ejemplo-conexion-db.js - Ejemplo de uso de la configuración
 * 
 * Este archivo fue generado automáticamente por fix-ssl-connection.js
 * Fecha: ${new Date().toISOString()}
 */

// Importar configuración de base de datos
const { pool, testConnection } = require('./db-config');

// Ejemplo de consulta
async function ejemploConsulta() {
  try {
    // Probar conexión
    console.log('Probando conexión a la base de datos...');
    const testResult = await testConnection();
    
    if (testResult.success) {
      console.log(\`Conexión exitosa. Hora del servidor: \${testResult.time}\`);
      
      // Realizar una consulta a la tabla comentarios (si existe)
      try {
        const result = await pool.query(\`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          LIMIT 5
        \`);
        
        console.log('Tablas encontradas:');
        result.rows.forEach(row => {
          console.log(\`- \${row.table_name}\`);
        });
      } catch (error) {
        console.error('Error al consultar tablas:', error.message);
      }
    } else {
      console.error(\`Error al conectar: \${testResult.error}\`);
    }
  } catch (error) {
    console.error('Error en la consulta:', error);
  } finally {
    // Cerrar el pool al terminar la aplicación
    await pool.end();
  }
}

// Ejecutar ejemplo
ejemploConsulta().catch(console.error);
`;
  
  fs.writeFileSync('ejemplo-conexion-db.js', exampleContent, 'utf8');
  console.log(`${colors.green}✓ Archivo ejemplo-conexion-db.js creado${colors.reset}`);
  
  // Instrucciones
  console.log(`\n${colors.cyan}${colors.bold}=== CÓMO USAR ESTA SOLUCIÓN ====${colors.reset}`);
  console.log(`
1. Importa la configuración en tu código:
   ${colors.yellow}const { pool } = require('./db-config');${colors.reset}

2. Usa el pool de conexiones:
   ${colors.yellow}const result = await pool.query('SELECT * FROM tu_tabla');${colors.reset}

3. Para probar:
   ${colors.yellow}node ejemplo-conexion-db.js${colors.reset}
`);
}

// Ejecutar pruebas
runTests().catch(console.error);
