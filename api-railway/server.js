const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3009;

// Modelos
const StoryInteraction = require('./StoryInteraction');

// Modelo de Comentario (para compatibilidad con comentarios separados)
const Comment = mongoose.model('Comment', {
  userName: { type: String, required: true },
  comment: { type: String, required: true },
  storyId: { type: String, required: true },
  storyTitle: String,
  storyCategory: String,
  ip: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now },
  approved: { type: Boolean, default: true }
});

// Función para obtener IP del cliente
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
};

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conectado a MongoDB Atlas');
})
.catch((error) => {
  console.error('❌ Error conectando a MongoDB:', error);
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

// Endpoint para formulario de contacto
app.post('/api/contact', (req, res) => {
  console.log('📧 Contact form submitted:', {
    name: req.body.name,
    email: req.body.email,
    hasMessage: !!req.body.message
  });
  
  const { name, email, message } = req.body;
  
  // Validación básica
  if (!name || !email || !message) {
    return res.status(400).json({
      status: 'error',
      message: 'Faltan campos obligatorios'
    });
  }
  
  // Simular procesamiento exitoso
  res.json({
    status: 'success',
    message: 'Mensaje enviado correctamente',
    data: { 
      name, 
      email,
      received: new Date().toISOString()
    }
  });
});

// Endpoint para obtener likes de una historia
app.get('/api/stories/:id/likes', async (req, res) => {
  const { id } = req.params;
  console.log(`👍 Getting likes for story ${id}`);
  
  try {
    let interaction = await StoryInteraction.findOne({ storyId: id.toString() });
    
    if (!interaction) {
      return res.json({
        status: 'success',
        storyId: parseInt(id),
        likes: 0,
        hasLiked: false
      });
    }
    
    const clientIP = getClientIP(req);
    const hasLiked = interaction.likedIPs && interaction.likedIPs.includes(clientIP);
    
    res.json({
      status: 'success',
      storyId: parseInt(id),
      likes: interaction.likes || 0,
      hasLiked: hasLiked
    });
  } catch (error) {
    console.error('❌ Error obteniendo likes:', error);
    res.status(500).json({
      status: 'error',
      storyId: parseInt(id),
      likes: 0,
      hasLiked: false
    });
  }
});

// Endpoint para dar like a una historia (POST /api/stories/:id/likes)
app.post('/api/stories/:id/likes', async (req, res) => {
  const { id } = req.params;
  console.log(`❤️ Like added to story ${id}`);
  
  try {
    const clientIP = getClientIP(req);
    let interaction = await StoryInteraction.findOne({ storyId: id.toString() });
    
    if (!interaction) {
      // Crear nueva interacción si no existe
      interaction = new StoryInteraction({
        storyId: id.toString(),
        likes: 1,
        likedIPs: [clientIP],
        comments: []
      });
    } else {
      // Verificar si esta IP ya dio like
      if (interaction.likedIPs && interaction.likedIPs.includes(clientIP)) {
        return res.status(400).json({
          status: 'error',
          message: 'Ya has dado like a esta historia',
          storyId: parseInt(id),
          likes: interaction.likes || 0,
          hasLiked: true
        });
      }
      
      // Incrementar likes y agregar IP
      interaction.likes = (interaction.likes || 0) + 1;
      if (!interaction.likedIPs) interaction.likedIPs = [];
      interaction.likedIPs.push(clientIP);
    }
    
    await interaction.save();
    
    res.json({
      status: 'success',
      message: 'Like agregado exitosamente',
      storyId: parseInt(id),
      likes: interaction.likes,
      hasLiked: true
    });
    
  } catch (error) {
    console.error('❌ Error agregando like:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error agregando like',
      storyId: parseInt(id),
      likes: 0,
      hasLiked: false
    });
  }
});

// Endpoint para dar like a una historia (POST /api/stories/:id/like - singular)
app.post('/api/stories/:id/like', async (req, res) => {
  const { id } = req.params;
  console.log(`❤️ Like added to story ${id} (singular endpoint)`);
  
  try {
    const clientIP = getClientIP(req);
    let interaction = await StoryInteraction.findOne({ storyId: id.toString() });
    
    if (!interaction) {
      // Crear nueva interacción si no existe
      interaction = new StoryInteraction({
        storyId: id.toString(),
        likes: 1,
        likedIPs: [clientIP],
        comments: []
      });
    } else {
      // Verificar si esta IP ya dio like
      if (interaction.likedIPs && interaction.likedIPs.includes(clientIP)) {
        return res.status(400).json({
          status: 'error',
          message: 'Ya has dado like a esta historia',
          storyId: parseInt(id),
          likes: interaction.likes || 0,
          hasLiked: true
        });
      }
      
      // Incrementar likes y agregar IP
      interaction.likes = (interaction.likes || 0) + 1;
      if (!interaction.likedIPs) interaction.likedIPs = [];
      interaction.likedIPs.push(clientIP);
    }
    
    await interaction.save();
    
    res.json({
      status: 'success',
      message: 'Like agregado exitosamente',
      storyId: parseInt(id),
      likes: interaction.likes,
      hasLiked: true
    });
    
  } catch (error) {
    console.error('❌ Error agregando like:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error agregando like',
      storyId: parseInt(id),
      likes: 0,
      hasLiked: false
    });
  }
});

