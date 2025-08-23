const express = require('express');
const app = express();

// Middleware básico
app.use(express.json());

// Ruta de prueba simple
app.get('/test', (req, res) => {
  res.json({ message: 'Servidor de prueba funcionando', timestamp: new Date() });
});

// Puerto
const PORT = 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de prueba ejecutándose en puerto ${PORT}`);
  console.log(`🔗 Test URL: http://localhost:${PORT}/test`);
});
