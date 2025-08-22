import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../../config/api';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSignInAlt } from 'react-icons/fa';
import './AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Intentando conectar al backend...');
      
      // Autenticación temporal mientras se soluciona Railway
      const TEMP_ADMIN_EMAIL = 'admin@historias.com';
      const TEMP_ADMIN_PASSWORD = 'Masajist@40';
      
      if (formData.email === TEMP_ADMIN_EMAIL && formData.password === TEMP_ADMIN_PASSWORD) {
        console.log('✅ Autenticación temporal exitosa');
        
        // Simular respuesta del backend
        const mockResponse = {
          token: 'temp-admin-token-' + Date.now(),
          admin: {
            email: formData.email,
            role: 'admin'
          }
        };
        
        // Guardar token y datos del admin
        localStorage.setItem('admin_token', mockResponse.token);
        localStorage.setItem('admin_user', JSON.stringify(mockResponse.admin));
        
        console.log('🎉 Redirigiendo al dashboard...');
        navigate('/admin/dashboard');
        return;
      }
      
      // Si no son las credenciales temporales, intentar con el backend
      try {
        const response = await fetch(buildApiUrl('/api/admin/auth/login'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: formData.email.split('@')[0], // Convertir email a username
            password: formData.password
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          console.log('✅ Backend respondió exitosamente');
          // Guardar token y datos del admin
          localStorage.setItem('admin_token', data.token);
          localStorage.setItem('admin_user', JSON.stringify(data.user));
          
          console.log('🎉 Redirigiendo al dashboard...');
          navigate('/admin/dashboard');
        } else {
          console.error('❌ Error del backend:', data.message);
          setError('Credenciales inválidas');
        }
      } catch (backendError) {
        console.log('⚠️ Backend no disponible, usando autenticación temporal');
        setError('Credenciales inválidas. Use: admin@historias.com / Masajist@40');
      }
      
    } catch (error) {
      console.error('💥 Error en login:', error);
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-security-badge">🔒 ACCESO RESTRINGIDO</div>
            <h1>Panel de Administración</h1>
            <h2>HISTORIAS DESOPILANTES</h2>
            <div className="admin-warning-text">
              <p>Esta área está protegida. Se requiere código de acceso autorizado.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
            {error && (
              <div className="admin-error-message">
                {error}
              </div>
            )}

            <div className="admin-form-group">
              <label htmlFor="email">
                <FaUser className="label-icon" />
                Código de Acceso
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ingresa el código de acceso autorizado"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="password">
                <FaLock className="label-icon" />
                Contraseña
              </label>
              <div className="admin-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Tu contraseña"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="admin-spinner"></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <FaSignInAlt />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <div className="admin-login-footer">
            <div className="admin-help-text">
              <p>Si necesitas acceso, contacta con un administrador autorizado</p>
            </div>
            <p className="admin-copyright">© 2025 Historias Desopilantes. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
