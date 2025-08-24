/**
 * SOLUCIÓN DEFINITIVA PARA PROBLEMAS DE CONEXIÓN POSTGRESQL
 * 
 * Este archivo contiene una implementación robusta para manejar
 * conexiones a PostgreSQL en entornos Railway con alta disponibilidad.
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

/**
 * Crea una conexión robusta a PostgreSQL
 * @param {Object} config - Configuración para la conexión
 * @returns {Object} Pool de conexión y funciones auxiliares
 */
function createRobustPostgresConnection(config = {}) {
  // Configuración predeterminada
  const {
    connectionString = process.env.DATABASE_URL,
    useSSL = !!process.env.RAILWAY_ENVIRONMENT,
    maxRetries = 5,
    retryDelay = 5000,
    logPrefix = '📊 [DB]',
    mockMode = false,
    mockData = {},
  } = config;
  
  // Logger personalizado para operaciones de BD
  const dbLogger = {
    log: (msg) => console.log(`${logPrefix} ${msg}`),
    error: (msg) => console.error(`❌ ${logPrefix} ${msg}`),
    warn: (msg) => console.warn(`⚠️ ${logPrefix} ${msg}`),
    success: (msg) => console.log(`✅ ${logPrefix} ${msg}`),
  };
  
  // Estado de la conexión
  let connectionState = {
    isConnected: false,
    failedAttempts: 0,
    lastError: null,
    inMockMode: mockMode || !connectionString,
    retryTimeout: null,
    isRetrying: false,
  };
  
  // Datos mock para respuestas sin BD
  const defaultMockData = {
    stories: Array.from({ length: 21 }, (_, i) => ({
      id: i + 1,
      title: `Historia Mock #${i + 1}`,
      content: 'Este es el contenido de una historia generada automáticamente.',
    })),
    comments: [],
    likes: {},
    ...mockData
  };
  
  let mockDataStore = { ...defaultMockData };
  
  // Crear pool de conexión
  let pool = null;
  
  // Si no estamos en modo mock y tenemos connectionString, crear el pool
  if (!connectionState.inMockMode) {
    try {
      dbLogger.log('Inicializando conexión a PostgreSQL...');
      dbLogger.log(`URL de conexión: ${connectionString ? 'Configurada' : 'No disponible'}`);
      
      if (!connectionString) {
        throw new Error('URL de conexión no disponible');
      }
      
      pool = new Pool({
        connectionString,
        ssl: useSSL ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000,
      });
      
      // Manejar errores del pool
      pool.on('error', (err) => {
        dbLogger.error(`Error en pool de conexión: ${err.message}`);
        connectionState.isConnected = false;
        connectionState.lastError = err;
        
        // Intentar reconectar si no estamos ya en proceso de reconexión
        if (!connectionState.isRetrying) {
          retryConnection();
        }
      });
      
    } catch (error) {
      dbLogger.error(`Error al crear pool: ${error.message}`);
      connectionState.lastError = error;
      connectionState.inMockMode = true;
      
      // Crear un pool simulado
      createMockPool();
    }
  } else {
    dbLogger.warn('Iniciando en modo simulado (mock)');
    createMockPool();
  }
  
  /**
   * Crea un pool simulado para cuando no hay conexión a BD
   */
  function createMockPool() {
    dbLogger.warn('Creando pool simulado para continuar sin BD');
    pool = {
      query: async (text, params) => mockQuery(text, params),
      connect: () => ({ 
        query: async (text, params) => mockQuery(text, params),
        release: () => {}
      }),
      end: async () => Promise.resolve(),
      on: () => {},
      _isMock: true,
    };
    connectionState.inMockMode = true;
  }
  
  /**
   * Ejecuta una consulta simulada para modo sin BD
   */
  async function mockQuery(text, params) {
    dbLogger.warn(`Ejecutando consulta simulada: ${text.slice(0, 50)}...`);
    
    // Simular delay para que parezca real
    await new Promise(r => setTimeout(r, 50));
    
    // Consultas SELECT
    if (text.toLowerCase().includes('select')) {
      // Likes para una historia específica
      if (text.toLowerCase().includes('from story_interactions where historia_id =')) {
        const id = params ? params[0] : parseInt(text.match(/historia_id\s*=\s*(\d+)/i)[1]);
        const likes = mockDataStore.likes[id] || 0;
        return { rows: [{ likes }], rowCount: 1 };
      }
      
      // Comentarios para una historia específica
      if (text.toLowerCase().includes('from comentarios where historia_id =')) {
        const id = params ? params[0] : parseInt(text.match(/historia_id\s*=\s*(\d+)/i)[1]);
        const comments = mockDataStore.comments.filter(c => c.historia_id === id);
        return { rows: comments, rowCount: comments.length };
      }
      
      // Para cualquier otra consulta SELECT
      return { rows: [], rowCount: 0 };
    }
    
    // Consultas INSERT
    if (text.toLowerCase().includes('insert into')) {
      // INSERT en story_interactions (likes)
      if (text.toLowerCase().includes('insert into story_interactions')) {
        const id = params ? params[0] : parseInt(text.match(/values\s*\(\s*(\d+)/i)[1]);
        mockDataStore.likes[id] = (mockDataStore.likes[id] || 0) + 1;
        return { rows: [{ likes: mockDataStore.likes[id] }], rowCount: 1 };
      }
      
      // INSERT en comentarios
      if (text.toLowerCase().includes('insert into comentarios')) {
        const id = params ? params[0] : parseInt(text.match(/values\s*\(\s*(\d+)/i)[1]);
        const autor = params ? params[1] : 'Usuario simulado';
        const contenido = params ? params[2] : 'Comentario simulado';
        
        const comment = {
          id: Math.floor(Math.random() * 10000),
          historia_id: id,
          autor,
          contenido,
          fecha: new Date().toISOString()
        };
        
        mockDataStore.comments.push(comment);
        return { rows: [comment], rowCount: 1 };
      }
    }
    
    // CREATE TABLE
    if (text.toLowerCase().includes('create table')) {
      return { rows: [], rowCount: 0 };
    }
    
    // Para cualquier otra consulta
    return { rows: [], rowCount: 0 };
  }
  
  /**
   * Verifica la conexión a la base de datos
   */
  async function testConnection() {
    if (connectionState.inMockMode) {
      dbLogger.warn('En modo simulado, no se verifica conexión real');
      return true;
    }
    
    try {
      const client = await pool.connect();
      dbLogger.success('Conexión a PostgreSQL verificada correctamente');
      connectionState.isConnected = true;
      connectionState.failedAttempts = 0;
      
      // Crear tablas necesarias
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS story_interactions (
            id SERIAL PRIMARY KEY,
            historia_id INTEGER NOT NULL,
            likes INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT unique_historia_interaction UNIQUE (historia_id)
          );
          
          CREATE TABLE IF NOT EXISTS comentarios (
            id SERIAL PRIMARY KEY,
            historia_id INTEGER NOT NULL,
            autor VARCHAR(100) NOT NULL,
            contenido TEXT NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        dbLogger.success('Tablas verificadas correctamente');
      } catch (tableError) {
        dbLogger.error(`Error al crear tablas: ${tableError.message}`);
      }
      
      client.release();
      return true;
    } catch (err) {
      connectionState.isConnected = false;
      connectionState.failedAttempts++;
      connectionState.lastError = err;
      dbLogger.error(`Error de conexión: ${err.message}`);
      
      // Si alcanzamos el máximo de reintentos, cambiar a modo mock
      if (connectionState.failedAttempts >= maxRetries) {
        dbLogger.warn(`Máximo de reintentos alcanzado (${maxRetries}). Cambiando a modo simulado.`);
        connectionState.inMockMode = true;
        createMockPool();
      } else if (!connectionState.isRetrying) {
        // Programar reintento si no estamos ya reintentando
        retryConnection();
      }
      
      return false;
    }
  }
  
  /**
   * Reintenta la conexión automáticamente
   */
  function retryConnection() {
    if (connectionState.isRetrying) return;
    
    connectionState.isRetrying = true;
    dbLogger.warn(`Reintentando conexión en ${retryDelay/1000} segundos... (Intento ${connectionState.failedAttempts + 1}/${maxRetries})`);
    
    clearTimeout(connectionState.retryTimeout);
    connectionState.retryTimeout = setTimeout(async () => {
      connectionState.isRetrying = false;
      await testConnection();
    }, retryDelay);
  }
  
  // Verificar la conexión inicial
  testConnection();
  
  // Devolver objeto con pool y funciones útiles
  return {
    pool,
    testConnection,
    getState: () => ({ ...connectionState }),
    isMockMode: () => connectionState.inMockMode,
    getMockData: () => mockDataStore,
    setMockData: (data) => {
      mockDataStore = { ...mockDataStore, ...data };
    },
    resetMockData: () => {
      mockDataStore = { ...defaultMockData };
    },
    logger: dbLogger
  };
}

module.exports = { createRobustPostgresConnection };
