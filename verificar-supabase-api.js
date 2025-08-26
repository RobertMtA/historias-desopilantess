/**
 * Script para verificar la conexión con Supabase utilizando las API keys
 * Este enfoque utiliza el cliente de Supabase en lugar de conectarse directamente a PostgreSQL
 */

// Verificar que tenemos las dependencias necesarias
try {
  require('@supabase/supabase-js');
} catch (error) {
  console.log('🔄 Instalando dependencias necesarias...');
  require('child_process').execSync('npm install @supabase/supabase-js', { stdio: 'inherit' });
}

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.supabase' });

// Obtener la configuración desde las variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Verificar que tenemos las variables necesarias
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ No se ha configurado SUPABASE_URL o SUPABASE_ANON_KEY en el archivo .env.supabase');
  process.exit(1);
}

console.log('🚀 Verificando conexión a Supabase...');
console.log(`📋 Proyecto Supabase: ${supabaseUrl}`);

// Crear el cliente de Supabase con la clave anónima (más segura para pruebas)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para probar la conexión con la clave anónima
async function testPublicConnection() {
  try {
    console.log('🔍 Probando conexión pública (anon key)...');
    
    // Primero verificar la conexión básica
    const { data: healthData, error: healthError } = await supabase.rpc('get_pg_version').single();
    
    if (healthError) {
      if (healthError.message.includes('get_pg_version')) {
        console.log('ℹ️ La función get_pg_version no existe, pero la conexión parece estar funcionando');
        console.log('✅ Conexión básica a Supabase establecida');
        return true;
      } else {
        console.error('❌ Error al verificar conexión básica:', healthError.message);
        return false;
      }
    } else if (healthData) {
      console.log(`✅ Conexión básica establecida. PostgreSQL version: ${healthData}`);
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    return false;
  }
}

// Función para probar la conexión con la clave de servicio
async function testServiceConnection() {
  if (!supabaseServiceKey) {
    console.log('⚠️ No se ha configurado SUPABASE_SERVICE_KEY, omitiendo prueba con clave de servicio');
    return false;
  }
  
  try {
    console.log('🔍 Probando conexión con clave de servicio...');
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verificar las tablas existentes
    console.log('📋 Verificando tablas existentes...');
    
    try {
      // Consultar información del esquema para ver qué tablas existen
      const { data: tableData, error: tableError } = await serviceClient
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (tableError) {
        console.error('❌ Error al listar tablas:', tableError.message);
      } else if (tableData && tableData.length > 0) {
        console.log('✅ Tablas existentes:');
        tableData.forEach(table => console.log(`   - ${table.table_name}`));
      } else {
        console.log('ℹ️ No se encontraron tablas en el esquema public');
      }
    } catch (schemaError) {
      console.log('⚠️ No se pudo acceder a information_schema:', schemaError.message);
    }
    
    console.log('✅ Conexión con clave de servicio establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado con clave de servicio:', error.message);
    return false;
  }
}

// Función para verificar la estructura de la base de datos
async function checkDatabaseStructure() {
  if (!supabaseServiceKey) {
    console.log('⚠️ Se necesita SUPABASE_SERVICE_KEY para verificar la estructura de la base de datos');
    return;
  }
  
  try {
    console.log('\n🔍 Verificando estructura de la base de datos...');
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verificar tablas existentes utilizando RPC (función remota)
    const { data: tables, error: tablesError } = await serviceClient.rpc('get_tables');
    
    if (tablesError) {
      console.error('❌ Error al obtener tablas:', tablesError.message);
      console.log('ℹ️ Es posible que necesites crear una función RPC en Supabase para esta operación');
      return;
    }
    
    if (tables && tables.length > 0) {
      console.log('📋 Tablas encontradas:');
      tables.forEach(table => console.log(`- ${table.table_name}`));
    } else {
      console.log('⚠️ No se encontraron tablas o no se pudo acceder a la información');
    }
  } catch (error) {
    console.error('❌ Error al verificar estructura:', error.message);
  }
}

// Función principal
async function main() {
  console.log('======================================================');
  console.log('🔍 VERIFICACIÓN DE CONEXIÓN SUPABASE CON API KEYS');
  console.log('======================================================');
  
  // Probar conexión pública
  const publicConnected = await testPublicConnection();
  
  // Probar conexión con clave de servicio
  const serviceConnected = await testServiceConnection();
  
  // Si la conexión con clave de servicio funciona, verificar estructura
  if (serviceConnected) {
    await checkDatabaseStructure();
  }
  
  // Resultado final
  console.log('\n======================================================');
  if (publicConnected || serviceConnected) {
    console.log('✅ CONEXIÓN A SUPABASE EXITOSA');
    console.log('------------------------------------------------------');
    console.log('Próximos pasos:');
    console.log('1. Ejecutar: node init-supabase-db.js');
    console.log('2. Luego: .\\desplegar-completo-supabase.ps1');
  } else {
    console.log('❌ NO SE PUDO CONECTAR A SUPABASE');
    console.log('------------------------------------------------------');
    console.log('Verifica:');
    console.log('1. Las API keys en .env.supabase');
    console.log('2. La URL del proyecto Supabase');
    console.log('3. Si tu IP tiene permiso para conectarse a Supabase');
  }
  console.log('======================================================');
}

// Ejecutar la función principal
main();
