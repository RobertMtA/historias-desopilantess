const mongoose = require('mongoose');
require('dotenv').config();

// Modelo de Comentario
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

async function createTestComments() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conectado a MongoDB Atlas');

    // Eliminar comentarios existentes de prueba
    await Comment.deleteMany({ userName: { $in: ['Roberto Test', 'María Test', 'Juan Test'] } });
    
    // Crear comentarios de prueba
    const testComments = [
      {
        userName: 'Roberto Test',
        comment: 'Este es un comentario de prueba que funciona correctamente con la base de datos real.',
        storyId: '1',
        storyTitle: 'El Día Que Mi Gato Se Convirtió En Detective',
        storyCategory: 'humor',
        ip: '192.168.1.100',
        userAgent: 'Test Browser',
        createdAt: new Date(),
        approved: true
      },
      {
        userName: 'María Test',
        comment: 'Me gustó mucho esta historia, es muy divertida. ¡Esperando más aventuras del gato detective!',
        storyId: '1',
        storyTitle: 'El Día Que Mi Gato Se Convirtió En Detective',
        storyCategory: 'humor',
        ip: '192.168.1.101',
        userAgent: 'Test Browser',
        createdAt: new Date(Date.now() - 86400000), // 1 día atrás
        approved: true
      },
      {
        userName: 'Juan Test',
        comment: 'Excelente historia, me hizo reír mucho. Los diálogos del gato son geniales.',
        storyId: '1',
        storyTitle: 'El Día Que Mi Gato Se Convirtió En Detective',
        storyCategory: 'humor',
        ip: '192.168.1.102',
        userAgent: 'Test Browser',
        createdAt: new Date(Date.now() - 172800000), // 2 días atrás
        approved: true
      },
      {
        userName: 'Ana Test',
        comment: 'Esta historia de aventuras es increíble. Me mantuvo en vilo todo el tiempo.',
        storyId: '2',
        storyTitle: 'La Gran Aventura del Pastel Perdido',
        storyCategory: 'aventura',
        ip: '192.168.1.103',
        userAgent: 'Test Browser',
        createdAt: new Date(Date.now() - 259200000), // 3 días atrás
        approved: true
      },
      {
        userName: 'Carlos Test',
        comment: 'No puedo parar de reírme con estas historias. ¡Son fantásticas!',
        storyId: '3',
        storyTitle: 'El Día Que la Lavadora Se Rebeló',
        storyCategory: 'humor',
        ip: '192.168.1.104',
        userAgent: 'Test Browser',
        createdAt: new Date(Date.now() - 345600000), // 4 días atrás
        approved: true
      }
    ];

    // Insertar comentarios
    const insertedComments = await Comment.insertMany(testComments);
    console.log(`✅ ${insertedComments.length} comentarios de prueba creados exitosamente`);

    // Mostrar estadísticas
    const totalComments = await Comment.countDocuments();
    console.log(`📊 Total de comentarios en la base de datos: ${totalComments}`);

    const commentsByStory = await Comment.aggregate([
      { $group: { _id: '$storyId', count: { $sum: 1 }, storyTitle: { $first: '$storyTitle' } } },
      { $sort: { count: -1 } }
    ]);

    console.log('📈 Comentarios por historia:');
    commentsByStory.forEach(story => {
      console.log(`   Historia ${story._id} (${story.storyTitle}): ${story.count} comentarios`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

createTestComments();
