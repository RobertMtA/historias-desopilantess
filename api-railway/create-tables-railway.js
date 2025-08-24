/**
 * Script para crear las tablas necesarias para la API de Historias Desopilantes
 * Este script crea la tabla story_interactions si no existe
 * 
 * Para ejecutar en Railway usar: railway run node create-tables-railway.js
 */

// Crear tabla story_interactions
const createTable = `
  CREATE TABLE IF NOT EXISTS story_interactions (
    id SERIAL PRIMARY KEY,
    historia_id INTEGER NOT NULL,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_historia_interaction UNIQUE (historia_id)
  );
`;

console.log('✅ Script para crear tablas en Railway');
console.log('====================================');
console.log('📦 Este archivo se ejecutará automáticamente durante el despliegue');
console.log('📊 Creará las tablas necesarias para el funcionamiento de la API');
console.log('====================================');
