/**
 * Script para aplicar el parche de endpoints de comentarios al servidor Railway
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
console.log(`${CYAN}     AÑADIR ENDPOINTS DE COMENTARIOS A RAILWAY${RESET}`);
console.log(`${CYAN}==================================================${RESET}\n`);

// Directorio del proyecto y API
const workspaceDir = "c:\\Users\\rober\\Desktop\\historias-desopilantes-react";
const apiRailwayDir = path.join(workspaceDir, "api-railway");
const commentsFilePath = path.join(apiRailwayDir, "comments-routes.js");
const serverFilePath = path.join(apiRailwayDir, "server.js");

// Verificar si el archivo de rutas de comentarios existe
if (!fs.existsSync(commentsFilePath)) {
  console.log(`${RED}✗ El archivo de rutas de comentarios no existe en ${commentsFilePath}${RESET}`);
  process.exit(1);
}

// Verificar si existe el servidor.js
if (!fs.existsSync(serverFilePath)) {
  console.log(`${RED}✗ No se encontró el servidor en ${serverFilePath}${RESET}`);
  process.exit(1);
}

// Leer el archivo server.js
let serverContent;
try {
  serverContent = fs.readFileSync(serverFilePath, 'utf8');
  console.log(`${GREEN}✓ Archivo server.js leído correctamente${RESET}`);
} catch (error) {
  console.log(`${RED}✗ Error al leer server.js: ${error.message}${RESET}`);
  process.exit(1);
}

// Verificar si ya tiene importado el módulo de comentarios
if (serverContent.includes('comments-routes')) {
  console.log(`${YELLOW}⚠️ El servidor ya parece tener configurados los endpoints de comentarios${RESET}`);
  console.log(`${YELLOW}   Sin embargo, Railway sigue mostrando errores 404 para estos endpoints.${RESET}`);
  console.log(`${YELLOW}   Intentaremos actualizar el servidor de todas formas.${RESET}\n`);
}

// Agregar importación del módulo de comentarios si no existe
if (!serverContent.includes('require(\'./comments-routes\')') && 
    !serverContent.includes('require("./comments-routes")')) {
  
  // Buscar donde importar el módulo
  const importPattern = /const\s+express\s*=\s*require\(['"]express['"]\);/;
  if (importPattern.test(serverContent)) {
    serverContent = serverContent.replace(
      importPattern, 
      `const express = require('express');\nconst commentsRoutes = require('./comments-routes');`
    );
    console.log(`${GREEN}✓ Importación del módulo de comentarios añadida${RESET}`);
  } else {
    console.log(`${YELLOW}⚠️ No se pudo encontrar el lugar para importar el módulo${RESET}`);
    console.log(`${YELLOW}   Añadiendo la importación al inicio del archivo${RESET}`);
    serverContent = `const commentsRoutes = require('./comments-routes');\n${serverContent}`;
  }
}

// Buscar donde inicializar las rutas de comentarios
if (!serverContent.includes('commentsRoutes(app)')) {
  // Buscar después de configuración de CORS o antes de definición de rutas
  let updated = false;
  
  // Intentar después de configuración de CORS
  const corsPattern = /app\.use\(cors\(corsOptions\)\);/;
  if (corsPattern.test(serverContent)) {
    serverContent = serverContent.replace(
      corsPattern,
      `app.use(cors(corsOptions));\n\n// Añadir rutas de comentarios\ncommentsRoutes(app);`
    );
    updated = true;
    console.log(`${GREEN}✓ Inicialización de rutas de comentarios añadida después de CORS${RESET}`);
  }
  
  // Intentar antes de la primera ruta
  if (!updated) {
    const routePattern = /app\.(get|post|put|delete)/;
    const match = serverContent.match(routePattern);
    if (match) {
      const position = match.index;
      const beforeRoute = serverContent.substring(0, position);
      const afterRoute = serverContent.substring(position);
      
      serverContent = `${beforeRoute}\n// Añadir rutas de comentarios\ncommentsRoutes(app);\n\n${afterRoute}`;
      updated = true;
      console.log(`${GREEN}✓ Inicialización de rutas de comentarios añadida antes de las rutas${RESET}`);
    }
  }
  
  // Si no se pudo encontrar un buen lugar, añadir al final
  if (!updated) {
    console.log(`${YELLOW}⚠️ No se pudo encontrar un lugar adecuado para inicializar las rutas${RESET}`);
    console.log(`${YELLOW}   Añadiendo inicialización al final del archivo${RESET}`);
    serverContent = `${serverContent}\n\n// Añadir rutas de comentarios\ncommentsRoutes(app);\n`;
  }
}

// Guardar el archivo server.js modificado
try {
  fs.writeFileSync(serverFilePath, serverContent);
  console.log(`${GREEN}✓ Archivo server.js actualizado correctamente${RESET}`);
} catch (error) {
  console.log(`${RED}✗ Error al guardar server.js: ${error.message}${RESET}`);
  process.exit(1);
}

// Preguntar si desea desplegar inmediatamente en Railway
console.log(`\n${BLUE}¿Deseas desplegar los cambios en Railway ahora? (s/n)${RESET}`);
process.stdin.once('data', (data) => {
  const answer = data.toString().trim().toLowerCase();
  
  if (answer === 's' || answer === 'si') {
    console.log(`\n${CYAN}Desplegando en Railway...${RESET}`);
    
    // Cambiar al directorio de la API
    process.chdir(apiRailwayDir);
    
    // Ejecutar comando railway up
    const railway = exec('railway up', (error, stdout, stderr) => {
      if (error) {
        console.log(`${RED}✗ Error al desplegar en Railway: ${error.message}${RESET}`);
        return;
      }
      
      console.log(stdout);
      console.log(`${GREEN}✓ Despliegue en Railway completado${RESET}`);
      
      console.log(`\n${CYAN}==================================================${RESET}`);
      console.log(`${CYAN}                 PRÓXIMOS PASOS${RESET}`);
      console.log(`${CYAN}==================================================${RESET}`);
      
      console.log(`\n1. ${YELLOW}Verifica que los endpoints de comentarios funcionan${RESET} haciendo una petición a:`);
      console.log(`   https://historias-desopilantes-react-production.up.railway.app/api/stories/1/comments`);
      console.log(`\n2. ${YELLOW}Si los endpoints siguen sin funcionar${RESET}, abre el archivo solucionar-404-comments.html`);
      console.log(`   y aplica el parche de redirección o usa los comentarios simulados.`);
    });
    
    // Mostrar la salida en tiempo real
    railway.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    railway.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  } else {
    console.log(`\n${CYAN}==================================================${RESET}`);
    console.log(`${CYAN}                 PRÓXIMOS PASOS${RESET}`);
    console.log(`${CYAN}==================================================${RESET}`);
    
    console.log(`\n1. ${YELLOW}Navega al directorio de la API${RESET}:`);
    console.log(`   cd "${apiRailwayDir}"`);
    
    console.log(`\n2. ${YELLOW}Despliega los cambios en Railway${RESET}:`);
    console.log(`   railway up`);
    
    console.log(`\n3. ${YELLOW}Verifica que los endpoints funcionen${RESET} haciendo una petición a:`);
    console.log(`   https://historias-desopilantes-react-production.up.railway.app/api/stories/1/comments`);
    
    process.exit(0);
  }
});
