/**
 * Actualizador de URLs de API - Historias Desopilantes
 * 
 * Este script detecta y corrige automáticamente las URLs de API incorrectas
 * en el frontend para que apunten al servidor correcto en Railway.
 */

const fs = require('fs');
const path = require('path');

// Colores para la consola
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';

console.log(`${CYAN}==================================================${RESET}`);
console.log(`${CYAN}       ACTUALIZADOR DE URLs DE API${RESET}`);
console.log(`${CYAN}==================================================${RESET}\n`);

// URLs
const URL_ANTIGUA = 'historias-desopilantes-production.up.railway.app';
const URL_CORRECTA = 'historias-desopilantes-react-production.up.railway.app';

// Archivos a verificar
const archivosARevisar = [
  { ruta: './src/config/api.js', tipo: 'config' },
  { ruta: './src/api/index.js', tipo: 'config' },
  { ruta: './src/services/api.js', tipo: 'config' },
  { ruta: './vite.config.js', tipo: 'config' },
  { ruta: './src/utils/api.js', tipo: 'config' },
  { ruta: './api-railway/check-status.js', tipo: 'script' },
  { ruta: './api-railway/diagnostico-endpoints.js', tipo: 'script' },
];

let archivosModificados = 0;
let errores = 0;

// Función principal
async function actualizarURLs() {
  console.log(`${BLUE}[1] Buscando archivos con URL antigua...${RESET}\n`);
  
  for (const archivo of archivosARevisar) {
    try {
      // Comprobar si el archivo existe
      if (!fs.existsSync(archivo.ruta)) {
        console.log(`${YELLOW}⚠️ Archivo no encontrado: ${archivo.ruta}${RESET}`);
        continue;
      }
      
      // Leer el contenido
      const contenido = fs.readFileSync(archivo.ruta, 'utf8');
      
      // Verificar si contiene la URL antigua
      if (contenido.includes(URL_ANTIGUA)) {
        console.log(`${GREEN}✓ URL antigua encontrada en: ${archivo.ruta}${RESET}`);
        
        // Reemplazar todas las ocurrencias
        const nuevoContenido = contenido.replace(new RegExp(URL_ANTIGUA, 'g'), URL_CORRECTA);
        
        // Guardar el archivo
        fs.writeFileSync(archivo.ruta, nuevoContenido);
        
        console.log(`   ${GREEN}✓ URLs actualizadas en: ${archivo.ruta}${RESET}`);
        archivosModificados++;
      } else {
        console.log(`${YELLOW}⚠️ No se encontró URL antigua en: ${archivo.ruta}${RESET}`);
      }
    } catch (error) {
      console.log(`${RED}✗ Error al procesar ${archivo.ruta}: ${error.message}${RESET}`);
      errores++;
    }
  }
  
  console.log(`\n${BLUE}[2] Buscando URLs en más archivos...${RESET}\n`);
  
  // Buscar en todos los archivos JS y JSX del proyecto
  const directoriosABuscar = ['./src', './api-railway'];
  
  for (const dir of directoriosABuscar) {
    try {
      await buscarEnDirectorio(dir);
    } catch (error) {
      console.log(`${RED}✗ Error al buscar en ${dir}: ${error.message}${RESET}`);
    }
  }
  
  // Resumen
  console.log(`\n${CYAN}==================================================${RESET}`);
  console.log(`${CYAN}                  RESUMEN${RESET}`);
  console.log(`${CYAN}==================================================${RESET}\n`);
  
  console.log(`Archivos modificados: ${archivosModificados}`);
  console.log(`Errores encontrados: ${errores}`);
  
  if (archivosModificados > 0) {
    console.log(`\n${GREEN}✓ La actualización de URLs se completó exitosamente.${RESET}`);
    console.log(`\n${YELLOW}Recuerda:${RESET}`);
    console.log(`1. Recompilar el frontend con 'npm run build'`);
    console.log(`2. Desplegar en Firebase con 'firebase deploy'`);
    console.log(`3. Limpiar la caché del navegador o probar en modo incógnito`);
  } else if (errores > 0) {
    console.log(`\n${RED}✗ La actualización de URLs completó con errores.${RESET}`);
    console.log(`  Revisa los mensajes de error anteriores.`);
  } else {
    console.log(`\n${YELLOW}⚠️ No se encontraron URLs antiguas que actualizar.${RESET}`);
    console.log(`  Es posible que ya estén actualizadas o no se hayan encontrado.`);
  }
}

// Función para buscar en un directorio y sus subdirectorios
async function buscarEnDirectorio(directorio) {
  try {
    const archivos = fs.readdirSync(directorio);
    
    for (const archivo of archivos) {
      const rutaCompleta = path.join(directorio, archivo);
      const stats = fs.statSync(rutaCompleta);
      
      if (stats.isDirectory()) {
        // Ignorar node_modules y directorios ocultos
        if (archivo !== 'node_modules' && !archivo.startsWith('.')) {
          await buscarEnDirectorio(rutaCompleta);
        }
      } else if (stats.isFile() && 
                (archivo.endsWith('.js') || archivo.endsWith('.jsx') || 
                 archivo.endsWith('.ts') || archivo.endsWith('.tsx'))) {
        
        // Archivos que ya revisamos anteriormente
        if (archivosARevisar.some(a => rutaCompleta.endsWith(a.ruta.substring(2)))) {
          continue;
        }
        
        // Leer el contenido
        const contenido = fs.readFileSync(rutaCompleta, 'utf8');
        
        // Verificar si contiene la URL antigua
        if (contenido.includes(URL_ANTIGUA)) {
          console.log(`${GREEN}✓ URL antigua encontrada en: ${rutaCompleta}${RESET}`);
          
          // Reemplazar todas las ocurrencias
          const nuevoContenido = contenido.replace(new RegExp(URL_ANTIGUA, 'g'), URL_CORRECTA);
          
          // Guardar el archivo
          fs.writeFileSync(rutaCompleta, nuevoContenido);
          
          console.log(`   ${GREEN}✓ URLs actualizadas en: ${rutaCompleta}${RESET}`);
          archivosModificados++;
        }
      }
    }
  } catch (error) {
    console.log(`${RED}✗ Error al procesar directorio ${directorio}: ${error.message}${RESET}`);
    errores++;
  }
}

// Ejecutar la función principal
actualizarURLs().catch(error => {
  console.error(`${RED}Error crítico: ${error.message}${RESET}`);
  process.exit(1);
});
