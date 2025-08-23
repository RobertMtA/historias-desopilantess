const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Middleware de autenticación
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'historias-desopilantes-secret-key');
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin || !admin.activo) {
      return res.status(401).json({ error: 'Token inválido o usuario inactivo' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Registro de nuevo administrador (solo superadmin)
router.post('/register', auth, async (req, res) => {
  try {
    // Verificar que el usuario actual es superadmin
    if (req.admin.rol !== 'superadmin') {
      return res.status(403).json({ error: 'Solo superadministradores pueden crear usuarios' });
    }

    const { username, email, password, nombre, rol } = req.body;

    // Validaciones básicas
    if (!username || !email || !password || !nombre) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si ya existe un usuario con ese email o username
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { username }]
    });

    if (existingAdmin) {
      return res.status(400).json({ error: 'El email o nombre de usuario ya están en uso' });
    }

    // Configurar permisos según el rol
    let permisos = {
      historias: { crear: true, editar: true, eliminar: false, publicar: false },
      usuarios: { ver: false, crear: false, editar: false, eliminar: false },
      configuracion: { acceso: false }
    };

    if (rol === 'admin') {
      permisos.historias.eliminar = true;
      permisos.historias.publicar = true;
      permisos.usuarios.ver = true;
    } else if (rol === 'superadmin') {
      permisos = {
        historias: { crear: true, editar: true, eliminar: true, publicar: true },
        usuarios: { ver: true, crear: true, editar: true, eliminar: true },
        configuracion: { acceso: true }
      };
    }

    const nuevoAdmin = new Admin({
      username,
      email,
      password,
      nombre,
      rol: rol || 'editor',
      permisos
    });

    await nuevoAdmin.save();

    res.status(201).json({
      message: 'Administrador creado exitosamente',
      admin: {
        id: nuevoAdmin._id,
        username: nuevoAdmin.username,
        email: nuevoAdmin.email,
        nombre: nuevoAdmin.nombre,
        rol: nuevoAdmin.rol,
        fechaCreacion: nuevoAdmin.fechaCreacion
      }
    });
  } catch (error) {
    console.error('Error al registrar admin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar admin por email
    const admin = await Admin.findOne({ email, activo: true });
    
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Actualizar último login
    await admin.updateLastLogin();

    // Generar JWT
    const token = jwt.sign(
      { id: admin._id, email: admin.email, rol: admin.rol },
      process.env.JWT_SECRET || 'historias-desopilantes-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        nombre: admin.nombre,
        rol: admin.rol,
        permisos: admin.permisos,
        avatar: admin.avatar,
        ultimoLogin: admin.ultimoLogin
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar token y obtener información del usuario
router.get('/me', auth, async (req, res) => {
  res.json({
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      email: req.admin.email,
      nombre: req.admin.nombre,
      rol: req.admin.rol,
      permisos: req.admin.permisos,
      avatar: req.admin.avatar,
      ultimoLogin: req.admin.ultimoLogin
    }
  });
});

// Cambiar contraseña
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar contraseña actual
    const admin = await Admin.findById(req.admin._id);
    if (!(await admin.comparePassword(currentPassword))) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Actualizar contraseña
    admin.password = newPassword;
    await admin.save();

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Listar administradores (solo admin y superadmin)
router.get('/users', auth, async (req, res) => {
  try {
    if (!req.admin.permisos.usuarios.ver) {
      return res.status(403).json({ error: 'No tienes permisos para ver usuarios' });
    }

    const admins = await Admin.find({})
      .select('-password')
      .sort({ fechaCreacion: -1 });

    res.json(admins);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar usuario (solo superadmin)
router.put('/users/:id', auth, async (req, res) => {
  try {
    if (!req.admin.permisos.usuarios.editar) {
      return res.status(403).json({ error: 'No tienes permisos para editar usuarios' });
    }

    const { nombre, rol, activo, permisos } = req.body;
    
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (nombre) admin.nombre = nombre;
    if (rol && req.admin.rol === 'superadmin') admin.rol = rol;
    if (activo !== undefined) admin.activo = activo;
    if (permisos && req.admin.rol === 'superadmin') admin.permisos = { ...admin.permisos, ...permisos };

    await admin.save();

    res.json({
      message: 'Usuario actualizado exitosamente',
      admin: await Admin.findById(admin._id).select('-password')
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar usuario (solo superadmin)
router.delete('/users/:id', auth, async (req, res) => {
  try {
    if (!req.admin.permisos.usuarios.eliminar) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar usuarios' });
    }

    if (req.params.id === req.admin._id.toString()) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }

    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = { router, auth };
