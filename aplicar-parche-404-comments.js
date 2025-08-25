/**
 * SOLUCIÓN DE EMERGENCIA PARA ERRORES 404 EN COMENTARIOS
 * 
 * Este script crea un archivo HTML que permite a los usuarios solucionar
 * los errores 404 en las peticiones de comentarios aplicando un parche
 * temporal en el navegador.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Colores para la consola
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';

console.log(`${CYAN}==================================================${RESET}`);
console.log(`${CYAN}     SOLUCIÓN DE EMERGENCIA PARA ERRORES 404${RESET}`);
console.log(`${CYAN}==================================================${RESET}\n`);

// Verificar si existe el HTML de solución
const solutionHtmlPath = path.join(__dirname, 'solucionar-404-comments.html');

if (fs.existsSync(solutionHtmlPath)) {
  console.log(`${GREEN}✓ El archivo de solución ya existe: ${solutionHtmlPath}${RESET}`);
} else {
  console.log(`${RED}✗ El archivo de solución no existe. Debes crearlo primero.${RESET}`);
  process.exit(1);
}

// Crear un script JS para agregar a la aplicación
const fixScriptContent = `
/**
 * PARCHE AUTOMÁTICO PARA REDIRIGIR PETICIONES A LA API
 * No eliminar hasta que se resuelva el problema de URLs
 */
(function() {
  const oldUrl = 'historias-desopilantes-production.up.railway.app';
  const newUrl = 'historias-desopilantes-react-production.up.railway.app';
  
  console.log('🔄 Instalando redirección automática para peticiones API...');
  
  // Guardar la función fetch original
  const originalFetch = window.fetch;
  
  // Reemplazar con nuestra función que redirige URLs
  window.fetch = function(resource, options) {
    if (typeof resource === 'string' && resource.includes(oldUrl)) {
      console.log('🔀 Redirigiendo:', resource);
      resource = resource.replace(oldUrl, newUrl);
    }
    return originalFetch.call(this, resource, options);
  };
  
  // También parchear XMLHttpRequest para redirigir
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (typeof url === 'string' && url.includes(oldUrl)) {
      console.log('🔀 Redirigiendo XHR:', url);
      url = url.replace(oldUrl, newUrl);
    }
    return originalOpen.call(this, method, url, ...args);
  };
  
  console.log('✅ Parche de redirección instalado correctamente');
})();`;

// Ruta del script de parche
const fixScriptPath = path.join(__dirname, 'src', 'fix-api-url.js');

// Guardar el script
try {
  const srcDir = path.join(__dirname, 'src');
  if (!fs.existsSync(srcDir)) {
    console.log(`${RED}✗ No se encontró el directorio src. Asegúrate de ejecutar este script en la raíz del proyecto.${RESET}`);
    process.exit(1);
  }
  
  fs.writeFileSync(fixScriptPath, fixScriptContent);
  console.log(`${GREEN}✓ Script de parche creado en: ${fixScriptPath}${RESET}`);
} catch (error) {
  console.log(`${RED}✗ Error al crear script de parche: ${error.message}${RESET}`);
}

// Buscar el archivo index.html principal
const indexPath = path.join(__dirname, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.log(`${YELLOW}⚠️ No se encontró index.html en la raíz. Debes incorporar el script manualmente.${RESET}`);
} else {
  // Leer index.html
  try {
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Verificar si ya tiene el script
    if (indexContent.includes('fix-api-url.js')) {
      console.log(`${GREEN}✓ El script de parche ya está incluido en index.html${RESET}`);
    } else {
      // Insertar script antes del cierre del head
      const headClosePos = indexContent.indexOf('</head>');
      if (headClosePos !== -1) {
        indexContent = indexContent.slice(0, headClosePos) + 
                      '\n  <script src="%PUBLIC_URL%/fix-api-url.js"></script>\n  ' + 
                      indexContent.slice(headClosePos);
        
        // Guardar el archivo modificado
        fs.writeFileSync(indexPath, indexContent);
        console.log(`${GREEN}✓ Script de parche añadido a index.html${RESET}`);
      } else {
        console.log(`${RED}✗ No se pudo encontrar </head> en index.html${RESET}`);
      }
    }
  } catch (error) {
    console.log(`${RED}✗ Error al modificar index.html: ${error.message}${RESET}`);
  }
}

// Copiar el script al directorio public
const publicDir = path.join(__dirname, 'public');
const publicScriptPath = path.join(publicDir, 'fix-api-url.js');

try {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.copyFileSync(fixScriptPath, publicScriptPath);
  console.log(`${GREEN}✓ Script copiado a public/fix-api-url.js${RESET}`);
} catch (error) {
  console.log(`${RED}✗ Error al copiar script a public/: ${error.message}${RESET}`);
}

// Buscar el archivo de configuración de la API
const apiConfigPath = path.join(__dirname, 'src', 'config', 'api.js');

try {
  if (fs.existsSync(apiConfigPath)) {
    let apiConfigContent = fs.readFileSync(apiConfigPath, 'utf8');
    
    // Verificar si contiene la URL antigua
    const oldUrl = 'historias-desopilantes-production.up.railway.app';
    const newUrl = 'historias-desopilantes-react-production.up.railway.app';
    
    if (apiConfigContent.includes(oldUrl)) {
      // Reemplazar URL antigua
      apiConfigContent = apiConfigContent.replace(new RegExp(oldUrl, 'g'), newUrl);
      
      // Guardar el archivo modificado
      fs.writeFileSync(apiConfigPath, apiConfigContent);
      console.log(`${GREEN}✓ URL actualizada en el archivo de configuración de la API${RESET}`);
    } else {
      console.log(`${GREEN}✓ La configuración de la API ya tiene la URL correcta${RESET}`);
    }
  } else {
    console.log(`${YELLOW}⚠️ No se encontró el archivo de configuración de la API${RESET}`);
  }
} catch (error) {
  console.log(`${RED}✗ Error al actualizar la configuración de la API: ${error.message}${RESET}`);
}

// Abrir el HTML de solución en el navegador
try {
  const solutionUrl = `file://${path.resolve(solutionHtmlPath)}`;
  
  console.log(`\n${BLUE}Abriendo solución en el navegador...${RESET}`);
  
  // Detectar sistema operativo
  if (process.platform === 'win32') {
    exec(`start ${solutionUrl}`);
  } else if (process.platform === 'darwin') {
    exec(`open "${solutionUrl}"`);
  } else {
    exec(`xdg-open "${solutionUrl}"`);
  }
  
  console.log(`${GREEN}✓ Archivo de solución abierto en el navegador${RESET}`);
} catch (error) {
  console.log(`${YELLOW}⚠️ No se pudo abrir automáticamente. Abre este archivo manualmente:${RESET}`);
  console.log(`   ${solutionHtmlPath}`);
}

console.log(`\n${CYAN}==================================================${RESET}`);
console.log(`${CYAN}                 PRÓXIMOS PASOS${RESET}`);
console.log(`${CYAN}==================================================${RESET}`);

console.log(`\n1. ${YELLOW}Aplica el parche de redirección${RESET} desde el HTML que se abrió en tu navegador`);
console.log(`2. ${YELLOW}Recompila la aplicación${RESET} con el nuevo script:`);
console.log(`   npm run build`);
console.log(`3. ${YELLOW}Despliega en Firebase:${RESET}`);
console.log(`   firebase deploy`);
console.log(`\nEsto resolverá los errores 404 para los usuarios mientras`);
console.log(`se completa la actualización de la URL en todas partes.`);

// Fin del script
