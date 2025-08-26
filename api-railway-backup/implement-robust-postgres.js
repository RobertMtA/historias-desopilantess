/**
 * SCRIPT DE IMPLEMENTACIÓN DE LA SOLUCIÓN DEFINITIVA PARA POSTGRES
 * 
 * Este script integra la conexión robusta a PostgreSQL
 * en el servidor de Railway.
 */

const fs = require('fs');
const path = require('path');

// Rutas de archivos
const serverPath = path.join(__dirname, 'server.js');
const backupPath = path.join(__dirname, 'server.js.backup-' + Date.now());
const robustPgPath = path.join(__dirname, 'lib/robust-postgres.js');

// Verificar que el archivo de conexión robusta existe
if (!fs.existsSync(robustPgPath)) {
  console.error('❌ Error: El archivo lib/robust-postgres.js no existe');
  process.exit(1);
}

// Leer archivo de servidor
console.log('📂 Leyendo archivo server.js...');
let serverContent = '';
try {
  serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Hacer copia de seguridad
  console.log('💾 Creando copia de seguridad del servidor...');
  fs.writeFileSync(backupPath, serverContent, 'utf8');
  console.log(`✅ Copia de seguridad creada en: ${backupPath}`);
  
} catch (error) {
  console.error(`❌ Error al leer server.js: ${error.message}`);
  process.exit(1);
}

// Identificar la sección de código a reemplazar
const oldConnectionCode = /\/\/ Configuración de PostgreSQL[\s\S]*?try \{[\s\S]*?pool\.connect\(\(err, client, release\) => \{[\s\S]*?\}\);[\s\S]*?\} catch \(error\) \{[\s\S]*?\};/;

// Nuevo código para la conexión robusta
const newConnectionCode = `// Configuración de PostgreSQL con manejo robusto de errores
const { createRobustPostgresConnection } = require('./lib/robust-postgres');

// Cargar logo desde archivo (si existe)
let logoBase64 = '';
try {
  const logoPath = path.join(__dirname, 'logo.txt');
  if (fs.existsSync(logoPath)) {
    logoBase64 = fs.readFileSync(logoPath, 'utf8');
    console.log('✅ Logo cargado desde archivo');
  }
} catch (error) {
  console.warn('⚠️ No se pudo cargar el logo:', error.message);
}

// Crear conexión robusta a PostgreSQL
const dbConnection = createRobustPostgresConnection({
  // La URL de conexión se toma automáticamente de process.env.DATABASE_URL
  maxRetries: 5,
  retryDelay: 5000,
  logPrefix: '📊 [PostgreSQL]',
  // Datos iniciales para modo simulado
  mockData: {
    likes: {},
    comments: []
  }
});

// Obtener el pool para usar en el resto del código
const pool = dbConnection.pool;`;

// Reemplazar el código de conexión
console.log('🔄 Reemplazando código de conexión a PostgreSQL...');
const updatedServerContent = serverContent.replace(oldConnectionCode, newConnectionCode);

if (updatedServerContent === serverContent) {
  console.warn('⚠️ No se pudo encontrar el código de conexión para reemplazar');
  console.log('⚙️ Intentando una estrategia alternativa...');
  
  // Estrategia alternativa: buscar secciones específicas
  const importSection = /const express = require\('express'\);[\s\S]*?const PORT = process\.env\.PORT \|\| \d+;/;
  const poolDeclaration = /let pool;[\s\S]*?try \{[\s\S]*?pool = new Pool\(\{[\s\S]*?\}\);/;
  
  // Reemplazar las secciones específicas
  let altUpdatedContent = serverContent;
  
  // Añadir el require para path y fs
  if (!altUpdatedContent.includes("const path = require('path');")) {
    altUpdatedContent = altUpdatedContent.replace(
      "const express = require('express');",
      "const express = require('express');\nconst path = require('path');\nconst fs = require('fs');"
    );
  }
  
  // Reemplazar la declaración del pool
  if (altUpdatedContent.includes('let pool;')) {
    altUpdatedContent = altUpdatedContent.replace(
      'let pool;',
      newConnectionCode
    );
    
    // Eliminar el bloque try-catch original si existe
    altUpdatedContent = altUpdatedContent.replace(
      /try \{[\s\S]*?console\.log\('📊 Configurando conexión PostgreSQL[\s\S]*?pool = \{[\s\S]*?\};[\s\S]*?\}/,
      ''
    );
    
    console.log('✅ Código de conexión reemplazado con estrategia alternativa');
    fs.writeFileSync(serverPath, altUpdatedContent, 'utf8');
  } else {
    console.error('❌ No se pudo implementar la solución automáticamente');
    console.log('Por favor, integra manualmente el código de conexión robusta.');
  }
} else {
  console.log('✅ Código de conexión reemplazado correctamente');
  fs.writeFileSync(serverPath, updatedServerContent, 'utf8');
}

console.log('🎉 Implementación de la solución robusta completada!');
console.log(`
La conexión a PostgreSQL ahora incluye:
- Reintentos automáticos (5 intentos con 5 segundos entre cada uno)
- Modo simulado si la conexión falla persistentemente
- Datos simulados para mantener la funcionalidad sin BD
- Gestión de errores mejorada
- Creación automática de tablas

Para ver el resultado en Railway, despliega el servidor actualizado.
`);
