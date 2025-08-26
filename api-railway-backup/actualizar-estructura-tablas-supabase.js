/**
 * Script para actualizar la estructura de tablas en Supabase
 * Este script asegura que las tablas tengan la estructura correcta
 * y ajusta sus nombres para seguir la convención de Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Validación de credenciales
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Se requieren las variables de entorno SUPABASE_URL y SUPABASE_KEY');
  console.log('Por favor, crea un archivo .env con las siguientes variables:');
  console.log('SUPABASE_URL=tu-url-de-supabase');
  console.log('SUPABASE_KEY=tu-clave-de-servicio-supabase');
  process.exit(1);
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Ejecuta una consulta SQL directa en Supabase
 * @param {string} sql - Consulta SQL a ejecutar
 * @param {string} descripcion - Descripción de la operación
 */
async function ejecutarSQL(sql, descripcion) {
  console.log(`\n--- ${descripcion} ---`);
  console.log(`SQL: ${sql}`);
  
  try {
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });
    
    if (error) {
      console.error(`Error: ${error.message}`);
      return false;
    }
    
    console.log('Operación completada con éxito');
    return true;
  } catch (error) {
    console.error(`Error inesperado: ${error.message}`);
    return false;
  }
}

/**
 * Verifica si una tabla existe en Supabase
 * @param {string} tableName - Nombre de la tabla
 * @returns {Promise<boolean>} - true si la tabla existe
 */
async function verificarTabla(tableName) {
  try {
    const { data, error } = await supabase.rpc(
      'execute_sql',
      { 
        sql_query: `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = '${tableName}'
          );
        `
      }
    );
    
    if (error) {
      console.error(`Error al verificar tabla ${tableName}:`, error.message);
      return false;
    }
    
    return data && data.length > 0 && data[0].exists;
  } catch (error) {
    console.error(`Error inesperado al verificar tabla ${tableName}:`, error.message);
    return false;
  }
}

/**
 * Crea o actualiza la tabla stories
 */
async function crearTablaStories() {
  const existeTabla = await verificarTabla('stories');
  
  if (existeTabla) {
    console.log('La tabla stories ya existe. Verificando estructura...');
    
    // Verificar columnas
    const { data: columnas, error } = await supabase.rpc(
      'execute_sql',
      {
        sql_query: `
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'stories';
        `
      }
    );
    
    if (error) {
      console.error('Error al verificar columnas:', error.message);
      return;
    }
    
    // Verificar si falta la columna author_id
    const tieneAuthorId = columnas.some(col => col.column_name === 'author_id');
    
    if (!tieneAuthorId) {
      console.log('Añadiendo columna author_id...');
      await ejecutarSQL(
        `ALTER TABLE stories ADD COLUMN author_id UUID REFERENCES auth.users(id);`,
        'Añadir columna author_id a stories'
      );
    }
  } else {
    // Crear tabla stories
    await ejecutarSQL(`
      CREATE TABLE stories (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(100),
        author_id UUID REFERENCES auth.users(id),
        category VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        active BOOLEAN DEFAULT true
      );
    `, 'Crear tabla stories');
  }
}

/**
 * Crea o actualiza la tabla comments
 */
async function crearTablaComments() {
  const existeTabla = await verificarTabla('comments');
  
  if (existeTabla) {
    console.log('La tabla comments ya existe. Verificando estructura...');
    
    // Verificar columnas
    const { data: columnas, error } = await supabase.rpc(
      'execute_sql',
      {
        sql_query: `
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'comments';
        `
      }
    );
    
    if (error) {
      console.error('Error al verificar columnas:', error.message);
      return;
    }
    
    // Verificar si falta la columna user_id
    const tieneUserId = columnas.some(col => col.column_name === 'user_id');
    
    if (!tieneUserId) {
      console.log('Añadiendo columna user_id...');
      await ejecutarSQL(
        `ALTER TABLE comments ADD COLUMN user_id UUID REFERENCES auth.users(id);`,
        'Añadir columna user_id a comments'
      );
    }
  } else {
    // Crear tabla comments
    await ejecutarSQL(`
      CREATE TABLE comments (
        id SERIAL PRIMARY KEY,
        story_id INTEGER NOT NULL,
        author VARCHAR(100) NOT NULL,
        user_id UUID REFERENCES auth.users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE
      );
    `, 'Crear tabla comments');
  }
}

/**
 * Crea o actualiza la tabla likes
 */
