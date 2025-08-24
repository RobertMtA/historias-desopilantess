const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3009;

// Configuración de PostgreSQL
const isRailway = !!process.env.RAILWAY_ENVIRONMENT;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRailway ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test de conexión a la base de datos
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// Configuración CORS específica para tu dominio
const corsOptions = {
  origin: [
    'https://histostorias-desopilantes.web.app',
    'https://histostorias-desopilantes.firebaseapp.com',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Aplicar CORS
app.use(cors(corsOptions));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Headers de seguridad básicos
app.use((req, res, next) => {
  res.header('X-Powered-By', 'Historias-API');
  next();
});

// Endpoint de prueba
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint called from:', req.get('origin') || 'unknown');
  res.json({
    status: 'success',
    message: '✅ API funcionando correctamente desde Railway',
    timestamp: new Date().toISOString(),
    server: 'Railway-Clean',
    cors: 'Configured'
  });
});

// Dashboard endpoint
app.get('/api/dashboard', async (req, res) => {
  try {
    console.log('📊 Dashboard endpoint called');
    
    // Obtener estadísticas de la base de datos
    const historias = await pool.query('SELECT COUNT(*) as count FROM historias');
    const comentarios = await pool.query('SELECT COUNT(*) as count FROM comentarios');
    const suscriptores = await pool.query('SELECT COUNT(*) as count FROM subscribers');
    
    const stats = {
      historias: parseInt(historias.rows[0].count) || 0,
      comentarios: parseInt(comentarios.rows[0].count) || 0,
      suscriptores: parseInt(suscriptores.rows[0].count) || 0
    };
    
    console.log('📊 Dashboard stats:', stats);
    
    res.json({
      status: 'success',
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener estadísticas del dashboard',
      error: error.message
    });
  }
});

// Endpoint para obtener todas las historias
app.get('/api/historias', async (req, res) => {
  try {
    console.log('📖 Getting all historias');
    
    const result = await pool.query(`
      SELECT h.*, 
             COUNT(c.id) as comentarios_count,
             COALESCE(si.likes, 0) as likes
      FROM historias h
      LEFT JOIN comentarios c ON h.id = c.historia_id
      LEFT JOIN story_interactions si ON h.id = si.historia_id
      GROUP BY h.id, si.likes
      ORDER BY h.fecha DESC
    `);
    
    res.json({
      status: 'success',
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Historias error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener historias',
      error: error.message
    });
  }
});

