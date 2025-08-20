const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const createInitialAdmin = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    // Verificar si ya existe un admin
    const existingAdmin = await Admin.findOne({ rol: 'superadmin' });
    
    if (existingAdmin) {
      console.log('❌ Ya existe un superadministrador');
      console.log(`Email: ${existingAdmin.email}`);
      console.log('Si olvidaste la contraseña, elimina este usuario desde la base de datos y ejecuta este script nuevamente');
      process.exit(1);
    }

    // Crear superadministrador inicial
    const adminData = {
      username: 'robertogaona',
      email: 'robertogaona1985@gmail.com',
      password: 'admin123456', // Cambiar inmediatamente después del primer login
      nombre: 'Roberto Gaona',
      rol: 'superadmin',
      permisos: {
        historias: { crear: true, editar: true, eliminar: true, publicar: true },
        usuarios: { ver: true, crear: true, editar: true, eliminar: true },
        configuracion: { acceso: true }
      }
    };

    const newAdmin = new Admin(adminData);
    await newAdmin.save();

    console.log('🎉 ¡Superadministrador creado exitosamente!');
    console.log('');
    console.log('📋 Credenciales de acceso:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Contraseña: ${adminData.password}`);
    console.log('');
    console.log('🔒 IMPORTANTE:');
    console.log('   - Cambia la contraseña inmediatamente después del primer login');
    console.log('   - Accede al panel en: /admin/login');
    console.log('   - Este usuario tiene todos los permisos del sistema');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando administrador inicial:', error.message);
    process.exit(1);
  }
};

// Ejecutar función
createInitialAdmin();
