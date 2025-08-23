const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minLength: 3,
    maxLength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  rol: {
    type: String,
    enum: ['superadmin', 'admin', 'editor'],
    default: 'editor'
  },
  activo: {
    type: Boolean,
    default: true
  },
  ultimoLogin: {
    type: Date,
    default: null
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  avatar: {
    type: String,
    default: null
  },
  permisos: {
    historias: {
      crear: { type: Boolean, default: true },
      editar: { type: Boolean, default: true },
      eliminar: { type: Boolean, default: false },
      publicar: { type: Boolean, default: false }
    },
    usuarios: {
      ver: { type: Boolean, default: false },
      crear: { type: Boolean, default: false },
      editar: { type: Boolean, default: false },
      eliminar: { type: Boolean, default: false }
    },
    configuracion: {
      acceso: { type: Boolean, default: false }
    }
  }
}, {
  timestamps: true
});

// Hash password antes de guardar
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para verificar password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Método para actualizar último login
adminSchema.methods.updateLastLogin = async function() {
  this.ultimoLogin = new Date();
  return await this.save();
};

module.exports = mongoose.model('Admin', adminSchema);