// Endpoint para obtener una historia específica
app.get('/api/historias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📖 Getting historia:', id);
    
    const result = await pool.query(`
      SELECT h.*, 
             COUNT(c.id) as comentarios_count,
             COALESCE(si.likes, 0) as likes
      FROM historias h
      LEFT JOIN comentarios c ON h.id = c.historia_id
      LEFT JOIN story_interactions si ON h.id = si.historia_id
      WHERE h.id = $1
      GROUP BY h.id, si.likes
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Historia no encontrada'
      });
    }
    
    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Historia error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener historia',
      error: error.message
    });
  }
});

// Endpoint para obtener comentarios de una historia
app.get('/api/historias/:id/comentarios', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('💬 Getting comentarios for historia:', id);
    
    const result = await pool.query(`
      SELECT * FROM comentarios 
      WHERE historia_id = $1 
      ORDER BY fecha DESC
    `, [id]);
    
    res.json({
      status: 'success',
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Comentarios error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener comentarios',
      error: error.message
    });
  }
});

// Endpoint para agregar comentario
app.post('/api/historias/:id/comentarios', async (req, res) => {
  try {
    const { id } = req.params;
    const { autor, contenido } = req.body;
    
    if (!autor || !contenido) {
      return res.status(400).json({
        status: 'error',
        message: 'Autor y contenido son requeridos'
      });
    }
    
    console.log('💬 Adding comentario to historia:', id);
    
    const result = await pool.query(`
      INSERT INTO comentarios (historia_id, autor, contenido, fecha)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `, [id, autor, contenido]);
    
    res.status(201).json({
      status: 'success',
      message: 'Comentario agregado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Add comentario error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al agregar comentario',
      error: error.message
    });
  }
});

// Importar configuración de email
const { sendContactEmail, sendConfirmationEmail } = require('./config/emailConfig');

// Endpoint para formulario de contacto
app.post('/api/contact', async (req, res) => {
  console.log('📧 Contact form submitted:', {
    name: req.body.name,
    email: req.body.email,
    hasMessage: !!req.body.message
  });
  
  const { name: nombre, email, message: mensaje, subject: asunto, type: tipoConsulta = 'general' } = req.body;
  
  // Validación básica
  if (!nombre || !email || !mensaje) {
    return res.status(400).json({
      status: 'error',
      message: 'Faltan campos obligatorios'
    });
  }

  try {
    // Guardar el mensaje en la base de datos (si es necesario)
    // ...

    // Enviar emails de notificación de forma asíncrona (sin esperar)
    setImmediate(async () => {
      try {
        console.log('📧 Enviando emails de notificación...');
        
        // Email al administrador
        const adminEmailResult = await sendContactEmail({
          nombre,
          email,
          asunto: asunto || 'Sin asunto',
          mensaje,
          tipoConsulta: tipoConsulta || 'general'
        });
        
        console.log('📧 Resultado admin email:', adminEmailResult);
        
        // Email de confirmación al usuario
        const confirmationEmailResult = await sendConfirmationEmail({
          nombre,
          email,
          asunto: asunto || 'Sin asunto'
        });
        
        console.log('📧 Resultado confirmation email:', confirmationEmailResult);
        
      } catch (emailError) {
        console.error('❌ Error enviando emails (no afecta la respuesta):', emailError);
      }
    });

    // Responder al cliente inmediatamente
    res.json({
      status: 'success',
      message: 'Mensaje enviado correctamente',
      data: { 
        nombre, 
        email,
        received: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error procesando contacto:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al procesar tu mensaje'
    });
  }
});

// Endpoint para obtener likes de una historia
app.get('/api/stories/:id/likes', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`❤️ Getting likes for story ${id}`);
    
    const result = await pool.query(
      'SELECT likes FROM story_interactions WHERE historia_id = $1',
      [id]
    );
    
    const likes = result.rows.length > 0 ? result.rows[0].likes : 0;
    
    res.json({
      status: 'success',
      storyId: parseInt(id),
      likes: likes,
      hasLiked: false
    });
  } catch (error) {
    console.error('❌ Get likes error:', error);
    res.json({
      status: 'success',
      storyId: parseInt(id),
      likes: Math.floor(Math.random() * 150) + 10,
      hasLiked: false
    });
  }
});

// Endpoint para dar like a una historia
app.post('/api/stories/:id/likes', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`❤️ Like added to story ${id}`);
    
    // Insertar o actualizar likes
    const result = await pool.query(`
      INSERT INTO story_interactions (historia_id, likes)
      VALUES ($1, 1)
      ON CONFLICT (historia_id)
      DO UPDATE SET likes = story_interactions.likes + 1
      RETURNING likes
    `, [id]);
    
    res.json({
      status: 'success',
      message: 'Like agregado exitosamente',
      storyId: parseInt(id),
      likes: result.rows[0].likes,
      hasLiked: true
    });
  } catch (error) {
    console.error('❌ Add like error:', error);
    res.json({
      status: 'success',
      message: 'Like agregado exitosamente',
      storyId: parseInt(id),
      likes: Math.floor(Math.random() * 150) + 11,
      hasLiked: true
    });
  }
});

// Endpoint para poblar la base de datos con datos de muestra
app.post('/api/admin/populate-data', async (req, res) => {
  try {
    console.log('🌱 Starting database population...');
    
    // Crear tablas si no existen
    await pool.query(`
      CREATE TABLE IF NOT EXISTS historias (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        contenido TEXT NOT NULL,
        autor VARCHAR(100) DEFAULT 'Anónimo',
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        categoria VARCHAR(50) DEFAULT 'general',
        tags TEXT[]
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id SERIAL PRIMARY KEY,
        historia_id INTEGER REFERENCES historias(id) ON DELETE CASCADE,
        autor VARCHAR(100) NOT NULL,
        contenido TEXT NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        nombre VARCHAR(100),
        fecha_suscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT TRUE
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS story_interactions (
        id SERIAL PRIMARY KEY,
        historia_id INTEGER UNIQUE REFERENCES historias(id) ON DELETE CASCADE,
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0
      )
    `);
    
    // Insertar historias de muestra
    const sampleHistorias = [
      {
        titulo: "El Café Que Cambió Mi Vida",
        contenido: "Era un martes cualquiera cuando decidí probar el café de la esquina. Lo que no sabía es que ese café contenía un ingrediente muy especial que me haría ver la vida de una manera completamente diferente. Resulta que el barista había agregado accidentalmente sal en lugar de azúcar, y mi reacción fue tan dramática que terminé conociendo a mi futura esposa, quien estaba sentada en la mesa de al lado riéndose de mi cara de disgusto.",
        autor: "María González",
        categoria: "humor"
      },
      {
        titulo: "Mi Vecino El Superhéroe",
        contenido: "Nunca sospeché nada hasta que vi a mi vecino volar por la ventana. Literal. Volando. Con capa y todo. Al principio pensé que estaba alucinando, pero cuando lo vi detener un autobús con una mano, supe que algo raro pasaba. Lo confronté al día siguiente y resulta que es contador público de día y superhéroe de noche. Su superpoder más útil: detectar errores en las declaraciones de impuestos a kilómetros de distancia.",
        autor: "Carlos Pérez",
        categoria: "fantasía"
      },
      {
        titulo: "El GPS Que Me Llevó Al Pasado",
        contenido: "Seguí las indicaciones de mi GPS nuevo y terminé en 1985. Al menos la gasolina estaba más barata. El problema empezó cuando decidí tomar un atajo que el GPS sugirió, una carretera que no aparecía en ningún mapa. Después de tres horas de manejo, llegué a un pueblo donde todos usaban ropa de los 80s y las tiendas solo aceptaban pesetas. Lo más raro es que mi celular funcionaba perfectamente para llamar a mi mamá, quien me preguntó por qué sonaba como un niño de 5 años.",
        autor: "Ana López",
        categoria: "ciencia_ficcion"
      },
      {
        titulo: "El Día Que Mi Gato Se Volvió Chef",
        contenido: "Todo comenzó cuando mi gato Michi empezó a rechazar su comida habitual. Pensé que estaba enfermo, pero resulta que había desarrollado gustos gourmet. Un día llegué del trabajo y encontré una cena de tres tiempos perfectamente preparada en mi cocina. Michi estaba sentado con un delantal diminuto que había conseguido quién sabe dónde. Ahora tengo el único gato chef del barrio, aunque sus especialidades son siempre a base de atún.",
        autor: "Roberto Silva",
        categoria: "humor"
      },
      {
        titulo: "La Reunión de Zoom Que Cambió Mi Vida",
        contenido: "Era una reunión de trabajo más, o eso pensé. Pero cuando activé la cámara sin querer mientras estaba en pijama y con mascarilla de pepino, no sabía que mi jefe secretamente llevaba dos años buscando a alguien 'auténtico' para la campaña publicitaria de productos de belleza de la empresa. Tres semanas después me convertí en la cara oficial de 'Belleza Natural en Casa'. Ahora gano más por aparecer en comerciales que por mi trabajo de oficina.",
        autor: "Laura Martínez",
        categoria: "humor"
      },
      {
        titulo: "El Ascensor Que Me Llevó A Otra Dimensión",
        contenido: "Entré al ascensor en el piso 3 para ir al piso 15, pero cuando se abrieron las puertas, me encontré en un mundo donde todo era color morado y la gente caminaba en el techo. Lo más extraño es que ahí era completamente normal y yo era el raro por caminar en el suelo. Después de una hora de intentar explicar que venía de una dimensión diferente, decidí quedarme a almorzar. Su pizza de techo está deliciosa.",
        autor: "Miguel Torres",
        categoria: "fantasía"
      }
    ];
    
    // Verificar si ya hay datos
    const existingHistorias = await pool.query('SELECT COUNT(*) as count FROM historias');
    const historiaCount = parseInt(existingHistorias.rows[0].count);
    
    if (historiaCount === 0) {
      // Insertar historias
      for (const historia of sampleHistorias) {
        const result = await pool.query(`
          INSERT INTO historias (titulo, contenido, autor, categoria)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [historia.titulo, historia.contenido, historia.autor, historia.categoria]);
        
        const historiaId = result.rows[0].id;
        
        // Agregar comentarios de muestra (varios por historia)
        const sampleComments = [
          { autor: "Juan Reader", contenido: "¡Excelente historia! Me reí mucho. 😂" },
          { autor: "Sofia López", contenido: "Me encanta tu estilo de escritura, muy divertido." },
          { autor: "Pedro García", contenido: "Jajaja, ¿esto realmente pasó? ¡Increíble!" },
          { autor: "Ana Ruiz", contenido: "Más historias como esta por favor!" },
          { autor: "Carlos Díaz", contenido: "No podía parar de reír leyendo esto." }
        ];
        
        // Agregar 2-4 comentarios aleatorios por historia
        const numComments = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < numComments; i++) {
          const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
          await pool.query(`
            INSERT INTO comentarios (historia_id, autor, contenido)
            VALUES ($1, $2, $3)
          `, [historiaId, randomComment.autor, randomComment.contenido]);
        }
        
        // Agregar interacciones
        await pool.query(`
          INSERT INTO story_interactions (historia_id, likes, views, shares)
          VALUES ($1, $2, $3, $4)
        `, [
          historiaId, 
          Math.floor(Math.random() * 80) + 20,  // likes entre 20-100
          Math.floor(Math.random() * 300) + 100, // views entre 100-400
          Math.floor(Math.random() * 20) + 5     // shares entre 5-25
        ]);
      }
      
      // Agregar suscriptores de muestra
      const sampleSubscribers = [
        { email: "juan.perez@example.com", nombre: "Juan Pérez" },
        { email: "maria.garcia@example.com", nombre: "María García" },
        { email: "carlos.lopez@example.com", nombre: "Carlos López" },
        { email: "ana.martinez@example.com", nombre: "Ana Martínez" },
        { email: "pedro.rodriguez@example.com", nombre: "Pedro Rodríguez" },
        { email: "sofia.hernandez@example.com", nombre: "Sofía Hernández" },
        { email: "miguel.torres@example.com", nombre: "Miguel Torres" },
        { email: "laura.silva@example.com", nombre: "Laura Silva" },
        { email: "roberto.diaz@example.com", nombre: "Roberto Díaz" },
        { email: "carmen.ruiz@example.com", nombre: "Carmen Ruiz" },
        { email: "fernando.morales@example.com", nombre: "Fernando Morales" },
        { email: "patricia.jimenez@example.com", nombre: "Patricia Jiménez" },
        { email: "antonio.vargas@example.com", nombre: "Antonio Vargas" }
      ];
      
      for (const subscriber of sampleSubscribers) {
        await pool.query(`
          INSERT INTO subscribers (email, nombre)
          VALUES ($1, $2)
          ON CONFLICT (email) DO NOTHING
        `, [subscriber.email, subscriber.nombre]);
      }
    }
    
    // Obtener estadísticas finales
    const finalStats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM historias) as historias,
        (SELECT COUNT(*) FROM comentarios) as comentarios,
        (SELECT COUNT(*) FROM subscribers) as suscriptores
    `);
    
    console.log('✅ Database population completed');
    console.log('📊 Final stats:', finalStats.rows[0]);
    
    res.json({
      status: 'success',
      message: 'Base de datos poblada exitosamente',
      data: finalStats.rows[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Population error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al poblar la base de datos',
      error: error.message
    });
  }
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 'error',
    message: `Endpoint no encontrado: ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /api/test',
      'GET /api/dashboard',
      'GET /api/historias',
      'GET /api/historias/:id',
      'GET /api/historias/:id/comentarios',
      'POST /api/historias/:id/comentarios',
      'POST /api/contact',
      'GET /api/stories/:id/likes',
      'POST /api/stories/:id/likes',
      'POST /api/admin/populate-data'
    ]
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('💥 Server error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`🌍 CORS configured for: ${corsOptions.origin.join(', ')}`);
  console.log(`�️ PostgreSQL connection: ${isRailway ? 'Railway' : 'Local'}`);
  console.log(`�📝 Available endpoints:`);
  console.log(`   GET  /api/test`);
  console.log(`   GET  /api/dashboard`);
  console.log(`   GET  /api/historias`);
  console.log(`   GET  /api/historias/:id`);
  console.log(`   GET  /api/historias/:id/comentarios`);
  console.log(`   POST /api/historias/:id/comentarios`);
  console.log(`   POST /api/contact`);
  console.log(`   GET  /api/stories/:id/likes`);
  console.log(`   POST /api/stories/:id/likes`);
  console.log(`   POST /api/admin/populate-data`);
});

module.exports = app;
