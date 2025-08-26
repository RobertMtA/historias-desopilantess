// SERVIDOR DEFINITIVO SIN SSL
// Autor: GitHub Copilot
// Fecha: 25 de agosto de 2025
// Descripción: Servidor Express definitivo con conexión a PostgreSQL sin SSL
//              para resolver los problemas de conexión en Railway

require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Configuración de la aplicación
const app = express();
const PORT = process.env.PORT || 8080;

// Configuración de CORS para permitir acceso desde Firebase y desarrollo local
app.use(cors({
    origin: [
        'https://histostorias-desopilantes.web.app',
        'https://histostorias-desopilantes.firebaseapp.com',
        'http://localhost:3000',
        'http://localhost:4173',
        'http://localhost:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Middleware adicional
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Función para establecer conexión con la base de datos
async function createPoolConnection() {
    console.log("🔄 Intentando conectar a PostgreSQL...");
    
    // Intentar primero con la URL completa de la base de datos (si está definida)
    if (process.env.DATABASE_URL) {
        try {
            console.log("🔍 Usando DATABASE_URL con SSL deshabilitado");
            const pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: false
            });
            
            // Probar la conexión
            const client = await pool.connect();
            console.log("✅ Conexión exitosa usando DATABASE_URL sin SSL");
            client.release();
            return pool;
        } catch (error) {
            console.log(`❌ Error al conectar usando DATABASE_URL: ${error.message}`);
        }
    }
    
    // Intentar con parámetros individuales (con SSL deshabilitado)
    try {
        console.log("🔍 Usando parámetros individuales con SSL deshabilitado");
        const pool = new Pool({
            user: process.env.PGUSER || 'postgres',
            host: process.env.PGHOST || 'localhost',
            database: process.env.PGDATABASE || 'historias',
            password: process.env.PGPASSWORD || 'Masajist@40',
            port: process.env.PGPORT || 5432,
            ssl: false
        });
        
        // Probar la conexión
        const client = await pool.connect();
        console.log("✅ Conexión exitosa usando parámetros individuales sin SSL");
        client.release();
        return pool;
    } catch (error) {
        console.log(`❌ Error al conectar usando parámetros individuales: ${error.message}`);
    }
    
    // Último intento usando postgres:// en lugar de postgresql:// en la URL
    if (process.env.DATABASE_URL) {
        try {
            const altUrl = process.env.DATABASE_URL.replace('postgresql://', 'postgres://');
            console.log("🔍 Usando URL alternativa (postgres://) con SSL deshabilitado");
            const pool = new Pool({
                connectionString: altUrl,
                ssl: false
            });
            
            // Probar la conexión
            const client = await pool.connect();
            console.log("✅ Conexión exitosa usando URL alternativa sin SSL");
            client.release();
            return pool;
        } catch (error) {
            console.log(`❌ Error al conectar usando URL alternativa: ${error.message}`);
        }
    }
    
    // Si llegamos aquí, no se pudo conectar
    console.log("⚠️ No se pudo establecer conexión con PostgreSQL usando ningún método");
    return null;
}

// Variable global para almacenar la conexión a la base de datos
let pool = null;

// Iniciar la conexión a la base de datos
async function initializeDatabaseConnection() {
    pool = await createPoolConnection();
    
    // Si no se pudo conectar, intentar cada minuto
    if (!pool) {
        console.log("🔄 Reintentando conexión en 60 segundos...");
        setTimeout(initializeDatabaseConnection, 60000);
    } else {
        // Crear tablas si no existen
        await createTablesIfNotExist();
    }
}

// Función para crear tablas si no existen
async function createTablesIfNotExist() {
    if (!pool) return;
    
    try {
        const client = await pool.connect();
        
        // Crear tabla de historias
        await client.query(`
            CREATE TABLE IF NOT EXISTS historias (
                id SERIAL PRIMARY KEY,
                titulo VARCHAR(255) NOT NULL,
                contenido TEXT NOT NULL,
                autor VARCHAR(100),
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                likes INTEGER DEFAULT 0
            )
        `);
        
        // Crear tabla de comentarios
        await client.query(`
            CREATE TABLE IF NOT EXISTS comentarios (
                id SERIAL PRIMARY KEY,
                historia_id INTEGER REFERENCES historias(id) ON DELETE CASCADE,
                nombre VARCHAR(100),
                comentario TEXT NOT NULL,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Crear tabla de contactos
        await client.query(`
            CREATE TABLE IF NOT EXISTS contactos (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL,
                mensaje TEXT NOT NULL,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log("✅ Tablas verificadas/creadas correctamente");
        client.release();
    } catch (error) {
        console.error("❌ Error al crear tablas:", error.message);
    }
}

// Middleware para verificar la conexión a la base de datos
const dbConnectionCheck = async (req, res, next) => {
    if (!pool) {
        // Intentar conectar de nuevo
        pool = await createPoolConnection();
        
        if (!pool) {
            return res.status(503).json({ 
                error: "No hay conexión a la base de datos",
                message: "Estamos experimentando problemas técnicos. Por favor, inténtalo más tarde."
            });
        }
    }
    next();
};

// Ruta de prueba para verificar el servidor
app.get('/', (req, res) => {
    res.json({
        message: "API de Historias Desopilantes funcionando correctamente",
        version: "1.0.0",
        status: "online"
    });
});

// Ruta para probar la conexión a la base de datos
app.get('/api/db-test', dbConnectionCheck, async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as tiempo');
        client.release();
        
        res.json({
            status: "success",
            message: "Conexión a PostgreSQL exitosa",
            timestamp: result.rows[0].tiempo,
            database_info: {
                host: process.env.PGHOST || 'No disponible',
                database: process.env.PGDATABASE || 'No disponible',
                user: process.env.PGUSER || 'No disponible',
                ssl_mode: "Deshabilitado"
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error al conectar a PostgreSQL",
            error: error.message
        });
    }
});

// Rutas para historias
app.get('/api/historias', dbConnectionCheck, async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM historias ORDER BY fecha DESC');
        client.release();
        
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            error: "Error al obtener historias",
            details: error.message
        });
    }
});

