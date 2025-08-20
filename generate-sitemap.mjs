// Script para generar sitemap automático basado en el contenido
// Este archivo puede ejecutarse para actualizar el sitemap.xml

import fs from 'fs';
import path from 'path';

// Configuración del sitio
const SITE_URL = 'https://historias-desopilantes.com';
const OUTPUT_FILE = './public/sitemap.xml';

// Páginas estáticas del sitio
const staticPages = [
  {
    url: '/',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: '1.0',
    image: `${SITE_URL}/og-home-image.jpg`,
    title: 'Historias Desopilantes - Página Principal',
    caption: 'Las mejores historias divertidas y anécdotas'
  },
  {
    url: '/historias',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: '0.9',
    image: `${SITE_URL}/og-historias-image.jpg`,
    title: 'Todas las Historias Divertidas',
    caption: 'Explora nuestra colección completa de historias'
  },
  {
    url: '/categorias',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: '0.8',
    image: `${SITE_URL}/og-categorias-image.jpg`,
    title: 'Categorías de Historias',
    caption: 'Descubre historias por categorías'
  },
  {
    url: '/galeria',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: '0.7',
    image: `${SITE_URL}/og-galeria-image.jpg`,
    title: 'Galería de Momentos',
    caption: 'Galería visual de nuestras mejores historias'
  },
  {
    url: '/acerca-de',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.6',
    image: `${SITE_URL}/og-about-image.jpg`,
    title: 'Acerca de Historias Desopilantes',
    caption: 'Conoce nuestro equipo y misión'
  },
  {
    url: '/contacto',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.5',
    image: `${SITE_URL}/og-contact-image.jpg`,
    title: 'Contacto - Historias Desopilantes',
    caption: 'Ponte en contacto con nosotros'
  }
];

// Categorías disponibles
const categories = [
  'divertidas',
  'increibles',
  'absurdas',
  'emotivas',
  'misteriosas',
  'inspiradoras'
];

// Función para generar URLs de categorías
function generateCategoryUrls() {
  return categories.map(category => ({
    url: `/categoria/${category}`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: '0.8',
    image: `${SITE_URL}/og-categoria-${category}-image.jpg`,
    title: `Historias ${category.charAt(0).toUpperCase() + category.slice(1)}`,
    caption: `Explora nuestras historias ${category}`
  }));
}

// Función para leer historias del archivo de datos (si está disponible)
async function getHistoriasFromData() {
  try {
    // En un entorno real, esto leería de la base de datos o API
    const historiasPath = './src/data/historias.js';
    
    if (fs.existsSync(historiasPath)) {
      // Simulamos la lectura de historias individuales
      // En producción, esto vendría de la base de datos
      const sampleHistorias = [
        {
          id: 1,
          titulo: 'La Guerra del Fútbol',
          slug: 'la-guerra-del-futbol',
          fechaPublicacion: '2024-01-15'
        },
        {
          id: 2,
          titulo: 'El Rey que Declaró la Guerra a Neptuno',
          slug: 'el-rey-que-declaro-la-guerra-a-neptuno',
          fechaPublicacion: '2024-01-20'
        }
        // Agregar más historias según sea necesario
      ];
      
      return sampleHistorias.map(historia => ({
        url: `/historia/${historia.slug}`,
        lastmod: historia.fechaPublicacion,
        changefreq: 'monthly',
        priority: '0.7',
        image: `${SITE_URL}/historia-${historia.id}-image.jpg`,
        title: `${historia.titulo} | Historias Desopilantes`,
        caption: historia.titulo
      }));
    }
    
    return [];
  } catch (error) {
    console.warn('No se pudieron cargar las historias individuales:', error.message);
    return [];
  }
}

// Función para generar el XML del sitemap
function generateSitemapXML(urls) {
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;
  
  const xmlFooter = `</urlset>`;
  
  const urlEntries = urls.map(page => {
    return `
    <url>
        <loc>${SITE_URL}${page.url}</loc>
        <lastmod>${page.lastmod}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
        ${page.image ? `<image:image>
            <image:loc>${page.image}</image:loc>
            <image:title>${page.title}</image:title>
            <image:caption>${page.caption}</image:caption>
        </image:image>` : ''}
    </url>`;
  }).join('');
  
  return xmlHeader + urlEntries + '\n' + xmlFooter;
}

// Función principal para generar el sitemap
async function generateSitemap() {
  console.log('🔄 Generando sitemap...');
  
  try {
    // Combinar todas las URLs
    const allUrls = [
      ...staticPages,
      ...generateCategoryUrls(),
      ...(await getHistoriasFromData())
    ];
    
    // Generar el XML
    const sitemapXML = generateSitemapXML(allUrls);
    
    // Escribir el archivo
    fs.writeFileSync(OUTPUT_FILE, sitemapXML, 'utf8');
    
    console.log('✅ Sitemap generado exitosamente!');
    console.log(`📍 Archivo: ${OUTPUT_FILE}`);
    console.log(`📊 Total URLs: ${allUrls.length}`);
    console.log(`📅 Última actualización: ${new Date().toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Error al generar sitemap:', error);
  }
}

// Función para generar automáticamente cada día
function scheduleAutoGeneration() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(2, 0, 0, 0); // 2:00 AM del siguiente día
  
  const msUntilTomorrow = tomorrow.getTime() - now.getTime();
  
  setTimeout(() => {
    generateSitemap();
    // Programar para el siguiente día
    setInterval(generateSitemap, 24 * 60 * 60 * 1000); // Cada 24 horas
  }, msUntilTomorrow);
  
  console.log(`⏰ Sitemap programado para regenerarse automáticamente a las 2:00 AM`);
}

// Exportar funciones para uso en otros scripts
export { generateSitemap, scheduleAutoGeneration, SITE_URL };

// Si se ejecuta directamente, generar el sitemap
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemap();
}

// Instrucciones de uso:
console.log(`
📝 INSTRUCCIONES DE USO:

1. Generar sitemap manualmente:
   node generate-sitemap.mjs

2. Para usar en tu aplicación:
   import { generateSitemap } from './generate-sitemap.mjs';
   generateSitemap();

3. Para programar generación automática:
   import { scheduleAutoGeneration } from './generate-sitemap.mjs';
   scheduleAutoGeneration();

4. Configurar en package.json:
   "scripts": {
     "sitemap": "node generate-sitemap.mjs",
     "build": "vite build && npm run sitemap"
   }
`);
