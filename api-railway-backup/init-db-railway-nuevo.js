/**
 * Script para inicializar la base de datos en Railway
 * con 49 historias y 3 comentarios por historia
 */

const { Pool } = require('pg');

// Configuración de conexión
const connectionString = process.env.DATABASE_URL;
console.log('Iniciando inicialización de tablas en Railway...');
console.log('Fecha y hora:', new Date().toISOString());

if (!connectionString) {
  console.error('ERROR: No se encontró la variable DATABASE_URL');
  process.exit(1);
}

// Configuración del pool de conexiones con múltiples opciones
let pool;

// Intentar diferentes configuraciones de conexión
try {
  console.log('Intentando conexión con SSL rejectUnauthorized=false...');
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
} catch (error) {
  console.log('Error con la configuración SSL estándar, intentando sin SSL...');
  pool = new Pool({
    connectionString,
    ssl: false
  });
}

// Lista de nombres para comentarios
const autores = [
  "Juan Pérez", "Laura García", "Carlos Rodríguez", "Ana Martínez", 
  "Pedro Sánchez", "María López", "Elena Gómez", "David Muñoz", 
  "Carmen Díaz", "Miguel Torres", "Sofía Ruiz", "Alejandro Fernández", 
  "Lucía Vega", "Javier Moreno", "Isabella Herrera"
];

// Lista de comentarios genéricos
const comentarios = [
  "¡Me encantó esta historia! Realmente muestra lo absurdo de algunas situaciones cotidianas.",
  "No podía parar de reír mientras leía esto. ¡Qué situación tan graciosa!",
  "Esto me recordó a algo similar que me pasó hace años, aunque menos divertido.",
  "El autor tiene un estilo único para narrar estas anécdotas. Muy entretenido.",
  "Estas historias desopilantes son justo lo que necesitaba hoy. Gracias por compartirlas.",
  "Me pregunto si esto realmente sucedió o es una exageración creativa. De cualquier manera, ¡me encanta!",
  "Voy a compartir esta historia con mis amigos, seguro que también les encantará.",
  "La forma en que se desarrolla la trama es fantástica, con un final inesperado.",
  "Este tipo de anécdotas hacen que el día sea mejor. ¡Sigan publicando más!",
  "Me gustaría conocer más detalles sobre esta historia. ¿Habrá una continuación?",
  "La descripción de los personajes es genial, puedo imaginarlos perfectamente.",
  "Me reí tanto que mi familia vino a ver qué estaba pasando. ¡Historia totalmente compartible!",
  "Creo que el protagonista podría haber evitado todo esto con un poco más de sentido común, ¡pero no sería tan divertido!",
  "Historias como esta hacen que valga la pena visitar esta web regularmente.",
  "¡Este sitio se ha convertido en mi fuente diaria de risas! Gracias por tanto."
];

// Títulos de historias desopilantes
const titulos = [
  "El día que mi GPS me llevó a otro país",
  "Cómo confundí a mi jefe con el repartidor de pizza",
  "La reunión virtual donde mi gato se hizo famoso",
  "Cuando el autocorrector me metió en problemas",
  "La fiesta sorpresa que salió muy, muy mal",
  "Mi primer día de trabajo y sus desastres",
  "La confusión en el aeropuerto internacional",
  "Cómo terminé adoptando tres perros en un día",
  "La mudanza que se convirtió en pesadilla",
  "Mi experiencia como jurado en un concurso de talentos local",
  "El día que fui confundido con una celebridad",
  "La cena familiar que terminó en el hospital (pero de risa)",
  "Cómo sobreviví a mi primera clase de yoga",
  "Mi desastrosa cita a ciegas",
  "La vez que me quedé encerrado en el supermercado"
];

// Función para generar una fecha aleatoria en los últimos 30 días
function randomDate() {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  return date.toISOString();
}

