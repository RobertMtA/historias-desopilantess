import fs from 'fs';
import path from 'path';

// Función para crear imagen SVG
function createSVGImage(title, subtitle, gradient, symbols, width = 800, height = 600) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      ${gradient.map((color, index) => 
        `<stop offset="${index * 50}%" style="stop-color:${color};stop-opacity:1" />`
      ).join('\n      ')}
    </linearGradient>
    <filter id="vintage" x="0%" y="0%" width="100%" height="100%">
      <feColorMatrix type="matrix" values="1 0 0 0 0.1  0 0.8 0 0 0.1  0 0 0.6 0 0.1  0 0 0 1 0"/>
    </filter>
  </defs>
  
  <!-- Fondo con gradiente -->
  <rect width="100%" height="100%" fill="url(#grad1)" filter="url(#vintage)"/>
  
  <!-- Textura de pergamino -->
  <rect width="100%" height="100%" fill="none" stroke="#8B4513" stroke-width="4" opacity="0.3"/>
  
  <!-- Símbolos decorativos -->
  ${symbols.map((symbol, index) => {
    const x = (index % 3 + 1) * (width / 4);
    const y = Math.floor(index / 3 + 1) * (height / 4);
    return `<text x="${x}" y="${y}" font-family="serif" font-size="40" fill="#654321" opacity="0.6" text-anchor="middle">${symbol}</text>`;
  }).join('\n  ')}
  
  <!-- Título principal -->
  <rect x="50" y="${height/2 - 80}" width="${width-100}" height="120" fill="rgba(0,0,0,0.7)" rx="10"/>
  <text x="50%" y="${height/2 - 20}" font-family="serif" font-size="42" font-weight="bold" fill="#FFE5B4" text-anchor="middle">${title}</text>
  <text x="50%" y="${height/2 + 25}" font-family="serif" font-size="28" fill="#D2B48C" text-anchor="middle">${subtitle}</text>
  
  <!-- Marco decorativo -->
  <rect x="20" y="20" width="${width-40}" height="${height-40}" fill="none" stroke="#8B4513" stroke-width="3" rx="15"/>
  <rect x="30" y="30" width="${width-60}" height="${height-60}" fill="none" stroke="#CD853F" stroke-width="2" rx="10"/>
</svg>`;
}

// Crear las imágenes que faltan
const images = [
  {
    filename: 'rey-guerra-mar.jpg',
    title: '👑 EL REY vs EL MAR',
    subtitle: 'España 1967 - Una Guerra Absurda',
    gradient: ['#4A3728', '#6D4C36', '#8F6C45'],
    symbols: ['⚔️', '🌊', '👑', '⚡', '🏰', '⛵']
  },
  {
    filename: 'desfile-corto.jpg', 
    title: '🎖️ DESFILE HISTÓRICO',
    subtitle: 'Reino Unido 1913 - El Más Corto',
    gradient: ['#2C3E50', '#34495E', '#5D6D7E'],
    symbols: ['🎺', '🥁', '🎖️', '🚶‍♂️', '🇬🇧', '⏱️']
  }
];

const imagesDir = './public/images/';

images.forEach(img => {
  const svgContent = createSVGImage(img.title, img.subtitle, img.gradient, img.symbols);
  const filePath = path.join(imagesDir, img.filename.replace('.jpg', '.svg'));
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`✅ Creada: ${img.filename} -> ${filePath}`);
});

console.log('🎨 ¡Todas las imágenes placeholder han sido creadas!');
console.log('💡 Nota: Son archivos SVG que se mostrarán como imágenes en el navegador.');
