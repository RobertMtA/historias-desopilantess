const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock data para comentarios
const mockComments = [
  {
    _id: '68a5dc9bff5d494e83615ac1',
    userName: 'Roberto',
    comment: 'hola este es un comentario de prueba',
    storyId: '1',
    storyTitle: 'Historia de prueba',
    storyCategory: 'humor',
    createdAt: new Date(),
    approved: true
  },
  {
    _id: '68a5dc9bff5d494e83615ac2',
    userName: 'María',
    comment: 'Me gustó mucho esta historia',
    storyId: '2',
    storyTitle: 'Otra historia',
    storyCategory: 'aventura',
    createdAt: new Date(Date.now() - 86400000),
    approved: true
  }
];

// Middleware de autenticación mock
const authenticateAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  // Mock - acepta cualquier token
  req.admin = { id: 'admin123' };
  next();
};

// Rutas de comentarios
app.get('/api/admin/comments', authenticateAdmin, (req, res) => {
  console.log('📥 GET /api/admin/comments');
  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  res.json({
    comments: mockComments,
    pagination: {
      current: page,
      pages: 1,
      total: mockComments.length,
      limit,
      hasNext: false,
      hasPrev: false
    }
  });
});

app.delete('/api/admin/comments/:commentId', authenticateAdmin, (req, res) => {
  console.log('🗑️ DELETE /api/admin/comments/' + req.params.commentId);
  console.log('Body:', req.body);
  
  const { commentId } = req.params;
  const { storyId } = req.body;
  
  if (!storyId) {
    return res.status(400).json({ error: 'storyId es requerido' });
  }
  
  // Mock - eliminar del array
  const index = mockComments.findIndex(c => c._id === commentId);
  if (index === -1) {
    return res.status(404).json({ error: 'Comentario no encontrado' });
  }
  
  const deletedComment = mockComments.splice(index, 1)[0];
  
  res.json({
    message: 'Comentario eliminado exitosamente',
    comment: deletedComment
  });
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor de prueba funcionando' });
});

// Manejo de errores
app.use((req, res) => {
  console.log('❌ Ruta no encontrada:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = 3009;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de prueba ejecutándose en http://localhost:${PORT}`);
});
