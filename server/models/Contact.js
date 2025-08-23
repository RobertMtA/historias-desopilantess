const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },
  asunto: {
    type: String,
    required: [true, 'El asunto es obligatorio'],
    trim: true,
    maxlength: [200, 'El asunto no puede tener más de 200 caracteres']
  },
  mensaje: {
    type: String,
    required: [true, 'El mensaje es obligatorio'],
    trim: true,
    maxlength: [2000, 'El mensaje no puede tener más de 2000 caracteres']
  },
  tipoConsulta: {
    type: String,
    enum: ['historia', 'pregunta', 'sugerencia', 'general'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['nuevo', 'leido', 'respondido', 'cerrado'],
    default: 'nuevo'
  },
  respondedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    maxlength: [1000, 'Las notas no pueden tener más de 1000 caracteres']
  }
}, {
  timestamps: true
});

// Índices
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ tipoConsulta: 1 });
contactSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);
