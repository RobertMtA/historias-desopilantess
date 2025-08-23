import { useState } from 'react';
import { 
  FaHeart, 
  FaPaperPlane,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaLaugh,
  FaStar
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import './Footer.css';

const Footer = () => {
  // Estados para newsletter del footer
  const [footerEmail, setFooterEmail] = useState('');
  const [footerLoading, setFooterLoading] = useState(false);
  const [footerMessage, setFooterMessage] = useState('');
  const [footerStatus, setFooterStatus] = useState('');

  // Función para manejar suscripción newsletter del footer
  const handleFooterNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!footerEmail.trim()) {
      setFooterMessage('Por favor ingresa tu email');
      setFooterStatus('error');
      return;
    }
    
    setFooterLoading(true);
    setFooterMessage('');
    setFooterStatus('');
    
    try {
      const response = await fetch('http://localhost:3009/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: footerEmail,
          source: 'footer'
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setFooterMessage(data.message);
        setFooterStatus('success');
        setFooterEmail('');
      } else {
        setFooterMessage(data.error || 'Error al suscribirse');
        setFooterStatus('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setFooterMessage('Error de conexión. Inténtalo de nuevo.');
      setFooterStatus('error');
    } finally {
      setFooterLoading(false);
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        setFooterMessage('');
        setFooterStatus('');
      }, 5000);
    }
  };

  return (
    <footer className="footer-improved">
      {/* Decorative Background */}
      <div className="footer-background">
        <div className="footer-wave"></div>
        <div className="footer-particles">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
        </div>
      </div>

      <div className="footer-container">
        {/* Header del Footer Mejorado */}
        <div className="footer-header-improved">
          <div className="footer-brand-improved">
            <div className="brand-icon-wrapper">
              <FaLaugh className="brand-icon-main" />
              <div className="brand-glow"></div>
            </div>
            <div className="brand-text">
              <h2 className="brand-title-improved">Historias Desopilantes</h2>
              <p className="brand-tagline">✨ Compartiendo sonrisas desde 2025 ✨</p>
            </div>
          </div>
          <div className="footer-divider"></div>
        </div>

        {/* Contenido Principal Mejorado */}
        <div className="footer-content-improved">
          
          {/* Columna 1: Información de la Marca */}
          <div className="footer-column brand-info">
            <h3 className="column-title">
              <span className="title-icon">🎭</span>
              Sobre Nosotros
            </h3>
            <p className="brand-description">
              Descubre las historias más increíbles, divertidas y sorprendentes que desafían la lógica. 
              Desde anécdotas bizarras hasta eventos históricos fascinantes que te harán sonreír.
            </p>
            <div className="social-links">
              <a href="#" className="social-link facebook" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social-link twitter" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-link instagram" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="social-link youtube" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div className="footer-column quick-links">
            <h3 className="column-title">
              <span className="title-icon">🔗</span>
              Enlaces Rápidos
            </h3>
            <div className="links-grid">
              <div className="link-group">
                <h4 className="link-group-title">Explorar</h4>
                <ul className="footer-links">
                  <li><a href="/">Inicio</a></li>
                  <li><a href="/historias">Todas las Historias</a></li>
                  <li><a href="/categorias">Categorías</a></li>
                  <li><a href="/galeria">Galería</a></li>
                </ul>
              </div>
              <div className="link-group">
                <h4 className="link-group-title">Información</h4>
                <ul className="footer-links">
                  <li><a href="/sobre-nosotros">Sobre Nosotros</a></li>
                  <li><a href="/contacto">Contacto</a></li>
                
                </ul>
              </div>
            </div>
          </div>

          {/* Columna 4: Newsletter Mejorado */}
          <div className="footer-column newsletter-improved">
            <h3 className="column-title">
              <span className="title-icon">📬</span>
              ¡No te pierdas ni una risa!
            </h3>
            <p className="newsletter-description-improved">
              Suscríbete y recibe las historias más desopilantes directamente en tu bandeja. 
              <strong> ¡Sin spam, solo diversión garantizada!</strong>
            </p>
            
            {footerMessage && (
              <div className={`footer-newsletter-message ${footerStatus}`}>
                {footerMessage}
              </div>
            )}
            
            <form className="newsletter-form-improved" onSubmit={handleFooterNewsletterSubmit}>
              <div className="newsletter-input-wrapper">
                <label htmlFor="footer-newsletter-email" className="visually-hidden">
                  Email para newsletter
                </label>
                <input 
                  type="email" 
                  id="footer-newsletter-email"
                  name="email"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  placeholder="tu@email.com" 
                  className="newsletter-input-improved"
                  autoComplete="email"
                  required
                  disabled={footerLoading}
                />
                <button 
                  type="submit" 
                  className="newsletter-button-improved"
                  disabled={footerLoading}
                >
                  {footerLoading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Suscribirse
                    </>
                  )}
                </button>
              </div>
              
              <div className="newsletter-benefits-improved">
                <div className="benefit-item">
                  <span className="benefit-icon">✅</span>
                  <span>Historias exclusivas</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✅</span>
                  <span>Sin spam</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✅</span>
                  <span>Acceso anticipado</span>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Bottom Mejorado */}
        <div className="footer-bottom-improved">
          <div className="footer-bottom-content">
            <div className="copyright-improved">
              <FaHeart className="heart-icon" />
              <p>© 2025 Historias Desopilantes. |Desarrollador Roberto Gaona.</p>
            </div>
            <div className="footer-meta">
              <div className="footer-stats">
             
              
                <span className="stat-item">
                  <strong>2025</strong> Fundado
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
