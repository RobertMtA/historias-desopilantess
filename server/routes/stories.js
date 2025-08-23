const express = require('express');
const router = express.Router();
const StoryInteraction = require('../models/StoryInteraction');

// Middleware para obtener IP del cliente
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
};

// Obtener likes de una historia
router.get('/:storyId/likes', async (req, res) => {
  try {
    const { storyId } = req.params;
    const clientIP = getClientIP(req);
    
    let story = await StoryInteraction.findOne({ storyId: parseInt(storyId) });
    
    if (!story) {
      return res.json({ count: 0, userLiked: false });
    }
    
    const userLiked = story.likedIPs.includes(clientIP);
    
    res.json({ 
      count: story.likes,
      userLiked: userLiked
    });
  } catch (error) {
    console.error('Error getting likes:', error);
    res.status(500).json({ error: 'Error obteniendo likes' });
  }
});

// Dar/quitar like a una historia
router.post('/:storyId/like', async (req, res) => {
  try {
    const { storyId } = req.params;
    const { liked } = req.body;
    const clientIP = getClientIP(req);
    
    let story = await StoryInteraction.findOne({ storyId: parseInt(storyId) });
    
    if (!story) {
      story = new StoryInteraction({
        storyId: parseInt(storyId),
        likes: 0,
        comments: [],
        likedIPs: []
      });
    }
    
    const hasLiked = story.likedIPs.includes(clientIP);
    
    if (liked && !hasLiked) {
      // Agregar like
      story.likes += 1;
      story.likedIPs.push(clientIP);
    } else if (!liked && hasLiked) {
      // Quitar like
      story.likes = Math.max(0, story.likes - 1);
      story.likedIPs = story.likedIPs.filter(ip => ip !== clientIP);
    }
    
    await story.save();
    
    res.json({ 
      count: story.likes,
      userLiked: story.likedIPs.includes(clientIP)
    });
  } catch (error) {
    console.error('Error updating like:', error);
    res.status(500).json({ error: 'Error actualizando like' });
  }
});

// Obtener comentarios de una historia
router.get('/:storyId/comments', async (req, res) => {
  try {
    const { storyId } = req.params;
    
    let story = await StoryInteraction.findOne({ storyId: parseInt(storyId) });
    
    if (!story) {
      return res.json([]);
    }
    
    // Ordenar comentarios por fecha (más recientes primero)
    const comments = story.comments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(comment => ({
        userName: comment.userName,
        comment: comment.comment,
        createdAt: comment.createdAt
      }));
    
    res.json(comments);
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ error: 'Error obteniendo comentarios' });
  }
});

// Agregar comentario a una historia
router.post('/:storyId/comments', async (req, res) => {
  try {
    const { storyId } = req.params;
    const { userName, comment } = req.body;
    const clientIP = getClientIP(req);
    
    // Validaciones
    if (!userName || !comment) {
      return res.status(400).json({ error: 'Nombre de usuario y comentario son requeridos' });
    }
    
    if (userName.length > 50) {
      return res.status(400).json({ error: 'El nombre de usuario no puede exceder 50 caracteres' });
    }
    
    if (comment.length > 500) {
      return res.status(400).json({ error: 'El comentario no puede exceder 500 caracteres' });
    }
    
    // Filtro básico de spam (máximo 3 comentarios por IP por hora)
    let story = await StoryInteraction.findOne({ storyId: parseInt(storyId) });
    
    if (!story) {
      story = new StoryInteraction({
        storyId: parseInt(storyId),
        likes: 0,
        comments: [],
        likedIPs: []
      });
    }
    
    // Verificar límite de comentarios por IP
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentComments = story.comments.filter(c => 
      c.ip === clientIP && c.createdAt > oneHourAgo
    );
    
    if (recentComments.length >= 3) {
      return res.status(429).json({ error: 'Límite de comentarios por hora excedido' });
    }
    
    const newComment = {
      userName: userName.trim(),
      comment: comment.trim(),
      createdAt: new Date(),
      ip: clientIP
    };
    
    story.comments.push(newComment);
    await story.save();
    
    // Devolver el comentario sin la IP
    const responseComment = {
      userName: newComment.userName,
      comment: newComment.comment,
      createdAt: newComment.createdAt
    };
    
    res.status(201).json(responseComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Error agregando comentario' });
  }
});

// Obtener estadísticas de una historia
router.get('/:storyId/stats', async (req, res) => {
  try {
    const { storyId } = req.params;
    
    let story = await StoryInteraction.findOne({ storyId: parseInt(storyId) });
    
    if (!story) {
      return res.json({
        likes: 0,
        comments: 0,
        lastActivity: null
      });
    }
    
    res.json({
      likes: story.likes,
      comments: story.comments.length,
      lastActivity: story.updatedAt
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

// Obtener estadísticas generales
router.get('/stats/general', async (req, res) => {
  try {
    const stories = await StoryInteraction.find({});
    
    const totalLikes = stories.reduce((sum, story) => sum + story.likes, 0);
    const totalComments = stories.reduce((sum, story) => sum + story.comments.length, 0);
    const totalStories = stories.length;
    
    res.json({
      totalLikes,
      totalComments,
      totalStories,
      averageLikesPerStory: totalStories > 0 ? (totalLikes / totalStories).toFixed(1) : 0,
      averageCommentsPerStory: totalStories > 0 ? (totalComments / totalStories).toFixed(1) : 0
    });
  } catch (error) {
    console.error('Error getting general stats:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas generales' });
  }
});

module.exports = router;
