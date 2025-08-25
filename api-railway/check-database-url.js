/**
 * Script para verificar la configuración de DATABASE_URL en Railway
 * y diagnosticar problemas de conexión a PostgreSQL
 */

// Verificar que estamos en Railway
if (!process.env.RAILWAY_ENVIRONMENT) {
  console.warn('⚠️ Este script está diseñado para ejecutarse en Railway.');
  console.warn('   Si estás en desarrollo local, configura la variable RAILWAY_ENVIRONMENT=true');
  console.warn('   para simular el entorno de Railway.');
}

// Verificar DATABASE_URL
console.log('🔍 Verificando configuración PostgreSQL...');

if (!process.env.DATABASE_URL) {
  console.error('❌ Error crítico: Variable de entorno DATABASE_URL no está configurada');
  console.log('\n📋 Pasos para solucionar el problema:');
  console.log('1. Ve al dashboard de Railway -> Tu proyecto -> Variables');
  console.log('2. Verifica que DATABASE_URL existe y tiene un valor válido');
  console.log('3. Si tienes una base de datos PostgreSQL en Railway, la variable debería configurarse automáticamente');
  console.log('4. Si no, necesitas crear una base de datos PostgreSQL en tu proyecto Railway');
  console.log('\n🔄 Para añadir una base de datos PostgreSQL a tu proyecto:');
  console.log('1. Ve al dashboard de Railway -> Tu proyecto');
  console.log('2. Haz clic en "New" -> "Database" -> "PostgreSQL"');
  console.log('3. Espera a que se aprovisione la base de datos');
  console.log('4. Railway debería configurar automáticamente la variable DATABASE_URL');
} else {
  console.log('✅ Variable DATABASE_URL configurada');
  
  // No mostrar la URL completa por seguridad, solo un fragmento
  const urlMask = process.env.DATABASE_URL.substring(0, 25) + '...[OCULTO]';
  console.log(`📊 Configuración detectada: ${urlMask}`);
  
  // Verificar componentes de la URL
  try {
    // Extraer componentes de la URL para verificar formato
    const urlObj = new URL(process.env.DATABASE_URL);
    
    if (urlObj.protocol !== 'postgresql:') {
      console.warn('⚠️ El protocolo de la URL no es postgresql:');
    } else {
      console.log('✅ Protocolo correcto (postgresql:)');
    }
    
    if (!urlObj.hostname) {
      console.error('❌ Falta el hostname en DATABASE_URL');
    } else {
      console.log(`✅ Hostname configurado (${urlObj.hostname})`);
    }
    
    if (!urlObj.pathname || urlObj.pathname === '/') {
      console.error('❌ Falta el nombre de la base de datos en DATABASE_URL');
    } else {
      console.log(`✅ Nombre de base de datos configurado (${urlObj.pathname.replace('/', '')})`);
    }
    
    if (!urlObj.username) {
      console.warn('⚠️ No se detectó nombre de usuario en DATABASE_URL');
    } else {
      console.log('✅ Usuario configurado');
    }
    
    if (!urlObj.password) {
      console.warn('⚠️ No se detectó contraseña en DATABASE_URL');
    } else {
      console.log('✅ Contraseña configurada');
    }
  } catch (error) {
    console.error('❌ Error al analizar DATABASE_URL:', error.message);
    console.error('El formato debería ser: postgresql://usuario:contraseña@hostname:puerto/nombrebd');
  }
}

console.log('\n🔍 Resumen:');
console.log('- La aplicación puede seguir funcionando sin base de datos en modo simulado');
console.log('- Para habilitar todas las funcionalidades, asegúrate de configurar DATABASE_URL');
console.log('- El problema más común es que no se ha añadido una base de datos PostgreSQL al proyecto\n');
