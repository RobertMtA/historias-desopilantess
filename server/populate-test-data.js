// Usar fetch nativo de Node.js (disponible en Node 18+)
const API_BASE = 'http://localhost:3002/api/stories';

// Datos de prueba para hacer el sitio más realista
const testData = [
  {
    storyId: 1,
    likes: 124,
    comments: [
      { userName: "María García", comment: "¡Increíble! No sabía que alguien podría ser tan obstinado como para declararle la guerra al mar." },
      { userName: "Carlos Ruiz", comment: "Esta historia me recuerda que la arrogancia no tiene límites 😂" },
      { userName: "Ana López", comment: "Me pregunto qué habrán pensado los soldados cuando recibieron esa orden..." }
    ]
  },
  {
    storyId: 2,
    likes: 89,
    comments: [
      { userName: "Pedro Jiménez", comment: "Una guerra por pasteles... ¡solo la historia puede ser tan absurda!" },
      { userName: "Laura Fernández", comment: "Imaginen explicar a las futuras generaciones que hubo una guerra por dulces 🧁" }
    ]
  },
  {
    storyId: 3,
    likes: 156,
    comments: [
      { userName: "Roberto Silva", comment: "38 minutos de caos militar... debió haber sido como una comedia en vivo" },
      { userName: "Sofía Morales", comment: "Los que terminaron en el estanque debieron estar muy confundidos 🤣" },
      { userName: "Diego Torres", comment: "Esto demuestra la importancia de la comunicación clara en las operaciones militares" }
    ]
  },
  {
    storyId: 4,
    likes: 203,
    comments: [
      { userName: "Carmen Vega", comment: "Los conejos australianos son un ejemplo perfecto de las consecuencias no intencionadas" },
      { userName: "Miguel Herrera", comment: "24 conejos se convirtieron en millones... el poder de la reproducción exponencial" },
      { userName: "Elena Campos", comment: "Pobre ecosistema australiano, nunca se recuperó completamente de esta invasión" }
    ]
  },
  {
    storyId: 7,
    likes: 267,
    comments: [
      { userName: "Antonio Ramos", comment: "¿Carne lloviendo del cielo? Esto suena a película de ciencia ficción" },
      { userName: "Isabel Guerrero", comment: "Los buitres regurgitando en vuelo es la explicación más lógica, pero sigue siendo rarísimo" },
      { userName: "Francisco Delgado", comment: "Me pregunto cómo habrá olido el aire después de esa lluvia... 🤢" },
      { userName: "Patricia Castillo", comment: "Kentucky siempre ha sido un lugar especial, pero esto es otro nivel" }
    ]
  },
  {
    storyId: 8,
    likes: 145,
    comments: [
      { userName: "Javier Ortega", comment: "Franz Reichelt murió por su pasión... trágico pero admirable su dedicación" },
      { userName: "Rosa Mendoza", comment: "La Torre Eiffel ha visto muchas cosas, pero esto debió haber sido impactante" },
      { userName: "Alejandro Peña", comment: "Los pioneros de la aviación arriesgaron todo por el progreso de la humanidad" }
    ]
  }
];

async function populateTestData() {
  console.log('🚀 Comenzando a poblar datos de prueba...\n');

  for (const data of testData) {
    try {
      // Agregar likes
      console.log(`📊 Agregando ${data.likes} likes a la historia ${data.storyId}...`);
      for (let i = 0; i < data.likes; i++) {
        await fetch(`${API_BASE}/${data.storyId}/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': `192.168.1.${Math.floor(Math.random() * 254) + 1}`
          },
          body: JSON.stringify({ liked: true })
        });
      }

      // Agregar comentarios
      console.log(`💬 Agregando ${data.comments.length} comentarios a la historia ${data.storyId}...`);
      for (const comment of data.comments) {
        await fetch(`${API_BASE}/${data.storyId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': `192.168.1.${Math.floor(Math.random() * 254) + 1}`
          },
          body: JSON.stringify(comment)
        });
        
        // Esperar un poco entre comentarios para simular tiempo real
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`✅ Historia ${data.storyId} completada\n`);
      
      // Esperar un poco entre historias
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`❌ Error procesando historia ${data.storyId}:`, error.message);
    }
  }

  console.log('🎉 ¡Datos de prueba poblados exitosamente!');
  console.log('\n📈 Resumen:');
  console.log(`- Historias procesadas: ${testData.length}`);
  console.log(`- Total de likes agregados: ${testData.reduce((sum, data) => sum + data.likes, 0)}`);
  console.log(`- Total de comentarios agregados: ${testData.reduce((sum, data) => sum + data.comments.length, 0)}`);
}

// Ejecutar el script
populateTestData().catch(console.error);
