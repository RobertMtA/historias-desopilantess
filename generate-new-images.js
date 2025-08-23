const fs = require('fs');
const path = require('path');

// Configuración de colores por categoría
const categoryColors = {
  'Política': {
    primary: '#6366f1', // indigo
    secondary: '#a855f7', // purple
    accent: '#ec4899' // pink
  },
  'Inventos': {
    primary: '#f59e0b', // yellow
    secondary: '#f97316', // orange  
    accent: '#ef4444' // red
  },
  'Fenómenos': {
    primary: '#ec4899', // pink
    secondary: '#a855f7', // purple
    accent: '#6366f1' // indigo
  },
  'Exploración': {
    primary: '#3b82f6', // blue
    secondary: '#06b6d4', // cyan
    accent: '#10b981' // teal
  }
};

// Historias nuevas a crear
const newStories = [
  // Política (28-32)
  { id: 28, categoria: 'Política', titulo: 'El alcalde que prohibió la muerte' },
  { id: 29, categoria: 'Política', titulo: 'El país que cambió de hemisferio' },
  { id: 30, categoria: 'Política', titulo: 'El ministro que declaró la guerra a las moscas' },
  { id: 31, categoria: 'Política', titulo: 'El presidente que gobernó por teléfono' },
  { id: 32, categoria: 'Política', titulo: 'El país que legalizó el duelo' },
  
  // Inventos (33-37)
  { id: 33, categoria: 'Inventos', titulo: 'La máquina de pedos de Le Pétomane' },
  { id: 34, categoria: 'Inventos', titulo: 'El hombre que inventó el despertador snooze' },
  { id: 35, categoria: 'Inventos', titulo: 'La bicicleta para dos pisos' },
  { id: 36, categoria: 'Inventos', titulo: 'El paraguas con radio incorporado' },
  { id: 37, categoria: 'Inventos', titulo: 'El inventor del WD-40' },
  
  // Fenómenos (38-42)
  { id: 38, categoria: 'Fenómenos', titulo: 'El pueblo que se mudó por una maldición' },
  { id: 39, categoria: 'Fenómenos', titulo: 'La lluvia de sangre de Kerala' },
  { id: 40, categoria: 'Fenómenos', titulo: 'Los relojes que se detuvieron en Hiroshima' },
  { id: 41, categoria: 'Fenómenos', titulo: 'El bosque que camina en Polonia' },
  { id: 42, categoria: 'Fenómenos', titulo: 'La isla que apareció de la nada' },
  
  // Exploración (43-47)
  { id: 43, categoria: 'Exploración', titulo: 'El explorador que descubrió su propia muerte' },
  { id: 44, categoria: 'Exploración', titulo: 'La expedición que se perdió en su propio país' },
  { id: 45, categoria: 'Exploración', titulo: 'El hombre que caminó al Polo Norte equivocado' },
  { id: 46, categoria: 'Exploración', titulo: 'La isla que no existe en los mapas' },
  { id: 47, categoria: 'Exploración', titulo: 'El explorador que vivió con caníbales' }
];

// Símbolos por categoría
const categorySymbols = {
  'Política': ['🏛️', '⚖️', '🗳️', '📜', '👑'],
  'Inventos': ['💡', '⚙️', '🔧', '🛠️', '🔬'],
  'Fenómenos': ['✨', '🌟', '⚡', '🔮', '🌀'],
  'Exploración': ['🗺️', '🧭', '⛰️', '🏔️', '🌍']
};

// Función para obtener símbolo aleatorio
function getRandomSymbol(categoria) {
  const symbols = categorySymbols[categoria];
  return symbols[Math.floor(Math.random() * symbols.length)];
}

// Función para crear SVG
function createSVG(story) {
  const colors = categoryColors[story.categoria];
  const symbol = getRandomSymbol(story.categoria);
  
  return `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${story.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${colors.secondary};stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.9" />
    </linearGradient>
    <radialGradient id="glow-${story.id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:white;stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:white;stop-opacity:0" />
    </radialGradient>
  </defs>
  
  <!-- Background -->
  <rect width="400" height="300" fill="url(#grad-${story.id})"/>
  
  <!-- Glow effect -->
  <ellipse cx="200" cy="150" rx="180" ry="130" fill="url(#glow-${story.id})"/>
  
  <!-- Central symbol -->
  <text x="200" y="170" font-family="Arial" font-size="80" text-anchor="middle" fill="white" opacity="0.9">
    ${symbol}
  </text>
  
  <!-- Decorative elements -->
  <circle cx="80" cy="80" r="3" fill="white" opacity="0.6"/>
  <circle cx="320" cy="100" r="2" fill="white" opacity="0.7"/>
  <circle cx="350" cy="200" r="2.5" fill="white" opacity="0.5"/>
  <circle cx="50" cy="220" r="2" fill="white" opacity="0.8"/>
  
  <!-- Category indicator -->
  <rect x="10" y="10" width="120" height="25" rx="12" fill="rgba(255,255,255,0.2)"/>
  <text x="70" y="27" font-family="Arial" font-size="12" text-anchor="middle" fill="white" font-weight="bold">
    ${story.categoria}
  </text>
</svg>`;
}

// Crear directorio si no existe
const outputDir = './public/images';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generar todas las imágenes
newStories.forEach(story => {
  const svg = createSVG(story);
  const filename = `historia-${story.id}.svg`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`✅ Creada imagen: ${filename} - ${story.titulo}`);
});

console.log(`\n🎉 ¡Generadas ${newStories.length} imágenes SVG nuevas!`);
console.log('\n📊 Resumen por categoría:');
const categoryCount = {};
newStories.forEach(story => {
  categoryCount[story.categoria] = (categoryCount[story.categoria] || 0) + 1;
});

Object.entries(categoryCount).forEach(([categoria, count]) => {
  const symbols = categorySymbols[categoria];
  console.log(`${symbols[0]} ${categoria}: ${count} historias`);
});