app.get('/api/historias/:id', dbConnectionCheck, async (req, res) => {
    try {
        const { id } = req.params;
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM historias WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            client.release();
            return res.status(404).json({
                error: "Historia no encontrada"
            });
        }
        
        // Obtener comentarios de la historia
        const comentarios = await client.query(
            'SELECT * FROM comentarios WHERE historia_id = $1 ORDER BY fecha DESC',
            [id]
        );
        
        client.release();
        
        res.json({
            ...result.rows[0],
            comentarios: comentarios.rows
        });
    } catch (error) {
        res.status(500).json({
            error: "Error al obtener la historia",
            details: error.message
        });
    }
});

app.post('/api/historias', dbConnectionCheck, async (req, res) => {
    try {
        const { titulo, contenido, autor } = req.body;
        
        if (!titulo || !contenido) {
            return res.status(400).json({
                error: "El título y contenido son obligatorios"
            });
        }
        
        const client = await pool.connect();
        const result = await client.query(
            'INSERT INTO historias (titulo, contenido, autor) VALUES ($1, $2, $3) RETURNING *',
            [titulo, contenido, autor || 'Anónimo']
        );
        client.release();
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            error: "Error al crear la historia",
            details: error.message
        });
    }
});

app.post('/api/historias/:id/like', dbConnectionCheck, async (req, res) => {
    try {
        const { id } = req.params;
        const client = await pool.connect();
        
        // Verificar si la historia existe
        const checkResult = await client.query('SELECT * FROM historias WHERE id = $1', [id]);
        
        if (checkResult.rows.length === 0) {
            client.release();
            return res.status(404).json({
                error: "Historia no encontrada"
            });
        }
        
        // Actualizar likes
        const result = await client.query(
            'UPDATE historias SET likes = likes + 1 WHERE id = $1 RETURNING *',
            [id]
        );
        client.release();
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            error: "Error al dar like a la historia",
            details: error.message
        });
    }
});

// Rutas para comentarios
app.post('/api/historias/:id/comentarios', dbConnectionCheck, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, comentario } = req.body;
        
        if (!comentario) {
            return res.status(400).json({
                error: "El comentario es obligatorio"
            });
        }
        
        const client = await pool.connect();
        
        // Verificar si la historia existe
        const checkResult = await client.query('SELECT * FROM historias WHERE id = $1', [id]);
        
        if (checkResult.rows.length === 0) {
            client.release();
            return res.status(404).json({
                error: "Historia no encontrada"
            });
        }
        
        // Crear comentario
        const result = await client.query(
            'INSERT INTO comentarios (historia_id, nombre, comentario) VALUES ($1, $2, $3) RETURNING *',
            [id, nombre || 'Anónimo', comentario]
        );
        client.release();
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            error: "Error al crear el comentario",
            details: error.message
        });
    }
});

// Ruta para formulario de contacto
app.post('/api/contacto', dbConnectionCheck, async (req, res) => {
    try {
        const { nombre, email, mensaje } = req.body;
        
        if (!nombre || !email || !mensaje) {
            return res.status(400).json({
                error: "Todos los campos son obligatorios"
            });
        }
        
        // Validación básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: "El formato del email no es válido"
            });
        }
        
        const client = await pool.connect();
        const result = await client.query(
            'INSERT INTO contactos (nombre, email, mensaje) VALUES ($1, $2, $3) RETURNING *',
            [nombre, email, mensaje]
        );
        client.release();
        
        res.status(201).json({
            message: "Mensaje enviado correctamente",
            contacto: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            error: "Error al enviar el mensaje de contacto",
            details: error.message
        });
    }
});

// Manejo de errores 404
app.use((req, res, next) => {
    res.status(404).json({
        error: "Ruta no encontrada",
        path: req.originalUrl
    });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
    console.error('Error no controlado:', err);
    res.status(500).json({
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === 'development' ? err.message : 'Error del servidor'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
    console.log(`=================================================`);
    
    // Iniciar conexión a la base de datos
    initializeDatabaseConnection();
});
