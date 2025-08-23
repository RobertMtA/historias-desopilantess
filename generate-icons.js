const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Leer el SVG
const svgContent = fs.readFileSync(path.join(__dirname, 'public/apple-touch-icon.svg'));

async function generateIcons() {
  console.log('🎨 Generando iconos PNG...\n');

  const icons = [
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 }
  ];

  for (const icon of icons) {
    try {
      await sharp(svgContent)
        .resize(icon.size, icon.size)
        .png()
        .toFile(path.join(__dirname, 'public', icon.name));
      
      console.log(`✅ Generado: ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`❌ Error generando ${icon.name}:`, error.message);
    }
  }
  
  console.log('\n🎉 ¡Todos los iconos generados exitosamente!');
}

generateIcons();
