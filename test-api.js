// test-api.js - Script para probar las funcionalidades del API

async function testAPI() {
    const API_BASE = 'http://localhost:3002/api';
    
    console.log('🧪 Iniciando pruebas del API...\n');
    
    try {
        // 1. Prueba del endpoint de test
        console.log('1. Probando endpoint de test...');
        const testResponse = await fetch(`${API_BASE}/test`);
        const testData = await testResponse.json();
        console.log('✅ Test:', testData.message);
        console.log('   Timestamp:', testData.timestamp);
        
        // 2. Prueba de suscripción newsletter
        console.log('\n2. Probando suscripción newsletter...');
        const subscriberData = {
            email: `test${Date.now()}@ejemplo.com`,
            name: 'Usuario de Prueba',
            source: 'test'
        };
        
        const subscribeResponse = await fetch(`${API_BASE}/subscribers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscriberData)
        });
        
        const subscribeResult = await subscribeResponse.json();
        if (subscribeResponse.ok) {
            console.log('✅ Suscripción exitosa:', subscribeResult.message);
            console.log('   Email:', subscribeResult.subscriber.email);
        } else {
            console.log('❌ Error en suscripción:', subscribeResult.error);
        }
        
        // 3. Prueba de mensaje de contacto
        console.log('\n3. Probando envío de mensaje de contacto...');
        const contactData = {
            nombre: 'Usuario de Prueba',
            email: `contacto${Date.now()}@ejemplo.com`,
            asunto: 'Mensaje de prueba',
            mensaje: 'Este es un mensaje de prueba para verificar que el sistema funciona correctamente.',
            tipoConsulta: 'pregunta'
        };
        
        const contactResponse = await fetch(`${API_BASE}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactData)
        });
        
        const contactResult = await contactResponse.json();
        if (contactResponse.ok) {
            console.log('✅ Mensaje enviado exitosamente:', contactResult.message);
            console.log('   ID:', contactResult.contact.id);
            console.log('   Tipo:', contactResult.contact.tipoConsulta);
        } else {
            console.log('❌ Error en envío:', contactResult.error);
        }
        
        // 4. Prueba de estadísticas
        console.log('\n4. Probando estadísticas...');
        const statsResponse = await fetch(`${API_BASE}/subscribers/stats`);
        const statsData = await statsResponse.json();
        if (statsResponse.ok) {
            console.log('✅ Estadísticas de suscriptores:');
            console.log('   Activos:', statsData.totalActive);
            console.log('   Inactivos:', statsData.totalInactive);
            console.log('   Hoy:', statsData.totalToday);
            console.log('   Por fuente:', statsData.bySource);
        } else {
            console.log('❌ Error obteniendo estadísticas');
        }
        
        const contactStatsResponse = await fetch(`${API_BASE}/contact/stats`);
        const contactStatsData = await contactStatsResponse.json();
        if (contactStatsResponse.ok) {
            console.log('\n✅ Estadísticas de mensajes:');
            console.log('   Total:', contactStatsData.totalMessages);
            console.log('   Nuevos:', contactStatsData.newMessages);
            console.log('   Respondidos:', contactStatsData.respondedMessages);
            console.log('   Hoy:', contactStatsData.today);
            console.log('   Por tipo:', contactStatsData.byType);
        }
        
        console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');
        
    } catch (error) {
        console.error('❌ Error durante las pruebas:', error.message);
    }
}

// Ejecutar pruebas
testAPI();
