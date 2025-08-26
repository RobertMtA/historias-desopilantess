/**
 * Script para validar la conexión y estructura de la base de datos en Supabase
 */
const { pool, testConnection } = require('./db-config-supabase');
require('dotenv').config({ path: '.env.supabase' });

// Función para ejecutar consultas SQL
async function executeQuery(query, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } catch (error) {
    console.error('Error ejecutando consulta:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Función para verificar la estructura de la base de datos
async function checkDatabaseStructure() {
  console.log('🔍 Verificando estructura de la base de datos en Supabase...');
  
  try {
    // 1. Verificar si las tablas existen
    console.log('📋 Comprobando tablas...');
    
    // Consulta para verificar tablas existentes
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    const tablesResult = await executeQuery(tablesQuery);
    const tables = tablesResult.rows.map(row => row.table_name);
    
    console.log('Tablas encontradas:', tables);
    
    // Tablas esperadas
    const expectedTables = ['historias', 'comentarios', 'story_interactions'];
    const missingTables = expectedTables.filter(table => !tables.includes(table));
    
    if (missingTables.length > 0) {
      console.warn(`⚠️ Tablas faltantes: ${missingTables.join(', ')}`);
    } else {
      console.log('✅ Todas las tablas esperadas existen');
    }
    
    // 2. Para cada tabla que existe, verificar su estructura
    for (const table of tables.filter(t => expectedTables.includes(t))) {
      console.log(`\n📋 Verificando estructura de tabla: ${table}`);
      
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `;
      
      const columnsResult = await executeQuery(columnsQuery, [table]);
      const columns = columnsResult.rows;
      
      console.log(`Columnas de ${table}:`, columns.map(c => `${c.column_name} (${c.data_type})`));
    }
    
    // 3. Verificar si hay datos
    for (const table of tables.filter(t => expectedTables.includes(t))) {
      const countQuery = `SELECT COUNT(*) FROM ${table}`;
      const countResult = await executeQuery(countQuery);
      const count = parseInt(countResult.rows[0].count);
      
      console.log(`📊 Tabla ${table}: ${count} registros`);
    }
    
    // 4. Verificar la relación entre tablas (foreign keys)
    const foreignKeysQuery = `
      SELECT
        tc.table_schema, 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
      ORDER BY tc.table_name;
    `;
    
    const foreignKeysResult = await executeQuery(foreignKeysQuery);
    
    if (foreignKeysResult.rows.length > 0) {
      console.log('\n🔗 Foreign Keys encontradas:');
      for (const fk of foreignKeysResult.rows) {
        console.log(`- ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      }
    } else {
      console.warn('⚠️ No se encontraron foreign keys');
    }
  } catch (error) {
    console.error('❌ Error al verificar la estructura de la base de datos:', error);
    return false;
  }
  
  return true;
}

// Función para validar datos de historias y comentarios
async function validateData() {
  try {
    console.log('\n🧪 Validando datos...');
    
    // 1. Verificar que cada historia tenga al menos 1 comentario
    const storiesWithoutCommentsQuery = `
      SELECT h.id, h.titulo
      FROM historias h
      LEFT JOIN comentarios c ON h.id = c.historia_id
      WHERE c.id IS NULL
    `;
    
    const storiesWithoutComments = await executeQuery(storiesWithoutCommentsQuery);
    
    if (storiesWithoutComments.rows.length > 0) {
      console.warn('⚠️ Historias sin comentarios:');
      for (const row of storiesWithoutComments.rows) {
        console.warn(`- ID: ${row.id}, Título: ${row.titulo}`);
      }
    } else {
      console.log('✅ Todas las historias tienen al menos un comentario');
    }
    
    // 2. Verificar que todas las historias tengan registro de interacciones
    if (await tableExists('story_interactions')) {
      const storiesWithoutInteractionsQuery = `
        SELECT h.id, h.titulo
        FROM historias h
        LEFT JOIN story_interactions si ON h.id = si.historia_id
        WHERE si.id IS NULL
      `;
      
      const storiesWithoutInteractions = await executeQuery(storiesWithoutInteractionsQuery);
      
      if (storiesWithoutInteractions.rows.length > 0) {
        console.warn('⚠️ Historias sin registro de interacciones:');
        for (const row of storiesWithoutInteractions.rows) {
          console.warn(`- ID: ${row.id}, Título: ${row.titulo}`);
        }
      } else {
        console.log('✅ Todas las historias tienen registro de interacciones');
      }
    }
    
    // 3. Obtener algunos datos de muestra
    const sampleStoryQuery = `
      SELECT h.id, h.titulo, h.autor, 
             (SELECT COUNT(*) FROM comentarios WHERE historia_id = h.id) AS comentarios_count,
             si.likes, si.views
      FROM historias h
      LEFT JOIN story_interactions si ON h.id = si.historia_id
      ORDER BY RANDOM()
      LIMIT 5
    `;
    
    const sampleStories = await executeQuery(sampleStoryQuery);
    
    console.log('\n📝 Muestra de 5 historias aleatorias:');
    for (const story of sampleStories.rows) {
      console.log(`- ID: ${story.id}, Título: "${story.titulo}", Autor: ${story.autor}`);
      console.log(`  Comentarios: ${story.comentarios_count}, Likes: ${story.likes || 0}, Vistas: ${story.views || 0}`);
      
      // Mostrar comentarios de esta historia
      const commentQuery = `
        SELECT autor, LEFT(contenido, 50) AS contenido_preview
        FROM comentarios
        WHERE historia_id = $1
        LIMIT 3
      `;
      
      const comments = await executeQuery(commentQuery, [story.id]);
      
      if (comments.rows.length > 0) {
        console.log('  Primeros comentarios:');
        for (const comment of comments.rows) {
          console.log(`  - ${comment.autor}: "${comment.contenido_preview}${comment.contenido_preview.length >= 50 ? '...' : ''}"`);
        }
      }
      
      console.log('');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error al validar datos:', error);
    return false;
  }
}

// Función auxiliar para verificar si una tabla existe
async function tableExists(tableName) {
  const query = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );
  `;
  
  const result = await executeQuery(query, [tableName]);
  return result.rows[0].exists;
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando validación de la base de datos en Supabase...');
    
    // 1. Verificar la conexión
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ No se pudo conectar a Supabase. Verifica tus credenciales.');
      process.exit(1);
    }
    
    // 2. Verificar la estructura de la base de datos
    const structureValid = await checkDatabaseStructure();
    if (!structureValid) {
      console.error('❌ La estructura de la base de datos no es válida.');
      console.error('   Considera ejecutar init-supabase-db.js para inicializar la base de datos.');
      process.exit(1);
    }
    
    // 3. Validar datos
    await validateData();
    
    console.log('\n✅ Validación completa. La base de datos en Supabase está configurada correctamente.');
    
  } catch (error) {
    console.error('❌ Error durante la validación:', error);
  } finally {
    // Cerrar la conexión con el pool
    await pool.end();
  }
}

// Ejecutar la función principal
main();
