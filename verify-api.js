const axios = require('axios');

async function checkEndpoint(method, url) {
  try {
    console.log(Verificando  ...);
    const response = await axios({
      method,
      url,
      timeout: 5000
    });
    console.log(✅  : );
    return true;
  } catch (error) {
    const status = error.response?.status || 'Sin respuesta';
    console.log(❌  :  - );
    return false;
  }
}

async function main() {
  const baseUrl = 'http://localhost:4000';
  console.log('Verificando endpoints en', baseUrl);

  await checkEndpoint('GET', ${baseUrl}/api/test);
  await checkEndpoint('GET', ${baseUrl}/api/stories/1/likes);
  await checkEndpoint('GET', ${baseUrl}/api/stories/1/comments);
}

main().catch(error => console.error('Error general:', error));
