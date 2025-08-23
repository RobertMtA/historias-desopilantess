const mongoose = require('mongoose');

const historiaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  contenido: {
    type: String,
    required: true,
    minLength: 50,
    maxLength: 2000
  },
  pais: {
    type: String,
    required: true,
    trim: true
  },
  año: {
    type: Number,
    required: true,
    min: -3000,
    max: new Date().getFullYear()
  },
  categoria: {
    type: String,
    required: true,
    enum: ['Realeza', 'Conflictos', 'Militar', 'Naturaleza', 'Política', 'Ciencia', 'Arte', 'Deportes', 'Religión', 'Economía', 'Tecnología', 'Cultura']
  },
  imagen: {
    type: String,
    default: null
  },
  video: {
    url: {
      type: String,
      default: null
    },
    titulo: {
      type: String,
      default: null
    },
    descripcion: {
      type: String,
      default: null
    }
  },
  destacada: {
    type: Boolean,
    default: false
  },
  activa: {
    type: Boolean,
    default: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  autor: {
    type: String,
    default: 'Admin'
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
historiaSchema.index({ categoria: 1, activa: 1 });
historiaSchema.index({ pais: 1, activa: 1 });
historiaSchema.index({ destacada: 1, activa: 1 });
historiaSchema.index({ fechaCreacion: -1 });

// Middleware para actualizar fechaActualizacion
historiaSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.fechaActualizacion = new Date();
  }
  next();
});

module.exports = mongoose.model('Historia', historiaSchema);
