/**
 * test-postgresql-connection.js
 * 
 * Script para probar la conexión a PostgreSQL en Railway con diferentes estrategias SSL
 * Este script es útil para diagnosticar problemas de conexión con Railway PostgreSQL
 */

const { Pool } = require('pg');

// Configuración de colores para la terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Logger mejorado con colores
const logger = {
  info: (message) => console.log(`${colors.blue}[INFO]${colors.reset} ${message}`),
  warn: (message) => console.log(`${colors.yellow}[ADVERTENCIA]${colors.reset} ${message}`),
  error: (message, error) => console.error(
    `${colors.red}[ERROR]${colors.reset} ${message}`,
    error ? `\n${colors.gray}${error.stack || error}${colors.reset}` : ''
  ),
  success: (message) => console.log(`${colors.green}[ÉXITO]${colors.reset} ${message}`),
  header: (message) => console.log(`\n${colors.cyan}${message}${colors.reset}\n`)
};

// Diferentes estrategias de conexión a PostgreSQL
const connectionStrategies = [
  { 
    name: 'SSL estándar',
    config: {
      ssl: {
        rejectUnauthorized: false
      }
    }
  },
  { 
    name: 'Sin SSL',
    config: {
      ssl: false
    }
  },
  { 
    name: 'SSL con require=true',
    config: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  {
    name: 'Solo URL de conexión con SSL',
    config: {
      connectionString: process.env.DATABASE_URL || null,
      ssl: {
        rejectUnauthorized: false
      }
    }
  },
  {
    name: 'Solo URL de conexión sin SSL',
    config: {
      connectionString: process.env.DATABASE_URL || null
    }
  }
];

/**
 * Obtiene la configuración base para PostgreSQL desde variables de entorno
 */
function getBaseConfig() {
  return {
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    database: process.env.PGDATABASE || 'railway',
    connectionTimeoutMillis: 10000 // 10 segundos
  };
}

/**
 * Muestra la información de configuración disponible
 */
function showConfigInfo() {
  logger.header('INFORMACIÓN DE CONFIGURACIÓN POSTGRESQL');
  
  logger.info(`PGUSER: ${process.env.PGUSER || '(no definido)'}`);
  logger.info(`PGHOST: ${process.env.PGHOST || '(no definido)'}`);
  logger.info(`PGPORT: ${process.env.PGPORT || '5432 (default)'}`);
  logger.info(`PGDATABASE: ${process.env.PGDATABASE || '(no definido)'}`);
  logger.info(`DATABASE_URL: ${process.env.DATABASE_URL ? '***configurado***' : '(no definido)'}`);
  logger.info(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
}

/**
 * Prueba una conexión específica a PostgreSQL
 * @param {string} name Nombre de la estrategia
 * @param {object} strategyConfig Configuración específica de la estrategia
 * @returns {Promise<boolean>} true si la conexión fue exitosa
 */
async function testConnection(name, strategyConfig) {
  logger.header(`Probando estrategia: ${name}`);
  
  // Combinar configuración base con la estrategia específica
  const baseConfig = getBaseConfig();
  const config = { ...baseConfig, ...strategyConfig };
  
  // Si usa connectionString y no está definido, omitir esta prueba
  if ('connectionString' in config && !config.connectionString) {
    logger.warn('Esta estrategia requiere DATABASE_URL que no está definida. Omitiendo prueba.');
    return false;
  }
  
  // Mostrar configuración (sin password)
  const sanitizedConfig = { ...config };
  if (sanitizedConfig.password) sanitizedConfig.password = '********';
  if (sanitizedConfig.connectionString) sanitizedConfig.connectionString = '********';
  logger.info(`Configuración: ${JSON.stringify(sanitizedConfig, null, 2)}`);
  
  try {
    // Crear pool de conexiones
    const pool = new Pool(config);
    
    // Intentar conectar y ejecutar consulta
    logger.info('Intentando conexión...');
    const startTime = Date.now();
    
    const result = await pool.query('SELECT NOW() as current_time');
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Mostrar resultados
    const currentTime = result.rows[0].current_time;
    logger.success(`¡Conexión exitosa! (${duration}ms)`);
    logger.success(`Hora del servidor PostgreSQL: ${currentTime}`);
    
    // Obtener información de la base de datos
    const versionResult = await pool.query('SHOW server_version');
    const version = versionResult.rows[0].server_version;
    logger.info(`Versión de PostgreSQL: ${version}`);
    
    // Verificar tablas
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    if (tablesResult.rows.length > 0) {
      logger.info(`Tablas encontradas: ${tablesResult.rows.length}`);
      tablesResult.rows.forEach((row, i) => {
        logger.info(`  ${i + 1}. ${row.table_name}`);
      });
    } else {
      logger.warn('No se encontraron tablas en el esquema public');
    }
    
    // Cerrar conexión
    await pool.end();
    return true;
  } catch (error) {
    logger.error(`Error al conectar:`, error);
    
    // Información adicional para diagnóstico
    if (error.code === 'ENOTFOUND') {
      logger.warn(`No se pudo resolver el host: ${config.host}`);
    } else if (error.code === 'ECONNREFUSED') {
      logger.warn(`Conexión rechazada. Verifica que el servidor esté ejecutándose y el puerto ${config.port} esté abierto.`);
    } else if (error.message && error.message.includes('SSL')) {
      logger.warn('Error relacionado con SSL. Intenta con una configuración SSL diferente.');
    }
    
    return false;
  }
}

/**
 * Prueba todas las estrategias de conexión
 */
async function testAllStrategies() {
  showConfigInfo();
  
  logger.header('INICIANDO PRUEBAS DE CONEXIÓN');
  logger.info(`Se probarán ${connectionStrategies.length} estrategias diferentes de conexión...`);
  
  let successCount = 0;
  
  // Probar cada estrategia secuencialmente
  for (let i = 0; i < connectionStrategies.length; i++) {
    const strategy = connectionStrategies[i];
    const success = await testConnection(strategy.name, strategy.config);
    
    if (success) {
      successCount++;
    }
    
    // Separador entre pruebas
    if (i < connectionStrategies.length - 1) {
      console.log('\n' + '-'.repeat(50) + '\n');
    }
  }
  
  // Mostrar resumen
  logger.header('RESUMEN DE PRUEBAS');
  if (successCount > 0) {
    logger.success(`${successCount} de ${connectionStrategies.length} estrategias funcionaron correctamente.`);
    logger.info('Usa la configuración de la estrategia exitosa en tu aplicación.');
  } else {
    logger.error(`Todas las ${connectionStrategies.length} estrategias fallaron.`);
    logger.info('Verifica tus credenciales y configuración de Railway.');
  }
}

// Ejecutar las pruebas
testAllStrategies().catch(err => {
  logger.error('Error general en el script:', err);
  process.exit(1);
});
