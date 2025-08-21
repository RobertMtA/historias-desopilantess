const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Historia = require('../models/Historia');

// Importar array de historias para referencia
let historias = [];
try {
  historias = require('../data/historias.js');
  console.log(`✅ Array de historias cargado: ${historias.length} historias`);
} catch (error) {
  console.error(`❌ Error cargando array de historias: ${error.message}`);
  historias = [];
}

// GET - Obtener todos los comentarios con paginación y filtros
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    let filtros = {};
    
    // Filtro por historia específica
    if (req.query.storyId) {
      filtros.storyId = req.query.storyId;
    }
    
    // Filtro por búsqueda
    if (req.query.search) {
      filtros.$or = [
        { userName: { $regex: req.query.search, $options: 'i' } },
        { comment: { $regex: req.query.search, $options: 'i' } },
        { storyTitle: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const comments = await Comment.find(filtros)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalComments = await Comment.countDocuments(filtros);
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

// DELETE - Eliminar comentario individual
router.delete('/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;

    const result = await Comment.findByIdAndDelete(commentId);

    if (!result) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    res.json({ 
      success: true, 
      message: 'Comentario eliminado exitosamente',
      deletedComment: result
    });

  } catch (error) {
    console.error('Error eliminando comentario:', error);
    res.status(500).json({ error: 'Error eliminando comentario' });
  }
});

// GET - Obtener comentarios de una historia específica
router.get('/story/:storyId', async (req, res) => {
  try {
    const { storyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    console.log(`🔍 Buscando comentarios para historia ID: ${storyId}`);

    const comments = await Comment.find({ storyId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalComments = await Comment.countDocuments({ storyId });
    const totalPages = Math.ceil(totalComments / limit);

    console.log(`📊 Encontrados ${comments.length} comentarios para historia ${storyId}`);

    // Obtener información de la historia
    let storyInfo = null;
    
    try {
      // Intentar buscar en BD primero (si storyId es un ObjectId válido)
      if (mongoose.Types.ObjectId.isValid(storyId)) {
        const storia = await Historia.findById(storyId);
        if (storia) {
          storyInfo = {
            titulo: storia.titulo,
            categoria: storia.categoria,
            id: storia._id
          };
          console.log(`📖 Historia encontrada en BD: ${storia.titulo}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ Error buscando historia en BD: ${error.message}`);
    }
    
    // Si no se encontró en BD, buscar en array de historias estáticas
    if (!storyInfo) {
      try {
        const staticStory = historias.find(h => h.id == storyId || h._id == storyId);
        if (staticStory) {
          storyInfo = {
            titulo: staticStory.titulo,
            categoria: staticStory.categoria,
            id: staticStory.id || staticStory._id
          };
          console.log(`📚 Historia encontrada en array estático: ${staticStory.titulo}`);
        } else {
          console.log(`❌ Historia con ID ${storyId} no encontrada ni en BD ni en array estático`);
        }
      } catch (error) {
        console.log(`⚠️ Error buscando en array estático: ${error.message}`);
        storyInfo = {
          titulo: `Historia ${storyId}`,
          categoria: 'Desconocida',
          id: storyId
        };
      }
    }

    res.json({
      comments: comments || [],
      storyInfo: storyInfo || {
        titulo: `Historia ${storyId}`,
        categoria: 'Sin categoría',
        id: storyId
      },
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
    console.error('❌ Error obteniendo comentarios de historia:', error);
    res.status(500).json({ 
      error: 'Error obteniendo comentarios de historia',
      details: error.message 
    });
  }
});

// DELETE - Eliminar múltiples comentarios de una historia específica
router.delete('/story/:storyId', async (req, res) => {
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

// POST - Crear nuevo comentario
router.post('/', async (req, res) => {
  try {
    const { userName, comment, storyId, storyTitle, storyCategory, ip, userAgent } = req.body;

    if (!userName || !comment || !storyId) {
      return res.status(400).json({ 
        error: 'userName, comment y storyId son requeridos' 
      });
    }

    const newComment = new Comment({
      userName,
      comment,
      storyId,
      storyTitle,
      storyCategory,
      ip,
      userAgent,
      approved: true
    });

    const savedComment = await newComment.save();

    res.status(201).json({
      success: true,
      message: 'Comentario creado exitosamente',
      comment: savedComment
    });

  } catch (error) {
    console.error('Error creando comentario:', error);
    res.status(500).json({ error: 'Error creando comentario' });
  }
});

// GET - Obtener historias que tienen comentarios (agregación)
router.get('/stories-with-comments', async (req, res) => {
  try {
    console.log('🔍 Obteniendo historias que tienen comentarios...');

    const storiesWithComments = await Comment.aggregate([
      {
        $group: {
          _id: "$storyId",
          storyTitle: { $first: "$storyTitle" },
          storyCategory: { $first: "$storyCategory" },
          commentCount: { $sum: 1 },
          lastComment: { $max: "$createdAt" },
          firstComment: { $min: "$createdAt" }
        }
      },
      {
        $sort: { commentCount: -1, lastComment: -1 }
      }
    ]);

    console.log(`✅ Encontradas ${storiesWithComments.length} historias con comentarios`);

    // Enriquecer con información de historias locales si está disponible
    const enrichedStories = storiesWithComments.map(story => {
      const localStory = historias.find(h => h.id.toString() === story._id);
      return {
        storyId: story._id,
        storyTitle: story.storyTitle || localStory?.titulo || `Historia ${story._id}`,
        storyCategory: story.storyCategory || localStory?.categoria || 'Sin categoría',
        commentCount: story.commentCount,
        lastComment: story.lastComment,
        firstComment: story.firstComment,
        localStoryInfo: localStory ? {
          pais: localStory.pais,
          año: localStory.año,
          imagen: localStory.imagen
        } : null
      };
    });

    res.json({
      success: true,
      count: enrichedStories.length,
      stories: enrichedStories
    });

  } catch (error) {
    console.error('Error obteniendo historias con comentarios:', error);
    res.status(500).json({ error: 'Error obteniendo historias con comentarios' });
  }
});

module.exports = router;
