const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const updateAdmin = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    // Eliminar el admin anterior
    const oldAdmin = await Admin.findOneAndDelete({ 
      email: 'admin@historias-desopilantes.com' 
    });
    
    if (oldAdmin) {
      console.log('🗑️ Administrador anterior eliminado');
    }

    // Verificar si ya existe el nuevo admin
    const existingAdmin = await Admin.findOne({ 
      email: 'robertogaona1985@gmail.com' 
    });
    
    if (existingAdmin) {
      console.log('❌ El administrador ya existe con el email robertogaona1985@gmail.com');
      console.log('Si olvidaste la contraseña, elimina este usuario desde la base de datos y ejecuta este script nuevamente');
      process.exit(1);
    }

    // Crear nuevo superadministrador
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

    console.log('🎉 ¡Superadministrador actualizado exitosamente!');
    console.log('');
    console.log('📋 Nuevas credenciales de acceso:');
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
    console.error('❌ Error actualizando administrador:', error.message);
    process.exit(1);
  }
};

// Ejecutar función
updateAdmin();
