/**
 * Script para añadir endpoints de comentarios al servidor de Railway
 * 
 * Este script crea los endpoints de comentarios en el servidor Express
 * y puede ser incorporado directamente en el archivo server.js
 */

// Importar módulos necesarios
const express = require('express');
const router = express.Router();

// Simular una base de datos de comentarios en memoria
const commentsDb = {
  // Comentarios organizados por ID de historia
  1: [
    { id: 1, storyId: 1, author: "Laura García", email: "laura@example.com", content: "¡Historia fascinante! Me encantó el giro final.", date: "2023-08-20T14:30:00Z", likes: 5 },
    { id: 2, storyId: 1, author: "Carlos Rodríguez", email: "carlos@example.com", content: "No podía parar de reír con esta historia. Muy bien narrada.", date: "2023-08-21T09:15:00Z", likes: 3 }
  ],
  2: [
    { id: 3, storyId: 2, author: "Ana Martínez", email: "ana@example.com", content: "Demasiado predecible el final, pero aún así entretenida.", date: "2023-08-19T18:45:00Z", likes: 1 }
  ],
  3: [
    { id: 4, storyId: 3, author: "Pedro Sánchez", email: "pedro@example.com", content: "¡Qué historia tan emocionante! La recomendaré a todos mis amigos.", date: "2023-08-22T11:20:00Z", likes: 8 },
    { id: 5, storyId: 3, author: "María López", email: "maria@example.com", content: "Me recordó a una anécdota similar que me ocurrió. ¡Genial narración!", date: "2023-08-23T16:10:00Z", likes: 4 }
  ]
};

// Contador para generar IDs únicos
let nextCommentId = 6;

// Añadir automáticamente algunos comentarios para historias que no los tienen
for (let i = 4; i <= 51; i++) {
  if (!commentsDb[i]) {
    commentsDb[i] = [];
    
    // Añadir 1-3 comentarios por historia
    const numComments = Math.floor(Math.random() * 3) + 1;
    
    const authors = [
      "Alejandro Torres", "Lucía Fernández", "Javier Ruiz", "Sofía Vega", 
      "Miguel Hernández", "Elena Gómez", "David Muñoz", "Carmen Díaz"
    ];
    
    const contents = [
      "Muy entretenida esta historia. Me hizo reír mucho.",
      "Creo que el protagonista podría haber tomado mejores decisiones.",
      "¡Vaya giro inesperado al final! No lo vi venir.",
      "Esta historia me recordó a mi infancia. Muy nostálgica.",
      "El autor tiene un estilo muy fresco y dinámico. Quiero leer más.",
      "Me encantó la descripción de los escenarios. Muy vívidos.",
      "Historia perfecta para leer un domingo por la tarde.",
      "El desarrollo de los personajes es excelente. Se sienten muy reales."
    ];
    
    for (let j = 0; j < numComments; j++) {
      const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
      const randomContent = contents[Math.floor(Math.random() * contents.length)];
      const randomLikes = Math.floor(Math.random() * 10);
      const randomDaysAgo = Math.floor(Math.random() * 30);
      
      const date = new Date();
      date.setDate(date.getDate() - randomDaysAgo);
      
      commentsDb[i].push({
        id: nextCommentId++,
        storyId: i,
        author: randomAuthor,
        email: randomAuthor.toLowerCase().replace(' ', '.') + "@example.com",
        content: randomContent,
        date: date.toISOString(),
        likes: randomLikes
      });
    }
  }
}

// ENDPOINT: Obtener todos los comentarios de una historia
router.get('/stories/:storyId/comments', (req, res) => {
  const storyId = parseInt(req.params.storyId);
  console.log(`📝 Obteniendo comentarios para historia ${storyId}`);
  
  // Verificar si la historia existe
  const comments = commentsDb[storyId] || [];
  
  // Ordenar comentarios por fecha (más reciente primero)
  const sortedComments = [...comments].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  res.json(sortedComments);
});

