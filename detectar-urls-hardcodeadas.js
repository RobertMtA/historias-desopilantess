// Script para detectar URLs hardcodeadas en el código

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directorios a excluir
const excludeDirs = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'coverage',
];

// Patrones a buscar
const patterns = [
  'localhost:4000',
  'http://localhost:4000',
  'https://localhost:4000',
];

// Función para buscar en archivos
function searchInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileExt = path.extname(filePath).toLowerCase();
    
    // Solo analizar archivos de código relevantes
    if (!['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json'].includes(fileExt)) {
      return null;
    }
    
    let results = [];
    
    patterns.forEach(pattern => {
      let index = 0;
      while ((index = content.indexOf(pattern, index)) !== -1) {
        // Obtener el contexto (línea completa)
        const lineStart = content.lastIndexOf('\n', index) + 1;
        const lineEnd = content.indexOf('\n', index);
        const line = content.substring(
          lineStart, 
          lineEnd === -1 ? content.length : lineEnd
        );
        
        // Calcular número de línea
        const lineNumber = content.substring(0, index).split('\n').length;
        
        results.push({
          pattern,
          line: line.trim(),
          lineNumber
        });
        
        index += pattern.length;
      }
    });
    
    if (results.length > 0) {
      return {
        file: filePath,
        matches: results
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error al leer archivo ${filePath}:`, error);
    return null;
  }
}

// Función para buscar recursivamente en un directorio
function searchInDirectory(dir) {
  let results = [];
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    
    // Saltar directorios excluidos
    if (fs.statSync(itemPath).isDirectory()) {
      if (!excludeDirs.includes(item)) {
        results = results.concat(searchInDirectory(itemPath));
      }
      continue;
    }
    
    const fileResult = searchInFile(itemPath);
    if (fileResult) {
      results.push(fileResult);
    }
  }
  
  return results;
}

console.log('🔍 Buscando referencias hardcodeadas a localhost:4000...');

// Iniciar búsqueda desde el directorio actual
const results = searchInDirectory(path.resolve('./'));

if (results.length === 0) {
  console.log('✅ No se encontraron referencias hardcodeadas a localhost:4000');
} else {
  console.log(`⚠️ Se encontraron ${results.length} archivos con referencias hardcodeadas:`);
  
  results.forEach(result => {
    console.log(`\nArchivo: ${result.file}`);
    result.matches.forEach(match => {
      console.log(`  - Línea ${match.lineNumber}: ${match.line}`);
    });
  });
  
  console.log('\n⚠️ Estas referencias deben ser reemplazadas por la función buildApiUrl');
}
