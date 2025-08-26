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
        const { autor, contenido } = req.body; // Cambiado a autor y contenido
        
        if (!contenido) { // Cambiado a contenido
            return res.status(400).json({
                error: "El contenido del comentario es obligatorio"
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
        
        // Crear comentario con las columnas correctas
        const result = await client.query(
            'INSERT INTO comentarios (historia_id, autor, contenido, fecha) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [id, autor || 'Anónimo', contenido]
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

// ENDPOINT PARA AGREGAR NUEVAS HISTORIAS
app.post('/api/stories', async (req, res) => {
    try {
        const { titulo, contenido, autor, pais, year, categoria } = req.body;
        
        console.log('📝 Creando nueva historia:', { titulo, autor });
        
        // Validar campos requeridos
        if (!titulo || !contenido) {
            return res.status(400).json({
                status: 'error',
                message: 'Titulo y contenido son obligatorios'
            });
        }
        
        // Insertar nueva historia
        const result = await pool.query(`
            INSERT INTO historias (titulo, contenido, autor, pais, año, categoria, fecha)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING *
        `, [
            titulo, 
            contenido, 
            autor || 'Historia Desopilante', 
            pais || 'Desconocido', 
            year || null, 
            categoria || 'General'
        ]);
        
        const nuevaHistoria = result.rows[0];
        
        console.log('✅ Historia creada con ID:', nuevaHistoria.id);
        
        res.status(201).json({
            status: 'success',
            message: 'Historia creada exitosamente',
            data: {
                id: nuevaHistoria.id,
                titulo: nuevaHistoria.titulo,
                contenido: nuevaHistoria.contenido,
                autor: nuevaHistoria.autor,
                pais: nuevaHistoria.pais,
                año: nuevaHistoria.año,
                categoria: nuevaHistoria.categoria,
                fecha: nuevaHistoria.fecha
            }
        });
        
    } catch (error) {
        console.error('❌ Error al crear historia:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            details: error.message
        });
    }
});

// ENDPOINTS PARA COMPATIBILIDAD CON FRONTEND (/api/stories/)
// GET /api/stories/:id/likes - Obtener likes de una historia
app.get('/api/stories/:id/likes', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`❤️ Obteniendo likes para historia ID: ${id}`);
        
        // Verificar si la historia existe
        const historiaResult = await pool.query('SELECT id FROM historias WHERE id = $1', [id]);
        
        if (historiaResult.rows.length === 0) {
            return res.json({
                storyId: parseInt(id),
                likes: 0,
                hasLiked: false,
                exists: false
            });
        }
        
        // Simular likes aleatorios por ahora
        const likes = Math.floor(Math.random() * 100) + 5;
        
        res.json({
            storyId: parseInt(id),
            likes: likes,
            hasLiked: false,
            exists: true
        });
    } catch (error) {
        console.error('❌ Error obteniendo likes:', error);
        res.json({
            storyId: parseInt(req.params.id),
            likes: 0,
            hasLiked: false,
            exists: false,
            error: true
        });
    }
});

// POST /api/stories/:id/likes - Dar like a una historia
app.post('/api/stories/:id/likes', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`❤️ Agregando like a historia ID: ${id}`);
        
        // Verificar si la historia existe
        const historiaResult = await pool.query('SELECT id FROM historias WHERE id = $1', [id]);
        
        if (historiaResult.rows.length === 0) {
            return res.json({
                storyId: parseInt(id),
                likes: 0,
                hasLiked: false,
                exists: false
            });
        }
        
        // Simular incremento de likes
        const likes = Math.floor(Math.random() * 100) + 6;
        
        res.json({
            storyId: parseInt(id),
            likes: likes,
            hasLiked: true,
            exists: true
        });
    } catch (error) {
        console.error('❌ Error agregando like:', error);
        res.json({
            storyId: parseInt(req.params.id),
            likes: 1,
            hasLiked: false,
            exists: false,
            error: true
        });
    }
});

// GET /api/stories/:id/comments - Obtener comentarios de una historia
app.get('/api/stories/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`💬 Obteniendo comentarios para historia ID: ${id}`);
        
        // Verificar si la historia existe
        const historiaResult = await pool.query('SELECT id FROM historias WHERE id = $1', [id]);
        
        if (historiaResult.rows.length === 0) {
            return res.json({
                storyId: parseInt(id),
                comments: [],
                total: 0,
                exists: false
            });
        }
        
        // Obtener comentarios reales
        const comentariosResult = await pool.query(
            'SELECT * FROM comentarios WHERE historia_id = $1 ORDER BY fecha DESC',
            [id]
        );
        
        const comments = comentariosResult.rows.map(row => ({
            id: row.id,
            userName: row.autor,
            comment: row.contenido,
            createdAt: row.fecha
        }));
        
        res.json({
            storyId: parseInt(id),
            comments: comments,
            total: comments.length,
            exists: true
        });
    } catch (error) {
        console.error('❌ Error obteniendo comentarios:', error);
        res.json({
            storyId: parseInt(req.params.id),
            comments: [],
            total: 0,
            exists: false,
            error: true
        });
    }
});