// ENDPOINT: Añadir un comentario a una historia
router.post('/stories/:storyId/comments', (req, res) => {
  const storyId = parseInt(req.params.storyId);
  const { author, email, content } = req.body;
  
  console.log(`📝 Añadiendo comentario a historia ${storyId}`);
  
  // Validar datos requeridos
  if (!author || !email || !content) {
    return res.status(400).json({ 
      error: "Faltan datos requeridos (author, email, content)" 
    });
  }
  
  // Inicializar el array de comentarios si no existe
  if (!commentsDb[storyId]) {
    commentsDb[storyId] = [];
  }
  
  // Crear nuevo comentario
  const newComment = {
    id: nextCommentId++,
    storyId,
    author,
    email,
    content,
    date: new Date().toISOString(),
    likes: 0
  };
  
  // Añadir a la base de datos
  commentsDb[storyId].push(newComment);
  
  res.status(201).json(newComment);
});

// ENDPOINT: Obtener un comentario específico
router.get('/stories/:storyId/comments/:commentId', (req, res) => {
  const storyId = parseInt(req.params.storyId);
  const commentId = parseInt(req.params.commentId);
  
  console.log(`📝 Obteniendo comentario ${commentId} de historia ${storyId}`);
  
  // Verificar si la historia existe
  if (!commentsDb[storyId]) {
    return res.status(404).json({ error: "Historia no encontrada" });
  }
  
  // Buscar el comentario
  const comment = commentsDb[storyId].find(c => c.id === commentId);
  
  if (!comment) {
    return res.status(404).json({ error: "Comentario no encontrado" });
  }
  
  res.json(comment);
});

// ENDPOINT: Dar like a un comentario
router.post('/stories/:storyId/comments/:commentId/like', (req, res) => {
  const storyId = parseInt(req.params.storyId);
  const commentId = parseInt(req.params.commentId);
  
  console.log(`❤️ Dando like al comentario ${commentId} de historia ${storyId}`);
  
  // Verificar si la historia existe
  if (!commentsDb[storyId]) {
    return res.status(404).json({ error: "Historia no encontrada" });
  }
  
  // Buscar el comentario
  const commentIndex = commentsDb[storyId].findIndex(c => c.id === commentId);
  
  if (commentIndex === -1) {
    return res.status(404).json({ error: "Comentario no encontrado" });
  }
  
  // Incrementar likes
  commentsDb[storyId][commentIndex].likes += 1;
  
  res.json(commentsDb[storyId][commentIndex]);
});

// Exportar el router para usarlo en server.js
module.exports = function(app) {
  // Registrar rutas
  app.use('/api', router);
  
  // Registrar el middleware para manejar rutas no encontradas
  app.use((req, res, next) => {
    if (req.path.includes('/comments')) {
      // Usar las rutas de este módulo para las peticiones de comentarios
      if (req.method === 'GET' && /\/api\/stories\/\d+\/comments\/?$/.test(req.path)) {
        return router.handle(req, res, next);
      }
    }
    // Si no es una ruta de comentarios, continuar al siguiente middleware
    next();
  });
  
  console.log("📝 Endpoints de comentarios registrados:");
  console.log("   GET  /api/stories/:id/comments");
  console.log("   POST /api/stories/:id/comments");
  console.log("   GET  /api/stories/:id/comments/:commentId");
  console.log("   POST /api/stories/:id/comments/:commentId/like");
};

// Si este archivo se ejecuta directamente, mostrar instrucciones
if (require.main === module) {
  console.log("\n=========================================");
  console.log("INSTRUCCIONES PARA AÑADIR ENDPOINTS DE COMENTARIOS");
  console.log("=========================================\n");
  console.log("1. Copiar este código en un archivo comments-routes.js en la carpeta api-railway");
  console.log("2. Modificar server.js para importar y usar este módulo:");
  console.log("\n   // Añadir al inicio del archivo");
  console.log("   const commentsRoutes = require('./comments-routes');");
  console.log("\n   // Añadir después de definir la app Express");
  console.log("   commentsRoutes(app);");
  console.log("\n3. Redespliega el servidor con 'railway up'");
  console.log("\nEsto añadirá soporte completo para comentarios en la API.");
}
