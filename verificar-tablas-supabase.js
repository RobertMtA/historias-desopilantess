/**
 * Script para verificar si las tablas ya existen en Supabase
 * Este script usa el cliente de Supabase en lugar de API REST directa
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.supabase' });

// Obtener credenciales de Supabase desde variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: No se han configurado SUPABASE_URL o SUPABASE_SERVICE_KEY en el archivo .env.supabase');
  process.exit(1);
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Verificando tablas en Supabase...');
console.log('📋 URL de Supabase:', supabaseUrl);

/**
 * Función para realizar una consulta directa a Postgres usando el cliente de Supabase
 */
async function queryPostgres(query) {
  try {
    const { data, error } = await supabase.rpc('pgaudit', { query });
    
    if (error) {
      if (error.message.includes('function pgaudit() does not exist')) {
        console.warn('⚠️ La función pgaudit no existe en este proyecto de Supabase.');
        return { success: false, error: 'Función no disponible' };
      }
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Verificar si una tabla existe usando el cliente de Supabase
 */
async function verificarTabla(nombreTabla) {
  try {
    // Intentar hacer una selección simple de la tabla
    const { data, error } = await supabase
      .from(nombreTabla)
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.error(`❌ La tabla "${nombreTabla}" no existe`);
        return false;
      } else {
        console.error(`❌ Error al verificar tabla "${nombreTabla}":`, error.message);
        return false;
      }
    }
    
    console.log(`✅ La tabla "${nombreTabla}" existe y es accesible`);
    console.log(`   Registros encontrados: ${data.length}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al verificar tabla "${nombreTabla}":`, error.message);
    return false;
  }
}

/**
 * Verificar todas las tablas necesarias
 */
async function verificarTodasLasTablas() {
  const tablas = ['historias', 'comentarios', 'story_interactions'];
  const resultados = {};
  
  let todasExisten = true;
  
  for (const tabla of tablas) {
    console.log(`\n🔍 Verificando tabla "${tabla}"...`);
    const existe = await verificarTabla(tabla);
    resultados[tabla] = existe;
    
    if (!existe) {
      todasExisten = false;
    }
  }
  
  return { todasExisten, resultados };
}

// Ejecutar la verificación
verificarTodasLasTablas()
  .then(({ todasExisten, resultados }) => {
    console.log('\n================================================');
    console.log('RESULTADOS DE LA VERIFICACIÓN:');
    console.log('================================================');
    
    for (const [tabla, existe] of Object.entries(resultados)) {
      console.log(`${existe ? '✅' : '❌'} Tabla "${tabla}": ${existe ? 'Existe' : 'No existe'}`);
    }
    
    if (todasExisten) {
      console.log('\n✅ TODAS LAS TABLAS EXISTEN Y SON ACCESIBLES');
      console.log('\nPuedes continuar con:');
      console.log('1. Insertar datos: node insertar-datos-supabase-rest.js');
      console.log('2. Desplegar: .\\desplegar-con-supabase-api.ps1');
      process.exit(0);
    } else {
      console.log('\n❌ FALTAN ALGUNAS TABLAS');
      console.log('\nPara crear las tablas:');
      console.log('1. Ejecuta: node crear-tablas-manual.js');
      console.log('2. Sigue las instrucciones para crear las tablas en el SQL Editor de Supabase');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  });
