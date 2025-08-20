const express = require('express');
const router = express.Router();
const Historia = require('../models/Historia');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../public/uploads/historias');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `historia-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Obtener todas las historias (con paginación y filtros)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Construir filtros
    const filter = {};
    if (req.query.categoria) filter.categoria = req.query.categoria;
    if (req.query.pais) filter.pais = req.query.pais;
    if (req.query.activa !== undefined) filter.activa = req.query.activa === 'true';
    if (req.query.destacada !== undefined) filter.destacada = req.query.destacada === 'true';
    
    // Búsqueda por texto
    if (req.query.search) {
      filter.$or = [
        { titulo: { $regex: req.query.search, $options: 'i' } },
        { contenido: { $regex: req.query.search, $options: 'i' } },
        { pais: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    const historias = await Historia.find(filter)
      .sort({ fechaCreacion: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Historia.countDocuments(filter);

    res.json({
      historias,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Error al obtener historias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener una historia específica
router.get('/:id', async (req, res) => {
  try {
    const historia = await Historia.findById(req.params.id);
    
    if (!historia) {
      return res.status(404).json({ error: 'Historia no encontrada' });
    }

    res.json(historia);
  } catch (error) {
    console.error('Error al obtener historia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nueva historia
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    const historiaData = {
      titulo: req.body.titulo,
      contenido: req.body.contenido,
      pais: req.body.pais,
      año: parseInt(req.body.año),
      categoria: req.body.categoria,
      destacada: req.body.destacada === 'true',
      activa: req.body.activa !== 'false',
      autor: req.body.autor || 'Admin'
    };

    // Agregar imagen si se subió
    if (req.file) {
      historiaData.imagen = `/uploads/historias/${req.file.filename}`;
    }

    // Agregar video si se proporcionó
    if (req.body.videoUrl) {
      historiaData.video = {
        url: req.body.videoUrl,
        titulo: req.body.videoTitulo || '',
        descripcion: req.body.videoDescripcion || ''
      };
    }

    // Agregar tags si se proporcionaron
    if (req.body.tags) {
      historiaData.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    const nueva_historia = new Historia(historiaData);
    const historia_guardada = await nueva_historia.save();

    res.status(201).json({
      message: 'Historia creada exitosamente',
      historia: historia_guardada
    });
  } catch (error) {
    console.error('Error al crear historia:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

// Actualizar historia
router.put('/:id', upload.single('imagen'), async (req, res) => {
  try {
    const historia = await Historia.findById(req.params.id);
    
    if (!historia) {
      return res.status(404).json({ error: 'Historia no encontrada' });
    }

    // Actualizar campos
    if (req.body.titulo) historia.titulo = req.body.titulo;
    if (req.body.contenido) historia.contenido = req.body.contenido;
    if (req.body.pais) historia.pais = req.body.pais;
    if (req.body.año) historia.año = parseInt(req.body.año);
    if (req.body.categoria) historia.categoria = req.body.categoria;
    if (req.body.destacada !== undefined) historia.destacada = req.body.destacada === 'true';
    if (req.body.activa !== undefined) historia.activa = req.body.activa === 'true';
    if (req.body.autor) historia.autor = req.body.autor;

    // Actualizar imagen si se subió una nueva
    if (req.file) {
      // Eliminar imagen anterior si existe
      if (historia.imagen && historia.imagen.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, '../../public', historia.imagen);
        try {
          await fs.unlink(oldImagePath);
        } catch (error) {
          console.warn('No se pudo eliminar la imagen anterior:', error.message);
        }
      }
      historia.imagen = `/uploads/historias/${req.file.filename}`;
    }

    // Actualizar video
    if (req.body.videoUrl !== undefined) {
      if (req.body.videoUrl) {
        historia.video = {
          url: req.body.videoUrl,
          titulo: req.body.videoTitulo || '',
          descripcion: req.body.videoDescripcion || ''
        };
      } else {
        historia.video = { url: null, titulo: null, descripcion: null };
      }
    }

    // Actualizar tags
    if (req.body.tags !== undefined) {
      historia.tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    }

    const historia_actualizada = await historia.save();

    res.json({
      message: 'Historia actualizada exitosamente',
      historia: historia_actualizada
    });
  } catch (error) {
    console.error('Error al actualizar historia:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

// Eliminar historia
router.delete('/:id', async (req, res) => {
  try {
    const historia = await Historia.findById(req.params.id);
    
    if (!historia) {
      return res.status(404).json({ error: 'Historia no encontrada' });
    }

    // Eliminar imagen asociada si existe
    if (historia.imagen && historia.imagen.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '../../public', historia.imagen);
      try {
        await fs.unlink(imagePath);
      } catch (error) {
        console.warn('No se pudo eliminar la imagen:', error.message);
      }
    }

    await Historia.findByIdAndDelete(req.params.id);

    res.json({ message: 'Historia eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar historia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Incrementar views de una historia
router.post('/:id/view', async (req, res) => {
  try {
    const historia = await Historia.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!historia) {
      return res.status(404).json({ error: 'Historia no encontrada' });
    }

    res.json({ views: historia.views });
  } catch (error) {
    console.error('Error al incrementar views:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estadísticas
router.get('/stats/general', async (req, res) => {
  try {
    const total = await Historia.countDocuments();
    const activas = await Historia.countDocuments({ activa: true });
    const destacadas = await Historia.countDocuments({ destacada: true });
    const totalViews = await Historia.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    const categorias = await Historia.aggregate([
      { $group: { _id: '$categoria', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const paises = await Historia.aggregate([
      { $group: { _id: '$pais', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      total,
      activas,
      destacadas,
      totalViews: totalViews[0]?.total || 0,
      categorias,
      paises
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
