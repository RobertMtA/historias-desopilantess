/**
 * Script para verificar si las tablas necesarias existen en Supabase
 * usando API REST directa - Versión mejorada
 */
require('dotenv').config({ path: '.env.supabase' });
const axios = require('axios');

// Obtener las credenciales de Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[ERROR] Las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_KEY son necesarias');
  console.error('Por favor, asegúrate de que el archivo .env.supabase contiene estas variables');
  process.exit(1);
}

// Lista de tablas que debe tener la aplicación
const TABLAS_REQUERIDAS = [
  'historias',
  'comentarios',
  'story_interactions'
];

/**
 * Verifica si una tabla existe en Supabase
 * @param {string} nombreTabla - Nombre de la tabla a verificar
 * @returns {Promise<boolean>} - true si la tabla existe, false en caso contrario
 */
async function verificarTabla(nombreTabla) {
  try {
    // Intentar realizar una consulta simple a la tabla
    const response = await axios({
      method: 'GET',
      url: `${SUPABASE_URL}/rest/v1/${nombreTabla}?limit=1`,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (response.status === 200) {
      console.log('[OK] Tabla ' + nombreTabla + ' existe');
      return true;
    } else {
      console.error('[ERROR] Error al verificar la tabla ' + nombreTabla + ':', response.statusText);
      return false;
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        console.error('[ERROR] La tabla ' + nombreTabla + ' no existe');
      } else {
        console.error('[ERROR] Error al verificar la tabla ' + nombreTabla + ':', 
          error.response.status, error.response.statusText);
      }
    } else {
      console.error('[ERROR] Error al verificar la tabla ' + nombreTabla + ':', error.message);
    }
    return false;
  }
}

/**
 * Función principal que verifica la existencia de todas las tablas requeridas
 */
async function verificarTablas() {
  console.log('>> Iniciando verificación de tablas en Supabase');
  console.log('>> URL: ' + SUPABASE_URL);
  
  let todasExisten = true;
  
  for (const tabla of TABLAS_REQUERIDAS) {
    const existe = await verificarTabla(tabla);
    if (!existe) {
      todasExisten = false;
    }
  }
  
  if (todasExisten) {
    console.log('>> RESULTADO: Todas las tablas existen en Supabase');
    return true;
  } else {
    console.error('>> RESULTADO: Faltan algunas tablas en Supabase');
    console.log('');
    console.log('Para crear las tablas, ejecuta:');
    console.log('node crear-tablas-manual.js');
    console.log('');
    console.log('Esto mostrará las instrucciones SQL para crear las tablas faltantes.');
    return false;
  }
}

// Ejecutar la verificación
verificarTablas()
  .then(resultado => {
    if (!resultado) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('[ERROR] Error inesperado:', error.message);
    process.exit(1);
  });
