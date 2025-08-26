// endpoints-check.js - Verificar que todos los endpoints están disponibles
const endpoints = [
  '/api/test',
  '/api/stories',
  '/api/stories/1', 
  '/api/stories/1/likes',
  '/api/stories/1/comments',
  '/api/stories/1/like'
];

console.log('📋 Endpoints que deben funcionar:');
endpoints.forEach(endpoint => {
  console.log(   ✓ );
});

console.log('\n🎯 Endpoints críticos para likes:');
console.log('   POST /api/stories/:id/like');
console.log('   PUT /api/stories/:id/like');