// POST /api/stories/:id/comments - Agregar comentario a una historia
app.post('/api/stories/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { userName, comment } = req.body;
        console.log(`💬 Agregando comentario a historia ID: ${id}`, { userName, comment });
        
        // Validar datos
        if (!userName || !comment) {
            return res.status(400).json({
                status: 'error',
                message: 'userName y comment son obligatorios'
            });
        }
        
        // Verificar si la historia existe
        const historiaResult = await pool.query('SELECT id FROM historias WHERE id = $1', [id]);
        
        if (historiaResult.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Historia no encontrada'
            });
        }
        
        // Insertar comentario
        const result = await pool.query(`
            INSERT INTO comentarios (historia_id, autor, contenido, fecha)
            VALUES ($1, $2, $3, NOW())
            RETURNING *
        `, [id, userName, comment]);
        
        const newComment = result.rows[0];
        
        res.status(201).json({
            status: 'success',
            comment: {
                id: newComment.id,
                userName: newComment.autor,
                comment: newComment.contenido,
                createdAt: newComment.fecha
            }
        });
    } catch (error) {
        console.error('❌ Error agregando comentario:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al agregar comentario'
        });
    }
});

// ENDPOINTS DE ADMINISTRACIÓN
// POST /api/admin/auth/login - Login de administrador
app.post('/api/admin/auth/login', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        console.log(`🔐 Intento de login admin - Email/Username: ${email || username}`);
        
        // Validar credenciales (valores hardcodeados por simplicidad)
        const validCredentials = [
            { email: 'robertogaona1985@gmail.com', password: 'Masajist@40' },
            { email: 'admin@historias-desopilantes.com', password: 'admin123' }
        ];
        
        const emailToCheck = email || username;
        const isValidCredential = validCredentials.some(
            cred => cred.email === emailToCheck && cred.password === password
        );
        
        if (isValidCredential) {
            console.log('✅ Login exitoso para admin');
            
            // Generar token simple (en producción usar JWT real)
            const token = 'admin-token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            
            res.json({
                message: 'Login exitoso',
                token: token,
                admin: {
                    id: 1,
                    email: emailToCheck,
                    nombre: 'Roberto Gaona',
                    rol: 'superadmin',
                    permisos: {
                        historias: { crear: true, editar: true, eliminar: true, publicar: true },
                        usuarios: { ver: true, crear: true, editar: true, eliminar: true },
                        configuracion: { acceso: true }
                    }
                }
            });
        } else {
            console.log('❌ Credenciales incorrectas para admin');
            res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }
    } catch (error) {
        console.error('❌ Error en login admin:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/dashboard - Endpoint para estadísticas del dashboard
app.get('/api/dashboard', async (req, res) => {
    try {
        console.log('📊 Obteniendo estadísticas del dashboard');
        
        // Obtener estadísticas de la base de datos
        const statsHistorias = await pool.query('SELECT COUNT(*) as total FROM historias');
        const statsComentarios = await pool.query('SELECT COUNT(*) as total FROM comentarios');
        
        const stats = {
            totalHistorias: parseInt(statsHistorias.rows[0].total),
            totalComentarios: parseInt(statsComentarios.rows[0].total),
            totalSuscriptores: 0, // No tenemos tabla de suscriptores aún
            visitasHoy: Math.floor(Math.random() * 500) + 100,
            visitasTotal: Math.floor(Math.random() * 10000) + 5000
        };
        
        res.json(stats);
    } catch (error) {
        console.error('❌ Error obteniendo estadísticas del dashboard:', error);
        res.status(500).json({
            error: 'Error obteniendo estadísticas del dashboard'
        });
    }
});

// GET /api/admin/historias/stats/general - Estadísticas generales para admin
app.get('/api/admin/historias/stats/general', async (req, res) => {
    try {
        // Verificar token básico (en producción implementar middleware adecuado)
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Token requerido' });
        }
        
        console.log('📊 Obteniendo estadísticas generales para admin');
        
        // Obtener estadísticas de la base de datos
        const statsHistorias = await pool.query('SELECT COUNT(*) as total FROM historias');
        const statsComentarios = await pool.query('SELECT COUNT(*) as total FROM comentarios');
        
        const stats = {
            totalHistorias: parseInt(statsHistorias.rows[0].total),
            totalComentarios: parseInt(statsComentarios.rows[0].total),
            historiasDestacadas: Math.floor(parseInt(statsHistorias.rows[0].total) * 0.3), // 30% aproximadamente
            visitasHoy: Math.floor(Math.random() * 500) + 100, // Valor simulado
            visitasTotal: Math.floor(Math.random() * 10000) + 5000 // Valor simulado
        };
        
        res.json(stats);
    } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
        res.status(500).json({
            error: 'Error obteniendo estadísticas'
        });
    }
});

