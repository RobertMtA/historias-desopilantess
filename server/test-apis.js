// Script simple para probar las APIs
async function testApis() {
  const baseUrl = 'http://localhost:3002/api/stories';
  
  try {
    console.log('🧪 Probando APIs...\n');
    
    // Probar historia 1
    const response1 = await fetch(`${baseUrl}/1/likes`);
    const data1 = await response1.json();
    console.log('📊 Historia 1 - Likes:', data1.count, 'User liked:', data1.userLiked);
    
    // Probar historia 3
    const response3 = await fetch(`${baseUrl}/3/likes`);
    const data3 = await response3.json();
    console.log('📊 Historia 3 - Likes:', data3.count, 'User liked:', data3.userLiked);
    
    // Probar comentarios
    const commentsResponse = await fetch(`${baseUrl}/1/comments`);
    const commentsData = await commentsResponse.json();
    console.log('💬 Historia 1 - Comentarios:', commentsData.length);
    
    console.log('\n✅ APIs funcionan correctamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testApis();
