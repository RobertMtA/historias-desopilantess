// Simulador de backend para desarrollo
let isLoggedIn = false;
let currentAdmin = null;

// Función para simular delay de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simulador de login
export const simulateLogin = async (email, password) => {
  console.log('🔐 Simulando login:', { email, password });
  
  // Simular delay de red
  await delay(800);
  
  if (email === 'robertogaona1985@gmail.com' && password === 'admin123') {
    isLoggedIn = true;
    currentAdmin = {
      id: '1',
      email: 'robertogaona1985@gmail.com',
      nombre: 'Roberto Gaona',
      rol: 'superadmin'
    };
    
    const token = 'fake-jwt-token-' + Date.now();
    
    // Guardar en localStorage
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(currentAdmin));
    
    return {
      message: 'Login exitoso',
      token,
      admin: currentAdmin
    };
  } else {
    throw new Error('Credenciales inválidas');
  }
};

// Simulador de verificación de token
export const verifyToken = async () => {
  await delay(200);
  
  const token = localStorage.getItem('admin_token');
  const user = localStorage.getItem('admin_user');
  
  if (token && user) {
    return {
      valid: true,
      admin: JSON.parse(user)
    };
  }
  
  return { valid: false };
};

// Simulador de logout
export const logout = () => {
  isLoggedIn = false;
  currentAdmin = null;
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
};

export default {
  simulateLogin,
  verifyToken,
  logout
};