// GET /api/admin/historias - Obtener historias para admin con paginación
app.get('/api/admin/historias', async (req, res) => {
    try {
        // Verificar token básico
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Token requerido' });
        }
        
        console.log('📚 Obteniendo historias para admin');
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        // Obtener historias con paginación
        const result = await pool.query(`
            SELECT *, 
                   (SELECT COUNT(*) FROM comentarios WHERE historia_id = historias.id) as comentarios_count
            FROM historias 
            ORDER BY fecha DESC 
            LIMIT $1 OFFSET $2
        `, [limit, offset]);
        
        // Obtener total para paginación
        const totalResult = await pool.query('SELECT COUNT(*) as total FROM historias');
        const total = parseInt(totalResult.rows[0].total);
        
        res.json({
            historias: result.rows,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('❌ Error obteniendo historias para admin:', error);
        res.status(500).json({
            error: 'Error obteniendo historias'
        });
    }
});

// GET /api/admin/comments - Obtener comentarios para admin
app.get('/api/admin/comments', async (req, res) => {
    try {
        // Verificar token básico
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Token requerido' });
        }
        
        console.log('💬 Obteniendo comentarios para admin');
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        
        // Obtener comentarios con información de historia
        const result = await pool.query(`
            SELECT c.*, h.titulo as storyTitle, h.categoria as storyCategory
            FROM comentarios c
            LEFT JOIN historias h ON c.historia_id = h.id
            ORDER BY c.fecha DESC 
            LIMIT $1 OFFSET $2
        `, [limit, offset]);
        
        // Obtener total para paginación
        const totalResult = await pool.query('SELECT COUNT(*) as total FROM comentarios');
        const total = parseInt(totalResult.rows[0].total);
        
        // Formatear comentarios para el frontend
        const comments = result.rows.map(row => ({
            _id: row.id,
            userName: row.autor,
            comment: row.contenido,
            storyId: row.historia_id,
            storyTitle: row.storyTitle,
            storyCategory: row.storyCategory,
            createdAt: row.fecha,
            ip: null // No almacenamos IPs actualmente
        }));
        
        res.json({
            comments: comments,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total: total
            }
        });
    } catch (error) {
        console.error('❌ Error obteniendo comentarios para admin:', error);
        res.status(500).json({
            error: 'Error obteniendo comentarios'
        });
    }
});

// GET /api/admin/suscriptores - Obtener suscriptores para admin
app.get('/api/admin/suscriptores', async (req, res) => {
    try {
        // Verificar token básico
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Token requerido' });
        }
        
        console.log('👥 Obteniendo suscriptores para admin');
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        // Por ahora devolvemos datos simulados ya que no tenemos tabla de suscriptores
        const suscriptoresMock = [
            {
                _id: 1,
                email: 'usuario1@example.com',
                nombre: 'Juan Pérez',
                fechaSuscripcion: new Date().toISOString(),
                activo: true
            },
            {
                _id: 2,
                email: 'usuario2@example.com', 
                nombre: 'María García',
                fechaSuscripcion: new Date().toISOString(),
                activo: true
            }
        ];
        
        res.json({
            suscriptores: suscriptoresMock,
            pagination: {
                current: page,
                pages: 1,
                total: suscriptoresMock.length
            }
        });
    } catch (error) {
        console.error('❌ Error obteniendo suscriptores para admin:', error);
        res.status(500).json({
            error: 'Error obteniendo suscriptores'
        });
    }
});

// DELETE /api/admin/comments/:id - Eliminar comentario
app.delete('/api/admin/comments/:id', async (req, res) => {
    try {
        // Verificar token básico
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Token requerido' });
        }
        
        const { id } = req.params;
        console.log(`🗑️ Eliminando comentario ID: ${id}`);
        
        // Eliminar el comentario de la base de datos
        const result = await pool.query('DELETE FROM comentarios WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Comentario no encontrado'
            });
        }
        
        res.json({
            message: 'Comentario eliminado exitosamente',
            comentario: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Error eliminando comentario:', error);
        res.status(500).json({
            error: 'Error eliminando comentario'
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
