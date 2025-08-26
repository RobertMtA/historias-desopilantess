/**
 * CONFIGURACIÓN Y DESPLIEGUE DE ENDPOINTS DE COMENTARIOS EN RAILWAY
 * 
 * Este script configura los endpoints de comentarios y los despliega en Railway
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Colores para la consola
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';

console.log(`${CYAN}==================================================${RESET}`);
console.log(`${CYAN}        CONFIGURAR Y DESPLEGAR COMENTARIOS${RESET}`);
console.log(`${CYAN}==================================================${RESET}\n`);

// Directorios principales
const workspaceDir = "c:\\Users\\rober\\Desktop\\historias-desopilantes-react";
const apiRailwayDir = path.join(workspaceDir, "api-railway");
const commentsFilePath = path.join(apiRailwayDir, "comments-routes.js");
const serverFilePath = path.join(apiRailwayDir, "server.js");

// 1. Verificar si existe el archivo de rutas de comentarios
console.log(`${BLUE}1. Verificando archivos necesarios...${RESET}`);

if (!fs.existsSync(commentsFilePath)) {
  console.log(`${YELLOW}⚠️ El archivo comments-routes.js no existe${RESET}`);
  console.log(`   Creando archivo de rutas de comentarios...`);
  
  const commentsRouteContent = fs.readFileSync(path.join(workspaceDir, "api-railway", "comments-routes.js"), 'utf8');
  fs.writeFileSync(commentsFilePath, commentsRouteContent);
  console.log(`${GREEN}✓ Archivo comments-routes.js creado${RESET}`);
} else {
  console.log(`${GREEN}✓ Archivo comments-routes.js encontrado${RESET}`);
}

// 2. Verificar y actualizar server.js
console.log(`\n${BLUE}2. Actualizando server.js con endpoints de comentarios...${RESET}`);

try {
  const serverContent = fs.readFileSync(serverFilePath, 'utf8');
  let updatedContent = serverContent;
  let modified = false;

  // Verificar si ya tiene importado el módulo de comentarios
  if (!serverContent.includes('comments-routes')) {
    // Agregar importación
    updatedContent = `const commentsRoutes = require('./comments-routes');\n${updatedContent}`;
    modified = true;
    console.log(`${GREEN}✓ Importación de comments-routes añadida${RESET}`);

    // Buscar dónde inicializar las rutas
    if (!updatedContent.includes('commentsRoutes(app)')) {
      // Intentar después de configuración de CORS
      const corsPattern = /app\.use\(cors\(corsOptions\)\);/;
      if (corsPattern.test(updatedContent)) {
        updatedContent = updatedContent.replace(
          corsPattern,
          `app.use(cors(corsOptions));\n\n// Añadir rutas de comentarios\ncommentsRoutes(app);`
        );
        modified = true;
        console.log(`${GREEN}✓ Inicialización de rutas añadida después de CORS${RESET}`);
      } else {
        // Intentar añadir antes de la definición de la primera ruta
        const routePattern = /app\.(get|post|put|delete)/;
        const match = updatedContent.match(routePattern);
        if (match) {
          const position = match.index;
          const beforeRoute = updatedContent.substring(0, position);
          const afterRoute = updatedContent.substring(position);
          
          updatedContent = `${beforeRoute}\n// Añadir rutas de comentarios\ncommentsRoutes(app);\n\n${afterRoute}`;
          modified = true;
          console.log(`${GREEN}✓ Inicialización de rutas añadida antes de las rutas existentes${RESET}`);
        } else {
          console.log(`${YELLOW}⚠️ No se pudo encontrar un lugar adecuado para inicializar las rutas${RESET}`);
          updatedContent = `${updatedContent}\n\n// Añadir rutas de comentarios\ncommentsRoutes(app);\n`;
          modified = true;
        }
      }
    } else {
      console.log(`${GREEN}✓ La inicialización de rutas ya existe${RESET}`);
    }
  } else {
    console.log(`${GREEN}✓ El servidor ya tiene configurados los endpoints de comentarios${RESET}`);
  }

  // Guardar cambios si hubo modificaciones
  if (modified) {
    fs.writeFileSync(serverFilePath, updatedContent);
    console.log(`${GREEN}✓ Archivo server.js actualizado exitosamente${RESET}`);
  }
} catch (error) {
  console.log(`${RED}✗ Error al actualizar server.js: ${error.message}${RESET}`);
  process.exit(1);
}

// 3. Vincular proyecto de Railway
console.log(`\n${BLUE}3. Vinculando proyecto de Railway...${RESET}`);

try {
  console.log(`${YELLOW}⚠️ Verificando si estamos en un directorio vinculado a Railway${RESET}`);
  process.chdir(apiRailwayDir);
  
  try {
    // Intentar obtener el estado del proyecto
    const status = execSync('railway status', { stdio: 'pipe' }).toString();
    console.log(`${GREEN}✓ Proyecto de Railway ya está vinculado:${RESET}`);
    console.log(status);
  } catch (error) {
    console.log(`${YELLOW}⚠️ El proyecto no está vinculado. Ejecutando railway link...${RESET}`);
    
    // Ejecutar railway login si es necesario
    try {
      execSync('railway whoami', { stdio: 'pipe' });
      console.log(`${GREEN}✓ Usuario ya autenticado en Railway${RESET}`);
    } catch (authError) {
      console.log(`${YELLOW}⚠️ Es necesario autenticarse en Railway${RESET}`);
      console.log(`${YELLOW}   Por favor, ejecuta 'railway login' en una terminal y luego vuelve a ejecutar este script${RESET}`);
      process.exit(1);
    }
    
    console.log(`${YELLOW}⚠️ IMPORTANTE: A continuación se abrirá una ventana interactiva${RESET}`);
    console.log(`${YELLOW}   Selecciona el proyecto 'historias-desopilantes' y el entorno 'production'${RESET}`);
    console.log(`${YELLOW}   Presiona Enter para continuar...${RESET}`);
    
    // Esperar a que el usuario presione Enter
    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    }).question('', () => {
      // Ejecutar railway link de forma interactiva
      const linkProcess = spawn('railway', ['link'], { stdio: 'inherit' });
      
      linkProcess.on('close', (code) => {
        if (code !== 0) {
          console.log(`${RED}✗ Error al vincular proyecto de Railway${RESET}`);
          process.exit(1);
        } else {
          console.log(`${GREEN}✓ Proyecto de Railway vinculado correctamente${RESET}`);
          deployToRailway();
        }
      });
    });
  }
} catch (error) {
  console.log(`${RED}✗ Error al vincular Railway: ${error.message}${RESET}`);
  process.exit(1);
}

// 4. Desplegar en Railway
function deployToRailway() {
  console.log(`\n${BLUE}4. Desplegando en Railway...${RESET}`);
  console.log(`${YELLOW}⚠️ Este proceso puede tardar varios minutos${RESET}`);
  
  const deployProcess = spawn('railway', ['up'], { stdio: 'inherit' });
  
  deployProcess.on('close', (code) => {
    if (code !== 0) {
      console.log(`${RED}✗ Error al desplegar en Railway${RESET}`);
      showNextSteps(false);
    } else {
      console.log(`${GREEN}✓ Despliegue en Railway completado exitosamente${RESET}`);
      showNextSteps(true);
    }
  });
}

// Mostrar próximos pasos
function showNextSteps(deploySuccess) {
  console.log(`\n${CYAN}==================================================${RESET}`);
  console.log(`${CYAN}                 PRÓXIMOS PASOS${RESET}`);
  console.log(`${CYAN}==================================================${RESET}\n`);
  
  if (deploySuccess) {
    console.log(`1. ${GREEN}✓ Endpoints de comentarios configurados y desplegados${RESET}`);
    console.log(`2. ${YELLOW}Verifica que los endpoints funcionan${RESET} accediendo a:`);
    console.log(`   https://historias-desopilantes-react-production.up.railway.app/api/stories/1/comments`);
  } else {
    console.log(`1. ${RED}✗ Error en el despliegue${RESET}`);
    console.log(`   Intenta ejecutar manualmente los siguientes comandos:`);
    console.log(`   cd "${apiRailwayDir}"`);
    console.log(`   railway login`);
    console.log(`   railway link`);
    console.log(`   railway up`);
  }
  
  console.log(`\n3. ${YELLOW}Si continúas viendo errores 404${RESET}, usa el parche del lado del cliente:`);
  console.log(`   Abre el archivo solucionar-404-comments.html en tu navegador`);
  
  console.log(`\n4. ${YELLOW}Para actualizar la aplicación completamente${RESET}, ejecuta:`);
  console.log(`   cd "${workspaceDir}"`);
  console.log(`   .\\actualizar-completo.ps1`);
}

// Si el proyecto ya está vinculado, desplegar directamente
if (process.argv.includes('--deploy-now')) {
  deployToRailway();
}