// Endpoint para obtener comentarios de una historia
app.get('/api/stories/:id/comments', async (req, res) => {
  const { id } = req.params;
  console.log(`💬 Getting comments for story ${id}`);
  
  try {
    // Primero buscar comentarios en StoryInteraction
    const storyInteraction = await StoryInteraction.findOne({ storyId: id.toString() });
    
    // También buscar comentarios separados en la colección Comment (por compatibilidad)
    const separateComments = await Comment.find({ 
      storyId: id.toString(), 
      approved: true 
    }).sort({ createdAt: -1 });
    
    let allComments = [];
    
    // Agregar comentarios de StoryInteraction
    if (storyInteraction && storyInteraction.comments) {
      allComments = storyInteraction.comments.map(comment => ({
        id: comment._id || comment.id,
        author: comment.userName,
        text: comment.comment,
        date: comment.createdAt,
        source: 'storyinteraction'
      }));
    }
    
    // Agregar comentarios separados
    separateComments.forEach(comment => {
      allComments.push({
        id: comment._id,
        author: comment.userName,
        text: comment.comment,
        date: comment.createdAt,
        storyTitle: comment.storyTitle,
        source: 'comment'
      });
    });
    
    // Ordenar por fecha más reciente primero
    allComments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Limitar a 50 comentarios
    allComments = allComments.slice(0, 50);
    
    res.json({
      status: 'success',
      storyId: parseInt(id),
      comments: allComments,
      total: allComments.length
    });
  } catch (error) {
    console.error('❌ Error obteniendo comentarios:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error obteniendo comentarios',
      comments: [],
      total: 0
    });
  }
});

// Endpoint para agregar un nuevo comentario
app.post('/api/stories/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { userName, comment, storyTitle } = req.body;
  
  console.log(`📝 Adding comment to story ${id} by ${userName}`);
  
  try {
    // Validar datos
    if (!userName || !comment) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan datos obligatorios (userName, comment)'
      });
    }
    
    const clientIP = getClientIP(req);
    const newCommentData = {
      userName: userName.substring(0, 50), // Limitar nombre
      comment: comment.substring(0, 500), // Limitar comentario
      createdAt: new Date()
    };
    
    // 1. Agregar comentario a StoryInteraction
    let interaction = await StoryInteraction.findOne({ storyId: id.toString() });
    
    if (!interaction) {
      // Crear nueva interacción si no existe
      interaction = new StoryInteraction({
        storyId: id.toString(),
        likes: 0,
        likedIPs: [],
        comments: [newCommentData]
      });
    } else {
      // Agregar comentario al array existente
      if (!interaction.comments) interaction.comments = [];
      interaction.comments.push(newCommentData);
    }
    
    await interaction.save();
    
    // 2. También crear comentario separado para compatibilidad
    const newComment = new Comment({
      userName: newCommentData.userName,
      comment: newCommentData.comment,
      storyId: id.toString(),
      storyTitle: storyTitle || `Historia ${id}`,
      ip: clientIP,
      userAgent: req.get('User-Agent') || 'Unknown',
      createdAt: newCommentData.createdAt,
      approved: true
    });
    
    await newComment.save();
    
    res.json({
      status: 'success',
      message: 'Comentario agregado exitosamente',
      comment: {
        id: newComment._id,
        author: newCommentData.userName,
        text: newCommentData.comment,
        date: newCommentData.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Error guardando comentario:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error guardando comentario'
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
      'POST /api/contact',
      'GET /api/stories/:id/likes',
      'POST /api/stories/:id/likes',
      'POST /api/stories/:id/like',
      'GET /api/stories/:id/comments',
      'POST /api/stories/:id/comments'
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
  console.log(`📝 Available endpoints:`);
  console.log(`   GET  /api/test`);
  console.log(`   POST /api/contact`);
  console.log(`   GET  /api/stories/:id/likes`);
  console.log(`   POST /api/stories/:id/likes`);
  console.log(`   POST /api/stories/:id/like`);
  console.log(`   GET  /api/stories/:id/comments`);
  console.log(`   POST /api/stories/:id/comments`);
});

module.exports = app;
