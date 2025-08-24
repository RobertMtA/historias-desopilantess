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

// Función para verificar la conexión
async function checkDatabase() {
  console.log("=== VERIFICANDO BASE DE DATOS ===");
  
  try {
    console.log("Conectando a PostgreSQL...");
    const client = await pool.connect();
    console.log("✅ Conexión exitosa a la base de datos");

    // Listar tablas
    console.log("\nListando tablas en la base de datos...");
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log("No se encontraron tablas");
    } else {
      console.log(`Tablas encontradas: ${tablesResult.rows.length}`);
      tablesResult.rows.forEach((row, i) => {
        console.log(`${i+1}. ${row.table_name}`);
      });
      
      // Verificar tabla stories
      if (tablesResult.rows.some(row => row.table_name === 'stories')) {
        console.log("\nVerificando tabla stories...");
        const storiesCount = await client.query("SELECT COUNT(*) FROM stories");
        console.log(`Total de historias: ${storiesCount.rows[0].count}`);
        
        // Muestra una historia de ejemplo
        const storyExample = await client.query("SELECT * FROM stories LIMIT 1");
        if (storyExample.rows.length > 0) {
          console.log("Ejemplo de historia:");
          console.log(storyExample.rows[0]);
        }
      }
      
      // Verificar comentarios
      if (tablesResult.rows.some(row => row.table_name === 'comments')) {
        console.log("\nVerificando tabla comments...");
        const commentsCount = await client.query("SELECT COUNT(*) FROM comments");
        console.log(`Total de comentarios: ${commentsCount.rows[0].count}`);
      }
      
      // Verificar likes
      if (tablesResult.rows.some(row => row.table_name === 'story_interactions')) {
        console.log("\nVerificando tabla story_interactions...");
        const likesCount = await client.query("SELECT COUNT(*) FROM story_interactions");
        console.log(`Total de interacciones: ${likesCount.rows[0].count}`);
        
        // Muestra un ejemplo
        const likesExample = await client.query("SELECT * FROM story_interactions LIMIT 1");
        if (likesExample.rows.length > 0) {
          console.log("Ejemplo de interacción:");
          console.log(likesExample.rows[0]);
        }
      }
    }
    
    client.release();
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
    console.log("\n=== VERIFICACIÓN COMPLETADA ===");
  }
}

// Ejecutar la verificación
checkDatabase();
