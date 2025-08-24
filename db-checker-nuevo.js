const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Configuración de PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'historias_desopilantes',
  password: process.env.DB_PASSWORD || 'Masajist@40',
  port: process.env.DB_PORT || 5432,
});

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

async function checkDbConnection() {
  try {
    console.log(`${colors.blue}Verificando conexión a PostgreSQL...${colors.reset}`);
    const client = await pool.connect();
    console.log(`${colors.green}✅ Conexión exitosa a la base de datos${colors.reset}`);
    client.release();
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Error conectando a PostgreSQL: ${error.message}${colors.reset}`);
    return false;
  }
}

async function listTables() {
  try {
    console.log(`\n${colors.blue}Listando tablas en la base de datos...${colors.reset}`);
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (res.rows.length === 0) {
      console.log(`${colors.yellow}No se encontraron tablas${colors.reset}`);
      return [];
    }
    
    console.log(`${colors.green}Tablas encontradas: ${res.rows.length}${colors.reset}`);
    res.rows.forEach((row, i) => {
      console.log(`${i+1}. ${row.table_name}`);
    });
    
    return res.rows.map(row => row.table_name);
  } catch (error) {
    console.error(`${colors.red}❌ Error listando tablas: ${error.message}${colors.reset}`);
    return [];
  }
}

async function describeTable(tableName) {
  try {
    console.log(`\n${colors.blue}Estructura de la tabla "${tableName}":${colors.reset}`);
    
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    
    if (res.rows.length === 0) {
      console.log(`${colors.yellow}No se encontró información sobre esta tabla${colors.reset}`);
      return;
    }
    
    console.log(`${colors.cyan}Columnas encontradas: ${res.rows.length}${colors.reset}`);
    console.log('--------------------------------------------------');
    console.log('| Columna               | Tipo          | Nullable |');
    console.log('--------------------------------------------------');
    
    res.rows.forEach(row => {
      const columnName = row.column_name.padEnd(22);
      const dataType = row.data_type.padEnd(14);
      const isNullable = row.is_nullable === 'YES' ? 'Sí' : 'No';
      
      console.log(`| ${columnName}| ${dataType}| ${isNullable.padEnd(8)}|`);
    });
    
    console.log('--------------------------------------------------');
    
  } catch (error) {
    console.error(`${colors.red}❌ Error describiendo tabla "${tableName}": ${error.message}${colors.reset}`);
  }
}

async function countRecords(tableName) {
  try {
    const res = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
    const count = parseInt(res.rows[0].count);
    console.log(`${colors.cyan}Total de registros en "${tableName}": ${count}${colors.reset}`);
    return count;
  } catch (error) {
    console.error(`${colors.red}❌ Error contando registros en "${tableName}": ${error.message}${colors.reset}`);
    return 0;
  }
}

async function showSampleData(tableName, limit = 3) {
  try {
    console.log(`\n${colors.blue}Muestra de datos de la tabla "${tableName}":${colors.reset}`);
    
    const res = await pool.query(`SELECT * FROM ${tableName} LIMIT $1`, [limit]);
    
    if (res.rows.length === 0) {
      console.log(`${colors.yellow}La tabla está vacía${colors.reset}`);
      return;
    }
    
    console.log(JSON.stringify(res.rows, null, 2));
    
  } catch (error) {
    console.error(`${colors.red}❌ Error mostrando datos de "${tableName}": ${error.message}${colors.reset}`);
  }
}

async function main() {
  console.log(`${colors.magenta}=== VERIFICACIÓN DE BASE DE DATOS HISTORIAS DESOPILANTES ===${colors.reset}`);
  
  const connected = await checkDbConnection();
  if (!connected) {
    console.error(`${colors.red}❌ No se pudo conectar a la base de datos. Terminando script.${colors.reset}`);
    process.exit(1);
  }
  
  const tables = await listTables();
  
  // Verificar existencia de tablas críticas
  const criticalTables = ['stories', 'story_interactions', 'comments', 'users'];
  console.log(`\n${colors.blue}Verificando tablas críticas...${colors.reset}`);
  
  criticalTables.forEach(table => {
    if (tables.includes(table)) {
      console.log(`${colors.green}✅ Tabla "${table}" existe${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Tabla "${table}" NO existe${colors.reset}`);
    }
  });
  
  // Describir y mostrar datos de las tablas existentes
  for (const table of tables) {
    await describeTable(table);
    await countRecords(table);
    await showSampleData(table);
  }
  
  console.log(`\n${colors.magenta}=== VERIFICACIÓN COMPLETADA ===${colors.reset}`);
}

// Ejecutar script principal
main()
  .catch(e => console.error(`${colors.red}Error general: ${e.message}${colors.reset}`))
  .finally(() => {
    pool.end();
    console.log(`${colors.blue}Conexión a la base de datos cerrada${colors.reset}`);
  });
