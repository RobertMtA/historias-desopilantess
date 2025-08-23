const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Importar array de historias para referencia
const historias = require('../src/data/historias');

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

// Modelo de Comentario (simplificado)
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

// ========================
// RUTAS DE COMENTARIOS
// ========================

// Obtener todos los comentarios (con paginación)
router.get('/comments', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Obtener comentarios con paginación
    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Contar total de comentarios
    const totalComments = await Comment.countDocuments();
    const totalPages = Math.ceil(totalComments / limit);

    res.json({
      comments: comments || [],
      pagination: {
        current: page,
        pages: totalPages,
        total: totalComments,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error obteniendo comentarios:', error);
    res.status(500).json({ error: 'Error obteniendo comentarios' });
  }
});

// Eliminar un comentario específico
router.delete('/comments/:commentId', authenticateAdmin, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { storyId } = req.body;

    console.log('🗑️ Eliminando comentario:', commentId, 'storyId:', storyId);

    if (!storyId) {
      return res.status(400).json({ error: 'storyId es requerido' });
    }

    // Buscar y eliminar el comentario
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    console.log('✅ Comentario eliminado exitosamente');

    res.json({
      message: 'Comentario eliminado exitosamente',
      comment: deletedComment
    });

  } catch (error) {
    console.error('Error eliminando comentario:', error);
    res.status(500).json({ error: 'Error eliminando comentario' });
  }
});

// Crear un comentario de prueba
router.post('/comments', authenticateAdmin, async (req, res) => {
  try {
    const { userName, comment, storyId, storyTitle, storyCategory } = req.body;

    if (!userName || !comment || !storyId) {
      return res.status(400).json({ error: 'userName, comment y storyId son requeridos' });
    }

    const newComment = new Comment({
      userName,
      comment,
      storyId,
      storyTitle: storyTitle || 'Historia de prueba',
      storyCategory: storyCategory || 'general',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const savedComment = await newComment.save();

    res.status(201).json({
      message: 'Comentario creado exitosamente',
      comment: savedComment
    });

  } catch (error) {
    console.error('Error creando comentario:', error);
    res.status(500).json({ error: 'Error creando comentario' });
  }
});

// GET - Obtener comentarios de una historia específica
router.get('/historias/:storyId/comments', authenticateAdmin, async (req, res) => {
  try {
    const { storyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ storyId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalComments = await Comment.countDocuments({ storyId });
    const totalPages = Math.ceil(totalComments / limit);

    // Obtener información de la historia
    const storia = await Historia.findOne({ _id: storyId }) || 
                   historias.find(h => h.id === storyId || h._id === storyId);

    res.json({
      comments: comments || [],
      storyInfo: storia ? {
        titulo: storia.titulo || storia.title,
        categoria: storia.categoria || storia.category,
        id: storia._id || storia.id
      } : null,
      pagination: {
        current: page,
        pages: totalPages,
        total: totalComments,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error obteniendo comentarios de historia:', error);
    res.status(500).json({ error: 'Error obteniendo comentarios de historia' });
  }
});

// DELETE - Eliminar múltiples comentarios de una historia específica
router.delete('/historias/:storyId/comments', authenticateAdmin, async (req, res) => {
  try {
    const { storyId } = req.params;
    const { commentIds } = req.body;

    if (!commentIds || !Array.isArray(commentIds)) {
      return res.status(400).json({ error: 'Se requiere un array de commentIds' });
    }

    const result = await Comment.deleteMany({ 
      _id: { $in: commentIds },
      storyId: storyId
    });

    res.json({ 
      success: true, 
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} comentarios eliminados exitosamente`
    });

  } catch (error) {
    console.error('Error eliminando comentarios:', error);
    res.status(500).json({ error: 'Error eliminando comentarios' });
  }
});

module.exports = router;