// Función para crear las tablas y agregar datos
async function createTables() {
  console.log('Conectando a la base de datos...');
  const client = await pool.connect();
  
  try {
    console.log('Conexión establecida. Creando tablas...');
    
    // Iniciar transacción
    await client.query('BEGIN');
    
    // Crear tabla de historias
    console.log('Creando tabla historias...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS historias (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        contenido TEXT NOT NULL,
        autor VARCHAR(100),
        categoria VARCHAR(50),
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT true
      )
    `);
    console.log('Tabla historias creada correctamente');
    
    // Crear tabla de comentarios
    console.log('Creando tabla comentarios...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id SERIAL PRIMARY KEY,
        historia_id INTEGER NOT NULL,
        autor VARCHAR(100) NOT NULL,
        contenido TEXT NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT TRUE
      )
    `);
    console.log('Tabla comentarios creada correctamente');
    
    // Crear tabla de interacciones (likes)
    console.log('Creando tabla story_interactions...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS story_interactions (
        id SERIAL PRIMARY KEY,
        historia_id INTEGER NOT NULL UNIQUE,
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0
      )
    `);
    console.log('Tabla story_interactions creada correctamente');
    
    // Verificar si hay historias
    const result = await client.query('SELECT COUNT(*) FROM historias');
    const count = parseInt(result.rows[0].count);
    console.log(`Historias existentes: ${count}`);
    
    // Si no hay historias, insertar 49 historias de ejemplo
    if (count === 0) {
      console.log('Insertando 49 historias de ejemplo...');
      
      // Limpiar datos existentes
      await client.query('DELETE FROM comentarios');
      await client.query('DELETE FROM historias');
      await client.query('DELETE FROM story_interactions');
      await client.query('ALTER SEQUENCE historias_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE comentarios_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE story_interactions_id_seq RESTART WITH 1');
      console.log('Datos anteriores limpiados correctamente');
      
      // Función para generar contenido de historia
      function generarContenidoHistoria(index) {
        const titulo = titulos[index % titulos.length];
        
        const parrafos = [
          `Todo comenzó un día aparentemente normal. ${titulo.charAt(0).toLowerCase() + titulo.slice(1)} parecía algo imposible, pero me ocurrió.`,
          
          `Era un ${['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'][Math.floor(Math.random() * 7)]} por la ${['mañana', 'tarde', 'noche'][Math.floor(Math.random() * 3)]} cuando decidí ${['salir a caminar', 'visitar a un amigo', 'ir de compras', 'probar algo nuevo', 'resolver un problema'][Math.floor(Math.random() * 5)]}.`,
          
          `Nunca imaginé que algo tan simple se convertiría en una de las situaciones más hilarantes de mi vida. Si alguien me hubiera dicho lo que estaba por suceder, probablemente no le habría creído.`,
          
          `La situación se complicó cuando ${['apareció una persona inesperada', 'se cortó la luz', 'comenzó a llover intensamente', 'me di cuenta que había olvidado algo importante', 'sonó mi teléfono con una llamada urgente'][Math.floor(Math.random() * 5)]}.`,
          
          `Lo peor (o lo más gracioso) fue cuando intenté ${['disimular', 'resolver el problema', 'pedir ayuda', 'escapar de la situación', 'explicar lo sucedido'][Math.floor(Math.random() * 5)]} y solo logré empeorar todo.`,
          
          `Al final, después de muchas risas y momentos incómodos, aprendí una valiosa lección: ${['nunca subestimes el poder del humor', 'a veces las cosas no salen como esperamos y está bien', 'la vida está llena de momentos absurdos que luego se convierten en grandes historias', 'reírse de uno mismo es la mejor terapia', 'los errores más vergonzosos suelen ser los más divertidos de contar'][Math.floor(Math.random() * 5)]}.`
        ];
        
        return parrafos.join('\n\n');
      }
      
      // Insertar 49 historias con títulos, contenido y autores
      for (let i = 1; i <= 49; i++) {
        const tituloIndex = (i - 1) % titulos.length;
        const titulo = titulos[tituloIndex];
        const contenido = generarContenidoHistoria(i - 1);
        const autorIndex = Math.floor(Math.random() * autores.length);
        const autor = autores[autorIndex];
        
        // Insertar historia
        await client.query(`
          INSERT INTO historias (id, titulo, contenido, autor, categoria, fecha, activo)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [i, titulo, contenido, autor, 'Comedia', randomDate(), true]);
        
        // Mostrar progreso cada 10 historias
        if (i % 10 === 0) {
          console.log(`Insertadas ${i} de 49 historias...`);
        }
      }
      
      console.log('49 historias insertadas correctamente');
      
      // Insertar comentarios (3 por historia)
      console.log('Insertando 3 comentarios por historia (147 en total)...');
      
      // Función para generar 3 comentarios para una historia
      async function generarComentariosParaHistoria(id) {
        // Seleccionar 3 comentarios aleatorios con autores diferentes
        const comentariosSeleccionados = [];
        const autoresUsados = new Set();
        
        // Asegurarnos de que tenemos 3 autores diferentes
        while (comentariosSeleccionados.length < 3) {
          const autorIndex = Math.floor(Math.random() * autores.length);
          const autor = autores[autorIndex];
          
          // Evitar repetir autores
          if (!autoresUsados.has(autor)) {
            const comentarioIndex = Math.floor(Math.random() * comentarios.length);
            const comentario = comentarios[comentarioIndex];
            const fecha = randomDate();
            
            comentariosSeleccionados.push({
              autor,
              contenido: comentario,
              fecha
            });
            
            autoresUsados.add(autor);
          }
        }
        
        // Insertar los comentarios en la base de datos
        for (const comentario of comentariosSeleccionados) {
          await client.query(
            'INSERT INTO comentarios (historia_id, autor, contenido, fecha, activo) VALUES ($1, $2, $3, $4, $5)',
            [id, comentario.autor, comentario.contenido, comentario.fecha, true]
          );
        }
      }
      
      // Generar comentarios para cada historia
      for (let i = 1; i <= 49; i++) {
        await generarComentariosParaHistoria(i);
        
        // Mostrar progreso cada 10 historias
        if (i % 10 === 0) {
          console.log(`Comentarios generados para ${i} de 49 historias...`);
        }
      }
      
      console.log('147 comentarios insertados correctamente');
    }
    
    // Confirmar transacción
    await client.query('COMMIT');
    console.log('Todas las operaciones completadas correctamente');
    
  } catch (error) {
    // Revertir cambios en caso de error
    await client.query('ROLLBACK');
    console.error('Error durante la creación de tablas:', error);
    throw error;
  } finally {
    // Liberar cliente
    client.release();
    console.log('Cliente liberado');
  }
}

