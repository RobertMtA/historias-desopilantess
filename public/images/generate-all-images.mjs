import fs from 'fs';
import path from 'path';

// Configuración de temas por categoría
const temas = {
  'Realeza': {
    gradiente: ['#4A148C', '#7B1FA2', '#AB47BC'],
    simbolos: ['👑', '⚔️', '🏰', '💎', '🛡️', '👸'],
    colores: { fondo: '#4A148C', texto: '#FFE5B4' }
  },
  'Conflictos': {
    gradiente: ['#8B0000', '#CD5C5C', '#FF6B6B'],
    simbolos: ['⚔️', '💥', '🔥', '⚡', '🛡️', '💀'],
    colores: { fondo: '#8B0000', texto: '#FFE5B4' }
  },
  'Militar': {
    gradiente: ['#2E4057', '#546E7A', '#78909C'],
    simbolos: ['🎖️', '🎺', '🥁', '🚁', '⭐', '🎗️'],
    colores: { fondo: '#2E4057', texto: '#E0E0E0' }
  },
  'Naturaleza': {
    gradiente: ['#1B5E20', '#4CAF50', '#81C784'],
    simbolos: ['🌿', '🐰', '🌳', '🦋', '🌺', '🍃'],
    colores: { fondo: '#1B5E20', texto: '#E8F5E8' }
  },
  'Política': {
    gradiente: ['#1A237E', '#3F51B5', '#7986CB'],
    simbolos: ['🏛️', '⚖️', '📜', '🗳️', '👥', '🎭'],
    colores: { fondo: '#1A237E', texto: '#E3F2FD' }
  },
  'Inventos': {
    gradiente: ['#E65100', '#FF9800', '#FFB74D'],
    simbolos: ['💡', '⚙️', '🔬', '📡', '🚀', '🔧'],
    colores: { fondo: '#E65100', texto: '#FFF3E0' }
  },
  'Fenómenos': {
    gradiente: ['#4A148C', '#7B1FA2', '#BA68C8'],
    simbolos: ['✨', '🌟', '🔮', '❄️', '⚡', '🌙'],
    colores: { fondo: '#4A148C', texto: '#F3E5F5' }
  },
  'Creepypasta': {
    gradiente: ['#000000', '#424242', '#616161'],
    simbolos: ['💀', '👻', '🕯️', '🦇', '🕷️', '⚰️'],
    colores: { fondo: '#000000', texto: '#FF6B6B' }
  },
  'Fenómenos Siniestros': {
    gradiente: ['#1A0000', '#4A0000', '#8B0000'],
    simbolos: ['👻', '💀', '🔥', '⚡', '🌙', '🕯️'],
    colores: { fondo: '#1A0000', texto: '#FFB3B3' }
  },
  'Finales Oscuros': {
    gradiente: ['#263238', '#37474F', '#546E7A'],
    simbolos: ['🎭', '💔', '⚰️', '🥀', '💀', '🖤'],
    colores: { fondo: '#263238', texto: '#CFD8DC' }
  },
  'Enfrenta tus Miedos': {
    gradiente: ['#000000', '#1C1C1C', '#8B0000'],
    simbolos: ['💀', '🩸', '⚰️', '👁️', '🔥', '💔'],
    colores: { fondo: '#000000', texto: '#FF4444' }
  }
};