async function crearTablaLikes() {
  const existeTabla = await verificarTabla('likes');
  
  if (!existeTabla) {
    await ejecutarSQL(`
      CREATE TABLE likes (
        id SERIAL PRIMARY KEY,
        story_id INTEGER NOT NULL,
        user_id UUID REFERENCES auth.users(id) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
        UNIQUE(story_id, user_id)
      );
    `, 'Crear tabla likes');
    
    // Crear índice para mejorar rendimiento
    await ejecutarSQL(
      `CREATE INDEX likes_story_id_idx ON likes(story_id);`,
      'Crear índice en likes.story_id'
    );
  }
}

/**
 * Crea o actualiza la tabla subscribers
 */
async function crearTablaSubscribers() {
  const existeTabla = await verificarTabla('subscribers');
  
  if (!existeTabla) {
    await ejecutarSQL(`
      CREATE TABLE subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        user_id UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        confirmed BOOLEAN DEFAULT FALSE,
        confirmed_at TIMESTAMP WITH TIME ZONE,
        unsubscribed BOOLEAN DEFAULT FALSE,
        unsubscribed_at TIMESTAMP WITH TIME ZONE
      );
    `, 'Crear tabla subscribers');
    
    // Crear índice para búsquedas por email
    await ejecutarSQL(
      `CREATE INDEX subscribers_email_idx ON subscribers(email);`,
      'Crear índice en subscribers.email'
    );
  }
}

/**
 * Migra datos de la tabla antigua a la nueva (si es necesario)
 * @param {string} tablaAntigua - Nombre de la tabla antigua
 * @param {string} tablaNueva - Nombre de la tabla nueva
 * @param {Object} mapeoColumnas - Mapeo de columnas antiguas a nuevas
 */
async function migrarDatos(tablaAntigua, tablaNueva, mapeoColumnas) {
  const existeTablaAntigua = await verificarTabla(tablaAntigua);
  const existeTableNueva = await verificarTabla(tablaNueva);
  
  if (existeTablaAntigua && existeTableNueva) {
    console.log(`\n--- Migrando datos de ${tablaAntigua} a ${tablaNueva} ---`);
    
    // Construir SQL para inserción
    const columnasAntiguas = Object.keys(mapeoColumnas).join(', ');
    const columnasNuevas = Object.values(mapeoColumnas).join(', ');
    
    const sql = `
      INSERT INTO ${tablaNueva} (${columnasNuevas})
      SELECT ${columnasAntiguas} 
      FROM ${tablaAntigua}
      ON CONFLICT DO NOTHING;
    `;
    
    await ejecutarSQL(sql, `Migrar datos de ${tablaAntigua} a ${tablaNueva}`);
  } else {
    console.log(`No se puede migrar: ${existeTablaAntigua ? tablaNueva + ' no existe' : tablaAntigua + ' no existe'}`);
  }
}

/**
 * Crear una vista para compatibilidad con código anterior
 * @param {string} nombreVista - Nombre de la vista a crear
 * @param {string} tablaOrigen - Tabla origen de los datos
 * @param {Object} mapeoColumnas - Mapeo de columnas de la tabla a la vista
 */
async function crearVistaCompatibilidad(nombreVista, tablaOrigen, mapeoColumnas) {
  // Construir lista de columnas para la vista
  const columnas = Object.entries(mapeoColumnas)
    .map(([columnaVista, columnaTabla]) => `${columnaTabla} AS ${columnaVista}`)
    .join(', ');
  
  const sql = `
    CREATE OR REPLACE VIEW ${nombreVista} AS
    SELECT ${columnas}
    FROM ${tablaOrigen};
  `;
  
  await ejecutarSQL(sql, `Crear vista ${nombreVista} para compatibilidad`);
}

/**
 * Función principal
 */
async function main() {
  console.log('=== Actualizando estructura de tablas en Supabase ===');
  console.log(`Fecha: ${new Date().toLocaleString()}`);
  
  try {
    // Crear o actualizar tablas principales
    await crearTablaStories();
    await crearTablaComments();
    await crearTablaLikes();
    await crearTablaSubscribers();
    
    // Migrar datos si es necesario (ejemplo con historias)
    const existeHistorias = await verificarTabla('historias');
    
    if (existeHistorias) {
      await migrarDatos('historias', 'stories', {
        'id': 'id',
        'titulo': 'title',
        'contenido': 'content',
        'autor': 'author',
        'categoria': 'category',
        'fecha': 'created_at',
        'activo': 'active'
      });
      
      // Crear vista para compatibilidad con código anterior
      await crearVistaCompatibilidad('historias', 'stories', {
        'id': 'id',
        'titulo': 'title',
        'contenido': 'content',
        'autor': 'author',
        'categoria': 'category',
        'fecha': 'created_at',
        'activo': 'active'
      });
    }
    
    console.log('\n=== Actualización de estructura completada ===');
    
  } catch (error) {
    console.error('Error durante la actualización:', error);
    process.exit(1);
  }
}

// Ejecutar la función principal
main();
