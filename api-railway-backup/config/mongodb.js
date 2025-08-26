/**
 * Configuración de conexión a MongoDB
 * IMPORTANTE: Las credenciales deben almacenarse como variables de entorno, nunca en el código
 */

const mongoose = require('mongoose');

// Función para conectar a MongoDB
async function connectToMongoDB() {
  try {
    // Obtener la URL de conexión desde variables de entorno
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ Variable de entorno MONGODB_URI no definida');
      return false;
    }
    
    console.log('🔄 Conectando a MongoDB...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Conexión a MongoDB establecida');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    return false;
  }
}

// Modelos de MongoDB
const StoryInteractionSchema = new mongoose.Schema({
  historia_id: { 
    type: Number, 
    required: true,
    unique: true 
  },
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const CommentarioSchema = new mongoose.Schema({
  historia_id: {
    type: Number,
    required: true
  },
  autor: {
    type: String,
    required: true
  },
  contenido: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

// Crear modelos
const StoryInteraction = mongoose.model('StoryInteraction', StoryInteractionSchema);
const Comentario = mongoose.model('Comentario', CommentarioSchema);

module.exports = {
  connectToMongoDB,
  mongoose,
  models: {
    StoryInteraction,
    Comentario
  }
};
