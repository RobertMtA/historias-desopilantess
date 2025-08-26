/**
 * server-sin-ssl.js
 * 
 * Servidor Express para Railway sin configuración SSL para PostgreSQL
 */

const express = require('express');
const cors = require('cors');
const { pool, testConnection } = require('./db-connect-no-ssl');

// Configuración del servidor
const PORT = process.env.PORT || 8080;
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración CORS
app.use(cors({
  origin: function (origin, callback) {
    // Permitir cualquier origen durante pruebas
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Estado del servidor y base de datos
let dbStatus = {
  connected: false,
  lastCheck: null,
  error: null
};

// Ruta principal
app.get('/', async (req, res) => {
  // Probar conexión a la base de datos
  const connection = await testConnection();
  
  dbStatus = {
    connected: connection.success,
    lastCheck: new Date(),
    error: connection.success ? null : connection.error
  };
  
  res.json({
    status: 'online',
    server: 'Historias Desopilantes API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus.connected ? 'connected' : 'disconnected',
    message: dbStatus.connected ? 'Sistema funcionando correctamente' : 'Sistema parcialmente disponible'
  });
});

// Ruta para verificar estado de PostgreSQL
app.get('/api/db-status', async (req, res) => {
  // Probar conexión nuevamente
  const connection = await testConnection();
  
  dbStatus = {
    connected: connection.success,
    lastCheck: new Date(),
    error: connection.success ? null : connection.error
  };
  
  if (connection.success) {
    res.json({
      status: 'ok',
      message: 'Conexión a PostgreSQL establecida correctamente',
      timestamp: new Date().toISOString(),
      serverTime: connection.time
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Error de conexión a PostgreSQL',
      error: connection.error,
      timestamp: new Date().toISOString()
    });
  }
});

// Rutas para comentarios
app.get('/api/comentarios/:historiaId', async (req, res) => {
  try {
    const { historiaId } = req.params;
    const result = await pool.query(
      'SELECT * FROM comentarios WHERE historia_id = $1 ORDER BY fecha DESC',
      [historiaId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({
      error: 'Error al obtener comentarios',
      message: error.message
    });
  }
});

app.post('/api/comentarios', async (req, res) => {
  try {
    const { historia_id, nombre, comentario } = req.body;
    
    // Validar datos
    if (!historia_id || !nombre || !comentario) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
    
    const result = await pool.query(
      'INSERT INTO comentarios (historia_id, nombre, comentario) VALUES ($1, $2, $3) RETURNING *',
      [historia_id, nombre, comentario]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al guardar comentario:', error);
    res.status(500).json({
      error: 'Error al guardar comentario',
      message: error.message
    });
  }
});

// Rutas para likes
app.get('/api/likes/:historiaId', async (req, res) => {
  try {
    const { historiaId } = req.params;
    const result = await pool.query(
      'SELECT COUNT(*) as total FROM likes WHERE historia_id = $1',
      [historiaId]
    );
    
    res.json({ total: parseInt(result.rows[0].total, 10) });
  } catch (error) {
    console.error('Error al obtener likes:', error);
    res.status(500).json({
      error: 'Error al obtener likes',
      message: error.message
    });
  }
});

app.post('/api/likes', async (req, res) => {
  try {
    const { historia_id } = req.body;
    const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Validar datos
    if (!historia_id) {
      return res.status(400).json({ error: 'Falta ID de historia' });
    }
    
    // Verificar si ya existe like desde esta IP
    const checkResult = await pool.query(
      'SELECT * FROM likes WHERE historia_id = $1 AND ip_address = $2',
      [historia_id, ip_address]
    );
    
    if (checkResult.rows.length > 0) {
      return res.status(409).json({ error: 'Ya has dado like a esta historia' });
    }
    
    // Insertar nuevo like
    const result = await pool.query(
      'INSERT INTO likes (historia_id, ip_address) VALUES ($1, $2) RETURNING id',
      [historia_id, ip_address]
    );
    
    res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error al guardar like:', error);
    res.status(500).json({
      error: 'Error al guardar like',
      message: error.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
  
  // Verificar conexión a la base de datos
  const connection = await testConnection();
  
  dbStatus = {
    connected: connection.success,
    lastCheck: new Date(),
    error: connection.success ? null : connection.error
  };
  
  if (connection.success) {
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    console.log(`✅ Hora del servidor PostgreSQL: ${connection.time}`);
  } else {
    console.error('❌ Error de conexión a PostgreSQL:', connection.error);
    console.log('⚠️ El servidor funcionará con funcionalidad limitada');
  }
});

// Manejo de señales de terminación
process.on('SIGTERM', async () => {
  console.log('Señal SIGTERM recibida, cerrando servidor...');
  const result = await module.exports.closePool();
  if (result.success) {
    console.log('Conexión a la base de datos cerrada correctamente');
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Señal SIGINT recibida, cerrando servidor...');
  const result = await module.exports.closePool();
  if (result.success) {
    console.log('Conexión a la base de datos cerrada correctamente');
  }
  process.exit(0);
});
