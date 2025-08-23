const express = require('express');
const router = express.Router();

// Ruta para obtener likes de una historia específica
router.get('/:id/likes', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Por ahora devolvemos un valor por defecto
    // En el futuro podrías conectar esto a una base de datos
    res.json({
      storyId: parseInt(id),
      likes: Math.floor(Math.random() * 100), // Likes aleatorios por ahora
      hasLiked: false
    });
  } catch (error) {
    console.error('Error getting story likes:', error);
    res.status(500).json({ error: 'Error al obtener likes de la historia' });
  }
});

// Ruta para dar like a una historia
router.post('/:id/likes', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Por ahora devolvemos una respuesta exitosa
    res.json({
      storyId: parseInt(id),
      likes: Math.floor(Math.random() * 100) + 1,
      hasLiked: true,
      message: 'Like agregado exitosamente'
    });
  } catch (error) {
    console.error('Error adding story like:', error);
    res.status(500).json({ error: 'Error al agregar like a la historia' });
  }
});

module.exports = router;
