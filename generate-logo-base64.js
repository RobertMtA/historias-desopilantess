const fs = require('fs');

// Crear una versión más pequeña y optimizada para email
const emailSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' width='120' height='120'>
  <defs>
    <linearGradient id='bgGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' style='stop-color:#1e40af;stop-opacity:1' />
      <stop offset='50%' style='stop-color:#6366f1;stop-opacity:1' />
      <stop offset='100%' style='stop-color:#ec4899;stop-opacity:1' />
    </linearGradient>
  </defs>
  <rect width='512' height='512' fill='url(#bgGradient)' rx='80' ry='80'/>
  <g transform='translate(256, 200)'>
    <path d='M-120 -60 Q-120 -80, -100 -80 L100 -80 Q120 -80, 120 -60 L120 40 Q120 60, 100 60 L-20 60 L-60 100 L-40 60 L-100 60 Q-120 60, -120 40 Z' fill='white'/>
    <text x='0' y='10' text-anchor='middle' font-family='Arial Black, sans-serif' font-size='72' font-weight='900' fill='#1e40af'>HD</text>
  </g>
</svg>`;

// Convertir a base64
const base64Logo = Buffer.from(emailSvg).toString('base64');
const dataUrl = 'data:image/svg+xml;base64,' + base64Logo;

console.log('✅ Logo convertido a base64 exitosamente');
console.log('Longitud del base64:', dataUrl.length);

// Guardar en archivo
fs.writeFileSync('logo-email-base64.txt', dataUrl);
console.log('✅ Logo guardado en logo-email-base64.txt');

// También exportar para uso en el módulo
module.exports = dataUrl;
