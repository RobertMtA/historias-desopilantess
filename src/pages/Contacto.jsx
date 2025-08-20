import { useState } from 'react';
import { buildApiUrl } from '../config/api';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaUser, FaTag, FaComments, FaCheck, FaExclamationTriangle, FaClock, FaGlobe } from 'react-icons/fa';
import historias from '../data/historias';
import './Contacto.css';

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: '',
    tipoConsulta: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }
    
    if (!formData.asunto.trim()) {
      newErrors.asunto = 'El asunto es obligatorio';
    } else if (formData.asunto.length < 5) {
      newErrors.asunto = 'El asunto debe tener al menos 5 caracteres';
    }
    
    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es obligatorio';
    } else if (formData.mensaje.length < 10) {
      newErrors.mensaje = 'El mensaje debe tener al menos 10 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Función para despertar el servidor (Railway lo suspende por inactividad)
  const wakeUpServer = async () => {
    try {
      console.log('☕ Despertando servidor...');
      const response = await fetch(buildApiUrl('/api/test'), {
        method: 'GET',
        signal: AbortSignal.timeout(10000) // 10 segundos timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Servidor despierto:', data.message);
        return true;
      }
    } catch (error) {
      console.log('⚠️ No se pudo despertar el servidor:', error.message);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    console.log('🚀 Iniciando envío de formulario de contacto...');
    console.log('📋 Datos del formulario:', formData);
    
    // Intentar despertar el servidor primero
    await wakeUpServer();
    
    // Crear AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Aumentado a 30 segundos
    
    try {
      const apiUrl = buildApiUrl('/api/contact');
      console.log('🔗 URL de la API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('📡 Respuesta recibida - Status:', response.status);
      
      if (!response.ok) {
        console.error('❌ Error HTTP:', response.status, response.statusText);
      }
      
      const data = await response.json();
      console.log('📦 Datos de respuesta:', data);
      
      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ nombre: '', email: '', asunto: '', mensaje: '', tipoConsulta: 'general' });
        setErrors({});
        console.log('✅ Mensaje enviado exitosamente');
        
        // Limpiar el mensaje después de 5 segundos
        setTimeout(() => setSubmitStatus(null), 5000);
      } else {
        setSubmitStatus('error');
        console.error('❌ Error del servidor:', data.error);
        
        // Limpiar el mensaje después de 5 segundos
        setTimeout(() => setSubmitStatus(null), 5000);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('⏱️ Timeout: El servidor tardó demasiado en responder');
        setSubmitStatus('timeout');
      } else {
        console.error('🔌 Error de conexión:', error);
        setSubmitStatus('error');
      }
      
      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setIsSubmitting(false);
      console.log('🏁 Finalizando envío de formulario');
    }
  };

  return (
    <div className="contacto-page">
      {/* Hero Section Mejorado */}
      <section className="hero-contact-improved">
        <div className="hero-overlay"></div>
        <div className="hero-content-improved">
          <div className="hero-icon-large">
            <FaComments />
          </div>
          <h1>¡Cuéntanos tu historia!</h1>
          <p>
            ¿Tienes una historia desopilante que compartir? ¿Alguna pregunta o sugerencia? 
            <br />
            Nos encantaría escucharte y dar vida a tus relatos más increíbles.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{historias.length}</span>
              <span className="stat-label">Historias publicadas</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24h</span>
              <span className="stat-label">Tiempo de respuesta</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Content Mejorado */}
      <section className="contact-content-improved">
        <div className="container-improved">
          <div className="contact-layout">
            
            {/* Formulario Mejorado */}
            <div className="form-section">
              <div className="form-header">
                <h2>Envíanos tu mensaje</h2>
                <p>Completa el formulario y te responderemos lo antes posible</p>
              </div>
              
              {submitStatus === 'success' && (
                <div className="success-message-improved">
                  <div className="success-icon">
                    <FaCheck />
                  </div>
                  <div className="success-content">
                    <h3>¡Mensaje enviado con éxito!</h3>
                    <p>Te responderemos en un máximo de 24 horas. ¡Gracias por contactarnos!</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="error-message-improved">
                  <div className="error-icon">
                    <FaExclamationTriangle />
                  </div>
                  <div className="error-content">
                    <h3>Error al enviar mensaje</h3>
                    <p>Hubo un problema al enviar tu mensaje. Por favor, inténtalo de nuevo o contáctanos directamente.</p>
                  </div>
                </div>
              )}

              {submitStatus === 'timeout' && (
                <div className="error-message-improved">
                  <div className="error-icon">
                    <FaClock />
                  </div>
                  <div className="error-content">
                    <h3>Tiempo de espera agotado</h3>
                    <p>El servidor está tardando mucho en responder. Por favor, inténtalo de nuevo en unos minutos o contáctanos directamente.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form-improved">
                {/* Selector de tipo de consulta */}
                <div className="form-group-improved full-width">
                  <label>Tipo de consulta</label>
                  <div className="radio-group">
                    <label className="radio-option" htmlFor="tipo-historia">
                      <input
                        type="radio"
                        id="tipo-historia"
                        name="tipoConsulta"
                        value="historia"
                        checked={formData.tipoConsulta === 'historia'}
                        onChange={handleChange}
                      />
                      <span className="radio-custom"></span>
                      <span>📖 Compartir historia</span>
                    </label>
                    <label className="radio-option" htmlFor="tipo-pregunta">
                      <input
                        type="radio"
                        id="tipo-pregunta"
                        name="tipoConsulta"
                        value="pregunta"
                        checked={formData.tipoConsulta === 'pregunta'}
                        onChange={handleChange}
                      />
                      <span className="radio-custom"></span>
                      <span>❓ Pregunta</span>
                    </label>
                    <label className="radio-option" htmlFor="tipo-sugerencia">
                      <input
                        type="radio"
                        id="tipo-sugerencia"
                        name="tipoConsulta"
                        value="sugerencia"
                        checked={formData.tipoConsulta === 'sugerencia'}
                        onChange={handleChange}
                      />
                      <span className="radio-custom"></span>
                      <span>💡 Sugerencia</span>
                    </label>
                    <label className="radio-option" htmlFor="tipo-general">
                      <input
                        type="radio"
                        id="tipo-general"
                        name="tipoConsulta"
                        value="general"
                        checked={formData.tipoConsulta === 'general'}
                        onChange={handleChange}
                      />
                      <span className="radio-custom"></span>
                      <span>💬 General</span>
                    </label>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group-improved">
                    <label htmlFor="nombre">
                      <FaUser className="label-icon" />
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className={errors.nombre ? 'error' : ''}
                      placeholder="Ej: María García"
                      autoComplete="name"
                    />
                    {errors.nombre && (
                      <div className="error-message">
                        <FaExclamationTriangle />
                        {errors.nombre}
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group-improved">
                    <label htmlFor="email">
                      <FaEnvelope className="label-icon" />
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? 'error' : ''}
                      placeholder="tu@email.com"
                      autoComplete="email"
                    />
                    {errors.email && (
                      <div className="error-message">
                        <FaExclamationTriangle />
                        {errors.email}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="form-group-improved full-width">
                  <label htmlFor="asunto">
                    <FaTag className="label-icon" />
                    Asunto *
                  </label>
                  <input
                    type="text"
                    id="asunto"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                    className={errors.asunto ? 'error' : ''}
                    placeholder="¿De qué quieres hablarnos?"
                    autoComplete="off"
                  />
                  {errors.asunto && (
                    <div className="error-message">
                      <FaExclamationTriangle />
                      {errors.asunto}
                    </div>
                  )}
                </div>
                
                <div className="form-group-improved full-width">
                  <label htmlFor="mensaje">
                    <FaComments className="label-icon" />
                    Tu mensaje *
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    className={errors.mensaje ? 'error' : ''}
                    rows="6"
                    placeholder="Cuéntanos tu historia o comparte tu mensaje con nosotros. ¡Nos encanta leer relatos increíbles!"
                    autoComplete="off"
                  />
                  <div className="character-count">
                    {formData.mensaje.length}/1000 caracteres
                  </div>
                  {errors.mensaje && (
                    <div className="error-message">
                      <FaExclamationTriangle />
                      {errors.mensaje}
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`submit-button-improved ${isSubmitting ? 'loading' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      Enviando tu mensaje...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Enviar mensaje
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contacto;
