const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.hxxcdxddueexcqvfhiti:Masajist@40@aws-1-sa-east-1.pooler.supabase.com:6543/postgres',
  ssl: false
});

async function verificarTablaComentarios() {
  console.log('🔍 Verificando estructura de la tabla comentarios...');
  
  const client = await pool.connect();
  
  try {
    // Verificar la estructura de la tabla comentarios
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'comentarios' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Estructura de la tabla comentarios:');
    if (result.rows.length === 0) {
      console.log('❌ La tabla comentarios no existe');
    } else {
      result.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
    }
    
    // También verificar si hay datos
    const dataResult = await client.query('SELECT COUNT(*) as total FROM comentarios');
    console.log(`📈 Total comentarios en la tabla: ${dataResult.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verificarTablaComentarios();
