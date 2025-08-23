const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/historias-desopilantes');

// Definir el schema del comentario
const commentSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  comment: { type: String, required: true },
  storyId: { type: String, required: true },
  storyTitle: { type: String },
  storyCategory: { type: String },
  ip: { type: String },
  userAgent: { type: String },
  approved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);

const comentariosPrueba = [
  {
    userName: "María García",
    comment: "¡Qué historia tan increíble! No puedo creer que alguien haya intentado declararle la guerra al mar. Los seres humanos nunca dejamos de sorprender.",
    storyId: "1",
    storyTitle: "El rey que declaró la guerra al mar",
    storyCategory: "Realeza",
    ip: "192.168.1.100"
  },
  {
    userName: "Carlos Rodríguez", 
    comment: "Esto me recuerda a mi abuelo, que siempre decía que la historia está llena de personajes pintorescos. Este rey definitivamente clasificaría como uno.",
    storyId: "1",
    storyTitle: "El rey que declaró la guerra al mar",
    storyCategory: "Realeza",
    ip: "10.0.0.45"
  },
  {
    userName: "Ana López",
    comment: "La batalla de pasteles suena como algo sacado de un cuento de hadas, pero si realmente pasó, debe haber sido un espectáculo digno de ver.",
    storyId: "2", 
    storyTitle: "La gran batalla de los pasteles",
    storyCategory: "Guerra",
    ip: "172.16.0.23"
  },
  {
    userName: "Pedro Martínez",
    comment: "Me pregunto qué pensarían los soldados cuando recibieron la orden de atacar pasteles en lugar de enemigos reales. Debió ser surrealista.",
    storyId: "2",
    storyTitle: "La gran batalla de los pasteles", 
    storyCategory: "Guerra",
    ip: "203.0.113.12"
  },
  {
    userName: "Laura Fernández",
    comment: "Estas historias demuestran que la realidad supera a la ficción. ¿Quién necesita novelas cuando tienes la historia real?",
    storyId: "3",
    storyTitle: "El desfile de los sombreros gigantes",
    storyCategory: "Moda",
    ip: "198.51.100.87"
  },
  {
    userName: "Roberto Silva",
    comment: "Los sombreros gigantes me hacen pensar en los excesos de la moda. Algunas tendencias realmente no tienen límites.",
    storyId: "3",
    storyTitle: "El desfile de los sombreros gigantes",
    storyCategory: "Moda", 
    ip: "192.0.2.156"
  },
  {
    userName: "Isabella Costa",
    comment: "¡Fascinante! Me encanta cómo estas historias revelan aspectos únicos de diferentes culturas y épocas.",
    storyId: "4",
    storyTitle: "La ciudad que celebraba el silencio",
    storyCategory: "Cultura",
    ip: "224.0.0.1"
  },
  {
    userName: "Diego Morales", 
    comment: "Una ciudad que celebra el silencio... en nuestro mundo tan ruidoso, esto suena como un paraíso.",
    storyId: "4",
    storyTitle: "La ciudad que celebraba el silencio",
    storyCategory: "Cultura",
    ip: "169.254.1.89"
  },
  {
    userName: "Carmen Vega",
    comment: "Estas historias son oro puro para los amantes de lo peculiar. ¡Gracias por compartirlas!",
    storyId: "1",
    storyTitle: "El rey que declaró la guerra al mar",
    storyCategory: "Realeza",
    ip: "127.0.0.1"
  },
  {
    userName: "Alejandro Ruiz",
    comment: "Me pregunto si estos eventos fueron documentados oficialmente o si son parte del folclore popular. De cualquier manera, son entretenidos.",
    storyId: "5",
    storyTitle: "El inventor de las vacaciones obligatorias",
    storyCategory: "Sociedad",
    ip: "192.168.0.50"
  }
];

async function crearComentariosPrueba() {
  try {
    console.log('🔍 Conectando a MongoDB...');
    await mongoose.connection.once('open', () => {
      console.log('✅ Conectado a MongoDB');
    });

    // Limpiar comentarios existentes (opcional)
    console.log('🧹 Limpiando comentarios existentes...');
    await Comment.deleteMany({});

    // Insertar comentarios de prueba
    console.log('📝 Insertando comentarios de prueba...');
    const comentariosInsertados = await Comment.insertMany(comentariosPrueba);
    
    console.log(`✅ ${comentariosInsertados.length} comentarios de prueba insertados exitosamente!`);
    
    // Mostrar estadísticas
    const stats = await Comment.aggregate([
      {
        $group: {
          _id: "$storyId",
          storyTitle: { $first: "$storyTitle" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Estadísticas de comentarios por historia:');
    stats.forEach(stat => {
      console.log(`  - Historia ${stat._id} (${stat.storyTitle}): ${stat.count} comentarios`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

crearComentariosPrueba();