// Función para verificar los comentarios
async function verificarComentarios() {
  console.log('Verificando comentarios...');
  
  const client = await pool.connect();
  
  try {
    // Contar total de historias y comentarios
    const historiasResult = await client.query('SELECT COUNT(*) FROM historias');
    const comentariosResult = await client.query('SELECT COUNT(*) FROM comentarios');
    
    const totalHistorias = parseInt(historiasResult.rows[0].count);
    const totalComentarios = parseInt(comentariosResult.rows[0].count);
    
    console.log(`Resumen final:`);
    console.log(`- Total de historias: ${totalHistorias}`);
    console.log(`- Total de comentarios: ${totalComentarios}`);
    
    // Obtener un ejemplo de los comentarios de la primera historia
    const ejemploComentarios = await client.query('SELECT * FROM comentarios WHERE historia_id = 1');
    
    console.log('\nEjemplo de comentarios para la historia 1:');
    console.log(JSON.stringify({
      status: 'success',
      data: ejemploComentarios.rows,
      total: ejemploComentarios.rows.length,
      storyId: 1
    }, null, 2));
    
  } catch (error) {
    console.error('Error al verificar comentarios:', error);
  } finally {
    client.release();
  }
}

// Ejecutar funciones principales
async function main() {
  try {
    // Crear las tablas e insertar datos
    await createTables();
    
    // Verificar los comentarios insertados
    await verificarComentarios();
    
    console.log('Proceso de inicialización completado con éxito');
  } catch (error) {
    console.error('Error durante la inicialización:', error);
    process.exit(1);
  } finally {
    // Cerrar el pool de conexiones
    await pool.end();
    console.log('Conexión a la base de datos cerrada');
  }
}

// Ejecutar la función principal
main();