// Función para crear SVG temático
function createThemedSVG(titulo, categoria, año, pais, width = 800, height = 600) {
  const tema = temas[categoria] || temas['Fenómenos'];
  const simbolosAleatorios = tema.simbolos.sort(() => 0.5 - Math.random()).slice(0, 6);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      ${tema.gradiente.map((color, index) => 
        `<stop offset="${index * 50}%" style="stop-color:${color};stop-opacity:1" />`
      ).join('\n      ')}
    </linearGradient>
    <filter id="vintage" x="0%" y="0%" width="100%" height="100%">
      <feColorMatrix type="matrix" values="1 0 0 0 0.1  0 0.8 0 0 0.1  0 0 0.6 0 0.1  0 0 0 1 0"/>
      <feGaussianBlur stdDeviation="0.5"/>
    </filter>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Fondo con gradiente -->
  <rect width="100%" height="100%" fill="url(#grad1)" filter="url(#vintage)"/>
  
  <!-- Textura de pergamino -->
  <rect width="100%" height="100%" fill="none" stroke="${tema.colores.fondo}" stroke-width="6" opacity="0.4"/>
  
  <!-- Símbolos decorativos -->
  ${simbolosAleatorios.map((simbolo, index) => {
    const x = (index % 3 + 1) * (width / 4);
    const y = Math.floor(index / 3 + 1) * (height / 4);
    return `<text x="${x}" y="${y}" font-family="serif" font-size="50" fill="${tema.colores.fondo}" opacity="0.3" text-anchor="middle">${simbolo}</text>`;
  }).join('\n  ')}
  
  <!-- Fondo del título -->
  <rect x="40" y="${height/2 - 100}" width="${width-80}" height="160" fill="rgba(0,0,0,0.8)" rx="15" stroke="${tema.colores.texto}" stroke-width="2"/>
  
  <!-- Título principal -->
  <text x="50%" y="${height/2 - 40}" font-family="serif" font-size="32" font-weight="bold" fill="${tema.colores.texto}" text-anchor="middle" filter="url(#glow)">${titulo.length > 40 ? titulo.substring(0, 37) + '...' : titulo}</text>
  
  <!-- Subtítulo -->
  <text x="50%" y="${height/2 + 10}" font-family="serif" font-size="24" fill="${tema.colores.texto}" text-anchor="middle" opacity="0.9">${pais} - ${año}</text>
  
  <!-- Categoría -->
  <text x="50%" y="${height/2 + 40}" font-family="serif" font-size="18" fill="${tema.colores.texto}" text-anchor="middle" opacity="0.7">${categoria.toUpperCase()}</text>
  
  <!-- Marco decorativo -->
  <rect x="20" y="20" width="${width-40}" height="${height-40}" fill="none" stroke="${tema.colores.texto}" stroke-width="3" rx="20" opacity="0.6"/>
  <rect x="30" y="30" width="${width-60}" height="${height-60}" fill="none" stroke="${tema.colores.texto}" stroke-width="1" rx="15" opacity="0.4"/>
  
  <!-- Símbolo principal de categoría -->
  <text x="50%" y="100" font-family="serif" font-size="60" fill="${tema.colores.texto}" text-anchor="middle" opacity="0.8" filter="url(#glow)">${tema.simbolos[0]}</text>
</svg>`;
}

// Lista de historias para generar imágenes
const historias = [
  { id: 1, titulo: "El rey que declaró la guerra al mar", categoria: "Realeza", año: 1967, pais: "España" },
  { id: 2, titulo: "La batalla de los pasteles", categoria: "Conflictos", año: 1838, pais: "Francia" },
  { id: 3, titulo: "El desfile militar más corto", categoria: "Militar", año: 1913, pais: "Reino Unido" },
  { id: 4, titulo: "La invasión de los conejos", categoria: "Naturaleza", año: 1859, pais: "Australia" },
  { id: 5, titulo: "El emperador que hizo cónsul a su caballo", categoria: "Política", año: 37, pais: "Imperio Romano" },
  { id: 6, titulo: "La guerra por una oreja", categoria: "Conflictos", año: 1739, pais: "España" },
  { id: 7, titulo: "El día que llovió carne", categoria: "Fenómenos", año: 1876, pais: "Estados Unidos" },
  { id: 8, titulo: "El inventor que murió por su invento", categoria: "Inventos", año: 1912, pais: "Francia" },
  { id: 11, titulo: "La estación de radio fantasma", categoria: "Creepypasta", año: 1973, pais: "Rusia" },
  { id: 12, titulo: "El bosque de los suicidios", categoria: "Creepypasta", año: 1960, pais: "Japón" },
  { id: 13, titulo: "Los niños de ojos negros", categoria: "Creepypasta", año: 1996, pais: "Estados Unidos" },
  { id: 14, titulo: "La epidemia de baile de 1518", categoria: "Fenómenos Siniestros", año: 1518, pais: "Francia" },
  { id: 15, titulo: "El incidente de Dyatlov Pass", categoria: "Fenómenos Siniestros", año: 1959, pais: "Rusia" },
  { id: 16, titulo: "La lluvia roja de Kerala", categoria: "Fenómenos Siniestros", año: 2001, pais: "India" },
  { id: 17, titulo: "El vuelo 401 y los aparecidos", categoria: "Fenómenos Siniestros", año: 1972, pais: "Estados Unidos" },
  { id: 18, titulo: "Blancanieves: La verdad detrás del cuento", categoria: "Finales Oscuros", año: 1554, pais: "Alemania" },
  { id: 19, titulo: "La verdadera Pocahontas", categoria: "Finales Oscuros", año: 1617, pais: "Estados Unidos" },
  { id: 20, titulo: "Los niños salvados del Titanic", categoria: "Finales Oscuros", año: 1912, pais: "Reino Unido" },
  { id: 21, titulo: "El rescate de los mineros chilenos", categoria: "Finales Oscuros", año: 2010, pais: "Chile" },
  { id: 22, titulo: "Los niños de la Operación Pedro Pan", categoria: "Finales Oscuros", año: 1960, pais: "Cuba" },
  { id: 23, titulo: "Los experimentos de Unit 731", categoria: "Enfrenta tus Miedos", año: 1940, pais: "China" },
  { id: 24, titulo: "El Holodomor: el hambre como arma", categoria: "Enfrenta tus Miedos", año: 1932, pais: "Ucrania" },
  { id: 25, titulo: "Los hornos de Tophet", categoria: "Enfrenta tus Miedos", año: -600, pais: "Túnez" },
  { id: 26, titulo: "La Escuela Industrial de Marieval", categoria: "Enfrenta tus Miedos", año: 1899, pais: "Canadá" },
  { id: 27, titulo: "Los cuerpos que no podían enterrar", categoria: "Enfrenta tus Miedos", año: 1348, pais: "Reino Unido" }
];

// Crear carpeta de imágenes si no existe
const imagesDir = './public/images/';
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

console.log('🎨 Generando imágenes temáticas para todas las historias...\n');

// Generar imagen para cada historia
historias.forEach((historia, index) => {
  const svgContent = createThemedSVG(historia.titulo, historia.categoria, historia.año, historia.pais);
  const filename = `historia-${historia.id}.svg`;
  const filePath = path.join(imagesDir, filename);
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`✅ ${index + 1}/25: ${filename} - ${historia.categoria}`);
});

console.log('\n🎉 ¡TODAS LAS IMÁGENES GENERADAS!');
console.log('📁 Ubicación: public/images/');
console.log('🎭 Cada imagen tiene colores y símbolos temáticos según su categoría');
console.log('⚡ Listas para usar en tu sitio de Historias Desopilantes');
