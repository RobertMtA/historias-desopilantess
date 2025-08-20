import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaRegClock, FaFire, FaRegLaughSquint, FaGlobeAmericas, FaSkull, FaGhost, FaMask, FaUserSlash, FaCrown, FaFistRaised, FaLandmark, FaLeaf, FaLightbulb, FaStar } from 'react-icons/fa';
import { GiTreasureMap } from 'react-icons/gi';
import HistoriaCard from '../components/HistoriaCard';
import VideoEmbed from '../components/VideoEmbed';
import SEOComponent from '../components/SEOComponent';
import historias from '../data/historias';
import './Home.css';
import '../assets/css/terror-effects.css';

const Home = () => {
  const [historiasDestacadas, setHistoriasDestacadas] = useState([]);
  const [historiasRecientes, setHistoriasRecientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para newsletter
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  useEffect(() => {
    // Cargar categorías reales del sistema
    const fetchData = async () => {
      try {
        // Definir las categorías reales del sistema
        const realCategories = [
          { id: 'creepypasta', name: 'Creepypasta', icon: FaSkull, emoji: '💀' },
          { id: 'realeza', name: 'Realeza', icon: FaCrown, emoji: '�' },
          { id: 'conflictos', name: 'Conflictos', icon: FaFistRaised, emoji: '⚔️' },
          { id: 'militar', name: 'Militar', icon: FaLandmark, emoji: '🎖️' },
          { id: 'naturaleza', name: 'Naturaleza', icon: FaLeaf, emoji: '🌿' },
          { id: 'inventos', name: 'Inventos', icon: FaLightbulb, emoji: '💡' },
          { id: 'fenomenos-siniestros', name: 'Fenómenos Siniestros', icon: FaGhost, emoji: '👻' },
          { id: 'finales-oscuros', name: 'Finales Oscuros', icon: FaMask, emoji: '�' },
          { id: 'enfrenta-tus-miedos', name: 'Enfrenta tus Miedos', icon: FaUserSlash, emoji: '🩸' },
          { id: 'politica', name: 'Política', icon: FaLandmark, emoji: '🏛️' },
          { id: 'fenomenos', name: 'Fenómenos', icon: FaStar, emoji: '🌟' },
          { id: 'exploracion', name: 'Exploración', icon: GiTreasureMap, emoji: '🗺️' }
        ];

        // Contar historias reales por categoría - mapeando nombres exactos del archivo de datos
        const categoriasConCantidad = realCategories.map(cat => {
          let count = 0;
          const normalizedId = cat.id.toLowerCase();
          
          // Mapear IDs de categorías con los nombres exactos en el archivo de datos
          const categoryMap = {
            'creepypasta': 'Creepypasta',
            'realeza': 'Realeza', 
            'conflictos': 'Conflictos',
            'militar': 'Militar',
            'naturaleza': 'Naturaleza',
            'inventos': 'Inventos',
            'fenomenos-siniestros': 'Fenómenos Siniestros',
            'finales-oscuros': 'Finales Oscuros',
            'enfrenta-tus-miedos': 'Enfrenta tus Miedos',
            'politica': 'Política',
            'fenomenos': 'Fenómenos',
            'exploracion': 'Exploración'
          };
          
          const categoryName = categoryMap[normalizedId];
          if (categoryName) {
            count = historias.filter(h => h.categoria === categoryName).length;
          }
          
          return {
            ...cat,
            cantidad: count
          };
        }).filter(cat => cat.cantidad > 0) // Solo mostrar categorías con historias
         .sort((a, b) => b.cantidad - a.cantidad); // Ordenar por cantidad de historias (mayor a menor)

        // Usar las historias reales con las imágenes SVG generadas
        const data = {
          destacadas: [
            {
              id: 1,
              titulo: "El rey que declaró la guerra al mar",
              contenido: "En 1967, el excéntrico rey Canuto el Grande intentó detener las mareas del océano como demostración de poder supremo. Colocó su trono en la playa y ordenó a las olas que se detuvieran. Cuando las aguas siguieron avanzando, declaró oficialmente la guerra al mar, enviando soldados a atacar las olas con espadas y lanzas.",
              pais: "España",
              año: 1967,
              imagen: "/images/historia-1.svg",
              video: null,
              likes: 245,
              esDestacada: true,
              categoria: "Realeza"
            },
            {
              id: 2,
              titulo: "La batalla de los pasteles",
              contenido: "Una disputa culinaria entre panaderos franceses que escaló hasta involucrar a los gobiernos de Francia y México. Todo comenzó cuando un pastelero francés en México no recibió el pago por sus dulces. La situación se intensificó hasta convertirse en un conflicto diplomático internacional conocido como 'La Guerra de los Pasteles' en 1838.",
              pais: "Francia",
              año: 1838,
              imagen: "/images/historia-2.svg",
              video: null,
              likes: 189,
              esDestacada: true,
              categoria: "Conflictos"
            }
          ],
          recientes: [
            {
              id: 3,
              titulo: "El desfile militar más corto",
              contenido: "En 1913, el Reino Unido organizó un desfile militar que duró exactamente 38 minutos y terminó en completo caos. Los soldados se confundieron con las órdenes, marcharon en direcciones opuestas y algunos terminaron marchando directamente hacia un estanque. El evento se convirtió en una leyenda de incompetencia militar.",
              pais: "Reino Unido",
              año: 1913,
              imagen: "/images/historia-3.svg",
              video: null,
              likes: 132,
              esDestacada: false,
              categoria: "Militar"
            }
          ],
          categorias: categoriasConCantidad
        };

        setHistoriasDestacadas(data.destacadas);
        setHistoriasRecientes(data.recientes);
        setCategorias(data.categorias);
        setLoading(false);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para manejar suscripción newsletter
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!newsletterEmail.trim()) {
      setNewsletterMessage('Por favor ingresa tu email');
      setNewsletterStatus('error');
      return;
    }
    
    setNewsletterLoading(true);
    setNewsletterMessage('');
    setNewsletterStatus('');
    
    try {
      const response = await fetch('http://localhost:3009/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newsletterEmail,
          source: 'home'
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setNewsletterMessage(data.message);
        setNewsletterStatus('success');
        setNewsletterEmail('');
      } else {
        setNewsletterMessage(data.error || 'Error al suscribirse');
        setNewsletterStatus('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setNewsletterMessage('Error de conexión. Inténtalo de nuevo.');
      setNewsletterStatus('error');
    } finally {
      setNewsletterLoading(false);
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        setNewsletterMessage('');
        setNewsletterStatus('');
      }, 5000);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Cargando historias desopilantes...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <SEOComponent 
        title="Historias Desopilantes - Las Mejores Anécdotas y Relatos Divertidos"
        description="Descubre las historias más divertidas y absurdas de la historia. Desde reyes excéntricos hasta guerras ridículas, conoce los eventos más desopilantes que realmente ocurrieron."
        keywords={[
          "historias divertidas", "anécdotas históricas", "relatos absurdos", "humor", 
          "historias desopilantes", "momentos graciosos", "eventos históricos divertidos", 
          "curiosidades", "entretenimiento", "narrativa histórica"
        ]}
        url="https://historias-desopilantes.com/"
        image="https://historias-desopilantes.com/og-home-image.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Historias Desopilantes",
          "alternateName": "Historias Divertidas",
          "url": "https://historias-desopilantes.com",
          "description": "La mejor colección de historias divertidas, anécdotas increíbles y relatos que te harán reír.",
          "inLanguage": "es",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://historias-desopilantes.com/buscar?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        }}
      />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="blood-particles"></div>
        <div className="hero-content">
          <h1>Descubre las historias más absurdas y divertidas de la historia</h1>
          <p>Desde reyes excéntricos hasta guerras ridículas, conoce los eventos más desopilantes que realmente ocurrieron</p>
        </div>
      </section>

      {/* Historias Destacadas */}
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">
            <FaFire className="section-icon" />
            Historias Destacadas
          </h2>
          <a href="/historias" className="view-all cta-button">
            Ver todas <FaArrowRight />
          </a>
        </div>
        
        <div className="historias-grid">
          {historiasDestacadas.map(historia => (
            <HistoriaCard 
              key={historia.id}
              titulo={historia.titulo}
              contenido={historia.contenido}
              imagen={historia.imagen}
              video={historia.video}
              pais={historia.pais}
              año={historia.año}
              likes={historia.likes}
              categoria={historia.categoria}
            />
          ))}
        </div>
      </section>

      {/* Video Destacado */}
      <section className="featured-video">
        <h2>Video de la semana</h2>
        <VideoEmbed 
          url="https://www.youtube.com/watch?v=ejemplo" 
          title="La guerra más corta de la historia - 38 minutos de caos" 
        />
      </section>

      {/* Historias Recientes */}
      <section className="recent-section">
        <div className="section-header">
          <h2 className="section-title">
            <FaRegClock className="section-icon" />
            Recientemente añadidas
          </h2>
          <a href="/historias" className="view-all cta-button">
            Ver todas <FaArrowRight />
          </a>
        </div>
        
        <div className="historias-grid">
          {historiasRecientes.map(historia => (
            <HistoriaCard 
              key={historia.id}
              titulo={historia.titulo}
              contenido={historia.contenido}
              imagen={historia.imagen}
              video={historia.video}
              pais={historia.pais}
              año={historia.año}
              likes={historia.likes}
              categoria={historia.categoria}
            />
          ))}
        </div>
      </section>

      {/* Categorías */}
      <section className="categories-section">
        <div className="categories-header">
          <div className="categories-title-area">
            <h2 className="categories-title section-title">
              <FaGlobeAmericas className="section-icon" />
              Explora por categorías
            </h2>
            <p className="categories-subtitle">
              Descubre historias organizadas por temas que despiertan la curiosidad y el asombro
            </p>
            <Link to="/categorias" className="view-all-enhanced">
              Ver todas las categorías <FaArrowRight />
            </Link>
          </div>
        </div>
        
        <div className="categories-showcase">
          {/* Categorías en una línea horizontal */}
          <div className="horizontal-categories-container">
            <div 
              className="horizontal-categories-scroll"
              style={{
                display: 'flex',
                flexDirection: 'row',
                overflowX: 'auto',
                overflowY: 'hidden',
                gap: '1.5rem',
                padding: '1rem 0',
                width: '100%'
              }}
            >
              {categorias.map((categoria, index) => {
                const IconComponent = categoria.icon;
                return (
                  <Link 
                    to={`/historias?categoria=${categoria.id}`} 
                    className="horizontal-category-card"
                    key={index}
                    style={{
                      minWidth: '180px',
                      maxWidth: '180px',
                      flexShrink: 0,
                      flexGrow: 0
                    }}
                  >
                    <div className="horizontal-category-icon">
                      <span className="category-emoji">{categoria.emoji}</span>
                      <IconComponent className="category-icon-svg" />
                    </div>
                    <div className="horizontal-category-content">
                      <h3>{categoria.name}</h3>
                      <p>{categoria.cantidad} {categoria.cantidad === 1 ? 'historia' : 'historias'}</p>
                    </div>
                    <div className="horizontal-category-hover"></div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="newsletter-container">
          <div className="newsletter-decoration"></div>
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h2>🎭 No te pierdas ninguna historia absurda</h2>
              <p>Suscríbete a nuestro boletín y recibe las historias más desopilantes directamente en tu correo. ¡Historias que desafían la realidad y despiertan la curiosidad!</p>
            </div>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              {newsletterMessage && (
                <div className={`newsletter-message ${newsletterStatus}`}>
                  {newsletterMessage}
                </div>
              )}
              <div className="newsletter-input-group">
                <label htmlFor="newsletter-email" className="visually-hidden">
                  Correo electrónico para el boletín
                </label>
                <input 
                  type="email" 
                  id="newsletter-email"
                  name="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Tu correo electrónico" 
                  autoComplete="email"
                  required 
                  disabled={newsletterLoading}
                />
                <button 
                  type="submit"
                  disabled={newsletterLoading}
                >
                  {newsletterLoading ? 'Suscribiendo...' : 'Suscribirse'}
                  {!newsletterLoading && <FaRegLaughSquint />}
                </button>
              </div>
              <p className="newsletter-disclaimer">
                📧 Prometemos no spamearte. Solo las mejores historias, una vez por semana.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;