const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Modelo de Historia (simplificado)
const Historia = mongoose.model('Historia', {
  titulo: { type: String, required: true },
  contenido: { type: String, required: true },
  pais: String,
  año: Number,
  categoria: String,
  imagen: String,
  video: String,
  tags: [String],
  destacada: { type: Boolean, default: false },
  activa: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaModificacion: { type: Date, default: Date.now }
});

// Modelo de Admin (simplificado)
const Admin = mongoose.model('Admin', {
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  fechaCreacion: { type: Date, default: Date.now }
});

// Middleware de autenticación
const authenticateAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'historiasdesopilantes2024');
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// LOGIN ADMIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Crear admin por defecto si no existe
    let admin = await Admin.findOne({ email });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = new Admin({
        username: 'admin',
        email: 'admin@historiasdesopilantes.com',
        password: hashedPassword
      });
      await admin.save();
      console.log('✅ Admin por defecto creado: admin@historiasdesopilantes.com / admin123');
    }
    
    // Verificar credenciales
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Crear token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'historiasdesopilantes2024',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login exitoso',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Error en login admin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// OBTENER ESTADÍSTICAS GENERALES
router.get('/stats/general', authenticateAdmin, async (req, res) => {
  try {
    const totalHistorias = await Historia.countDocuments();
    const historiasDestacadas = await Historia.countDocuments({ destacada: true });
    const historiasActivas = await Historia.countDocuments({ activa: true });
    const categoriasUnicas = await Historia.distinct('categoria');
    
    res.json({
      totalHistorias,
      historiasDestacadas,
      historiasActivas,
      historiasInactivas: totalHistorias - historiasActivas,
      totalCategorias: categoriasUnicas.length,
      categorias: categoriasUnicas
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

// OBTENER HISTORIAS (con paginación y filtros)
router.get('/historias', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filtros = {};
    if (req.query.categoria) filtros.categoria = req.query.categoria;
    if (req.query.destacada) filtros.destacada = req.query.destacada === 'true';
    if (req.query.activa) filtros.activa = req.query.activa === 'true';
    
    const historias = await Historia.find(filtros)
      .sort({ fechaCreacion: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Historia.countDocuments(filtros);
    
    res.json({
      historias,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo historias:', error);
    res.status(500).json({ error: 'Error obteniendo historias' });
  }
});

// CREAR NUEVA HISTORIA
router.post('/historias', authenticateAdmin, async (req, res) => {
  try {
    const historiaData = {
      ...req.body,
      fechaCreacion: new Date(),
      fechaModificacion: new Date()
    };
    
    const nuevaHistoria = new Historia(historiaData);
    await nuevaHistoria.save();
    
    res.status(201).json({
      message: 'Historia creada exitosamente',
      historia: nuevaHistoria
    });
  } catch (error) {
    console.error('Error creando historia:', error);
    res.status(500).json({ error: 'Error creando historia' });
  }
});

// OBTENER HISTORIA POR ID
router.get('/historias/:id', authenticateAdmin, async (req, res) => {
  try {
    const historia = await Historia.findById(req.params.id);
    if (!historia) {
      return res.status(404).json({ error: 'Historia no encontrada' });
    }
    res.json(historia);
  } catch (error) {
    console.error('Error obteniendo historia:', error);
    res.status(500).json({ error: 'Error obteniendo historia' });
  }
});

// ACTUALIZAR HISTORIA
router.put('/historias/:id', authenticateAdmin, async (req, res) => {
  try {
    const historiaActualizada = await Historia.findByIdAndUpdate(
      req.params.id,
      { ...req.body, fechaModificacion: new Date() },
      { new: true }
    );
    
    if (!historiaActualizada) {
      return res.status(404).json({ error: 'Historia no encontrada' });
    }
    
    res.json({
      message: 'Historia actualizada exitosamente',
      historia: historiaActualizada
    });
  } catch (error) {
    console.error('Error actualizando historia:', error);
    res.status(500).json({ error: 'Error actualizando historia' });
  }
});

// ELIMINAR HISTORIA
router.delete('/historias/:id', authenticateAdmin, async (req, res) => {
  try {
    const historiaEliminada = await Historia.findByIdAndDelete(req.params.id);
    
    if (!historiaEliminada) {
      return res.status(404).json({ error: 'Historia no encontrada' });
    }
    
    res.json({
      message: 'Historia eliminada exitosamente',
      historia: historiaEliminada
    });
  } catch (error) {
    console.error('Error eliminando historia:', error);
    res.status(500).json({ error: 'Error eliminando historia' });
  }
});

module.exports = router;
