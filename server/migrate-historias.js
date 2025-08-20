const mongoose = require('mongoose');
const Historia = require('./models/Historia');
require('dotenv').config();

// Importar las historias existentes del archivo de datos
const historiasData = [
  {
    id: 1,
    titulo: "El rey que declaró la guerra al mar",
    contenido: "En 1967, el excéntrico rey Canuto el Grande intentó detener las mareas del océano como demostración de poder supremo. Colocó su trono en la playa y ordenó a las olas que se detuvieran. Cuando las aguas siguieron avanzando, declaró oficialmente la guerra al mar, enviando soldados a atacar las olas con espadas y lanzas.",
    pais: "España",
    año: 1967,
    categoria: "Realeza",
    imagen: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=250&fit=crop",
    video: null
  },
  {
    id: 2,
    titulo: "La batalla de los pasteles",
    contenido: "Una disputa culinaria entre panaderos franceses que escaló hasta involucrar a los gobiernos de Francia y México. Todo comenzó cuando un pastelero francés en México no recibió el pago por sus dulces. La situación se intensificó hasta convertirse en un conflicto diplomático internacional conocido como 'La Guerra de los Pasteles' en 1838.",
    pais: "Francia",
    año: 1838,
    categoria: "Conflictos",
    imagen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=250&fit=crop",
    video: null
  },
  {
    id: 3,
    titulo: "El desfile militar más corto",
    contenido: "En 1913, el Reino Unido organizó un desfile militar que duró exactamente 38 minutos y terminó en completo caos. Los soldados se confundieron con las órdenes, marcharon en direcciones opuestas y algunos terminaron marchando directamente hacia un estanque. El evento se convirtió en una leyenda de incompetencia militar.",
    pais: "Reino Unido",
    año: 1913,
    categoria: "Militar",
    imagen: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=250&fit=crop",
    video: null
  },
  {
    id: 4,
    titulo: "La invasión de los conejos",
    contenido: "En 1859, Thomas Austin liberó 24 conejos en Australia para la caza. En menos de 50 años, estos se convirtieron en millones y devastaron el ecosistema australiano. Los conejos se reprodujeron tan rápidamente que cubrieron casi todo el continente, convirtiéndose en una de las invasiones de especies más exitosas de la historia.",
    pais: "Australia",
    año: 1859,
    categoria: "Naturaleza",
    imagen: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=250&fit=crop",
    video: null
  },
  {
    id: 5,
    titulo: "El emperador que hizo cónsul a su caballo",
    contenido: "El emperador romano Calígula nombró a su caballo favorito, Incitatus, como cónsul del imperio en el año 37 d.C. El caballo tenía su propia casa de mármol, comederos de marfil y incluso sirvientes. Calígula afirmaba que su caballo era más inteligente que la mayoría de los senadores romanos.",
    pais: "Imperio Romano",
    año: 37,
    categoria: "Política",
    imagen: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=250&fit=crop",
    video: null
  }
];

const migrateHistorias = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    // Verificar si ya existen historias
    const existingCount = await Historia.countDocuments();
    
    if (existingCount > 0) {
      console.log(`❌ Ya existen ${existingCount} historias en la base de datos`);
      console.log('¿Deseas continuar? Esto agregará historias adicionales.');
      
      // En un entorno de producción, podrías querer agregar confirmación aquí
      // Para este script, continuaremos automáticamente
    }

    console.log('🔄 Migrando historias...');
    
    let migratedCount = 0;
    let skippedCount = 0;

    for (const historiaData of historiasData) {
      try {
        // Verificar si ya existe una historia con el mismo título
        const existing = await Historia.findOne({ titulo: historiaData.titulo });
        
        if (existing) {
          console.log(`⏩ Saltando "${historiaData.titulo}" (ya existe)`);
          skippedCount++;
          continue;
        }

        // Preparar datos para MongoDB
        const newHistoria = new Historia({
          titulo: historiaData.titulo,
          contenido: historiaData.contenido,
          pais: historiaData.pais,
          año: historiaData.año,
          categoria: historiaData.categoria,
          imagen: historiaData.imagen,
          video: historiaData.video ? {
            url: historiaData.video,
            titulo: null,
            descripcion: null
          } : { url: null, titulo: null, descripcion: null },
          destacada: [1, 5].includes(historiaData.id), // Marcar algunas como destacadas
          activa: true,
          autor: 'Sistema',
          tags: [historiaData.categoria.toLowerCase(), historiaData.pais.toLowerCase()],
          views: Math.floor(Math.random() * 100) + 10, // Views aleatorias para simular
          likes: Math.floor(Math.random() * 50) + 5 // Likes aleatorias para simular
        });

        await newHistoria.save();
        console.log(`✅ Migrada: "${historiaData.titulo}"`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Error migrando "${historiaData.titulo}":`, error.message);
      }
    }

    console.log('');
    console.log('🎉 ¡Migración completada!');
    console.log(`   Historias migradas: ${migratedCount}`);
    console.log(`   Historias omitidas: ${skippedCount}`);
    console.log(`   Total en BD: ${await Historia.countDocuments()}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  }
};

// Ejecutar migración
migrateHistorias();
