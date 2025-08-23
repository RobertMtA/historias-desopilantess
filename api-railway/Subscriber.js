const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  source: {
    type: String,
    enum: ['home', 'footer', 'contacto'],
    default: 'home'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  lastEmailSent: {
    type: Date,
    default: null
  },
  unsubscribedAt: {
    type: Date,
    default: null
  },
  unsubscribeToken: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Índices para mejorar rendimiento
subscriberSchema.index({ email: 1 });
subscriberSchema.index({ isActive: 1 });
subscriberSchema.index({ subscribedAt: -1 });

// Método para generar token de desuscripción
subscriberSchema.methods.generateUnsubscribeToken = function() {
  const crypto = require('crypto');
  this.unsubscribeToken = crypto.randomBytes(32).toString('hex');
  return this.unsubscribeToken;
};

// Método para desuscribir
subscriberSchema.methods.unsubscribe = function() {
  this.isActive = false;
  this.unsubscribedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Subscriber', subscriberSchema);
