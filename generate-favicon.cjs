const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Leer el SVG
const svgContent = fs.readFileSync(path.join(__dirname, 'public/apple-touch-icon.svg'));

async function generateFavicon() {
  console.log('🎨 Generando favicon.ico...\n');

  try {
    await sharp(svgContent)
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, 'public', 'favicon.ico'));
    
    console.log('✅ Generado: favicon.ico (32x32)');
    console.log('🎉 ¡Favicon generado exitosamente!');
  } catch (error) {
    console.error('❌ Error generando favicon.ico:', error.message);
  }
}

generateFavicon();
