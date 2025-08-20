import { Link } from 'react-router-dom';
import { 
  FaLaughBeam, 
  FaGlobeAmericas, 
  FaHistory, 
  FaBookOpen,
  FaHeart,
  FaMagic,
  FaStar,
  FaRocket,
  FaPaperPlane,
  FaQuoteLeft
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import historias from '../data/historias';
import './About.css';

const About = () => {
  const stats = [
    { value: historias.length.toString(), label: "Historias publicadas", icon: <FaBookOpen />, color: "#3b82f6" },
    { value: "120+", label: "Países cubiertos", icon: <FaGlobeAmericas />, color: "#10b981" },
    { value: "2025", label: "Desde el año", icon: <FaHistory />, color: "#f59e0b" }
  ];

  const values = [
    {
      icon: <FaHeart />,
      title: "Pasión por la Historia",
      description: "Creemos que cada momento histórico tiene algo fascinante que contar."
    },
    {
      icon: <FaMagic />,
      title: "Humor Inteligente",
      description: "Encontramos la magia en los momentos más absurdos de la humanidad."
    },
    {
      icon: <FaStar />,
      title: "Calidad Excepcional",
      description: "Cada historia es investigada y verificada para garantizar su autenticidad."
    }
  ];

  return (
    <div className="about-page" style={{ minHeight: '100vh' }}>
      {/* Hero Section Mejorado */}
      <section className="about-hero" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="hero-decoration">
          <div className="floating-elements">
            <HiOutlineSparkles className="sparkle sparkle-1" />
            <HiOutlineSparkles className="sparkle sparkle-2" />
            <HiOutlineSparkles className="sparkle sparkle-3" />
            <FaStar className="star star-1" />
            <FaStar className="star star-2" />
          </div>
        </div>
        <div className="about-hero-content">
          <div className="hero-badge">
            <FaRocket className="badge-icon" />
            <span>Desde 2025 compartiendo risas</span>
          </div>
          <h1>
            <span className="highlight">Historias Desopilantes</span>
            <br />
            Donde la historia se vuelve divertida
          </h1>
          <p>
            Somos los arqueólogos de lo absurdo, los detectives de lo divertido, 
            y los narradores de esos momentos históricos que te harán reír a carcajadas.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary">
              <FaBookOpen />
              Nuestras Historias
            </button>
            <button className="btn-secondary">
              <FaPaperPlane />
              Contáctanos
            </button>
          </div>
        </div>
      </section>

      {/* Estadísticas Visuales */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stats-header">
            <h2>Nuestros Números Hablan</h2>
            <p>Estos son los datos que nos enorgullecen</p>
          </div>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card" style={{ '--accent-color': stat.color }}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-content">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
                <div className="stat-decoration"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nuestra Historia */}
      <section className="story-section">
        <div className="story-container">
          <div className="story-content">
            <div className="story-text">
              <div className="section-badge">
                <FaQuoteLeft />
                <span>Nuestra Historia</span>
              </div>
              <h2>Todo Comenzó con una Guerra Absurda</h2>
              <p className="lead-text">
                En 2025, nuestro fundador Carlos se topó con la historia de la <strong>Guerra del Fútbol</strong> 
                entre El Salvador y Honduras. Una guerra real, causada por un partido de fútbol. 
                ¿Cómo era posible que nadie supiera sobre este conflicto tan absurdo como trágico?
              </p>
              <p>
                Desde ese momento, nos dedicamos a rescatar esas joyas históricas que suelen quedar 
                fuera de los libros de texto tradicionales pero que dicen tanto sobre la naturaleza humana. 
                Creemos que la historia no tiene por qué ser aburrida.
              </p>
              <p>
                Cada anécdota que compartimos es una ventana a la humanidad de nuestros antepasados, 
                sus pasiones, errores y momentos de genialidad o locura total.
              </p>
            </div>
            <div className="story-visual">
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-year">2025</div>
                  <div className="timeline-content">Fundación del proyecto</div>
                </div>
                
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestros Valores */}
      <section className="values-section">
        <div className="values-container">
          <div className="values-header">
            <h2>Lo que nos Mueve</h2>
            <p>Los principios que guían cada historia que compartimos</p>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Mejorado */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <div className="cta-icon">
              <FaLaughBeam />
            </div>
            <h2>¿Tienes una Historia Desopilante?</h2>
            <p>
              Nos encantaría conocer esa anécdota absurda que encontraste en tus investigaciones, 
              que escuchaste de tus abuelos, o que viviste en primera persona. 
              <strong> ¡Toda historia merece ser contada!</strong>
            </p>
            <div className="cta-buttons">
              <Link to="/contacto" className="cta-button primary" style={{display: 'inline-flex', alignItems: 'center', textDecoration: 'none', gap: '0.5rem'}}>
                <FaPaperPlane />
                Enviar tu Historia
              </Link>
              <button className="cta-button secondary">
                <FaHeart />
                Síguenos
              </button>
            </div>
          </div>
          <div className="cta-decoration">
            <div className="decoration-circle"></div>
            <div className="decoration-dots"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;