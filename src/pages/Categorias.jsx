import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCrown, FaFistRaised, FaUtensils, FaGlobeAmericas, FaTheaterMasks, FaLandmark, FaLightbulb, FaLeaf, FaStar, FaEye, FaSkull, FaGhost, FaMask, FaUserSlash } from 'react-icons/fa';
import { GiTreasureMap, GiCastle, GiScrollQuill } from 'react-icons/gi';
import { motion } from 'framer-motion';
import historias from '../data/historias';
import './Categorias.css';

const Categorias = () => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [stats, setStats] = useState({ total: 0, categories: 0, countries: 0 });

  // Calcular estadísticas reales
  useEffect(() => {
    const totalHistorias = historias.length;
    const categoriesCount = new Set(historias.map(h => h.categoria).filter(Boolean)).size;
    const countriesCount = new Set(historias.map(h => h.pais)).size;
    
    setStats({
      total: totalHistorias,
      categories: categoriesCount,
      countries: countriesCount
    });
  }, []);

  // Definir las categorías con sus iconos y colores actualizados
  const categories = [
    {
      id: 'creepypasta',
      name: 'Creepypasta',
      icon: FaSkull,
      gradient: 'from-gray-800 via-purple-900 to-black',
      description: 'Historias misteriosas y leyendas urbanas perturbadoras',
      emoji: '💀'
    },
    {
      id: 'fenomenos-siniestros',
      name: 'Fenómenos Siniestros',
      icon: FaGhost,
      gradient: 'from-red-900 via-black to-purple-900',
      description: 'Eventos históricos perturbadores y misteriosos sin explicación',
      emoji: '👻'
    },
    {
      id: 'finales-oscuros',
      name: 'Finales Oscuros',
      icon: FaMask,
      gradient: 'from-orange-500 via-red-600 to-gray-900',
      description: 'El lado siniestro detrás de historias aparentemente felices',
      emoji: '🎭'
    },
    {
      id: 'enfrenta-tus-miedos',
      name: 'Enfrenta tus Miedos',
      icon: FaUserSlash,
      gradient: 'from-black via-red-800 to-red-950',
      description: 'Historias que pondrán a prueba tu valentía y cordura',
      emoji: '🩸',
      isBloodTheme: true
    },
    {
      id: 'realeza',
      name: 'Realeza',
      icon: FaCrown,
      gradient: 'from-purple-500 via-pink-500 to-red-500',
      description: 'Historias curiosas de reyes, reinas y la nobleza',
      emoji: '👑'
    },
    {
      id: 'conflictos',
      name: 'Conflictos',
      icon: FaFistRaised,
      gradient: 'from-red-500 via-orange-500 to-yellow-500',
      description: 'Batallas extrañas y guerras insólitas',
      emoji: '⚔️'
    },
    {
      id: 'militar',
      name: 'Militar',
      icon: FaLandmark,
      gradient: 'from-green-500 via-teal-500 to-blue-500',
      description: 'Anécdotas militares y estrategias inusuales',
      emoji: '🪖'
    },
    {
      id: 'naturaleza',
      name: 'Naturaleza',
      icon: FaLeaf,
      gradient: 'from-green-400 via-emerald-500 to-teal-500',
      description: 'Fenómenos naturales extraordinarios',
      emoji: '🌿'
    },
    {
      id: 'politica',
      name: 'Política',
      icon: FaLandmark,
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      description: 'Decisiones gubernamentales insólitas',
      emoji: '🏛️'
    },
    {
      id: 'inventos',
      name: 'Inventos',
      icon: FaLightbulb,
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
      description: 'Inventores excéntricos y creaciones únicas',
      emoji: '💡'
    },
    {
      id: 'fenomenos',
      name: 'Fenómenos',
      icon: FaStar,
      gradient: 'from-pink-500 via-purple-500 to-indigo-500',
      description: 'Eventos inexplicables y misteriosos',
      emoji: '✨'
    },
    {
      id: 'exploracion',
      name: 'Exploración',
      icon: GiTreasureMap,
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      description: 'Aventuras de exploradores y descubrimientos',
      emoji: '🗺️'
    }
  ];

  // Mapeo de IDs de categorías a nombres en los datos
  const categoryMapping = {
    'creepypasta': 'Creepypasta',
    'fenomenos-siniestros': 'Fenómenos Siniestros', 
    'finales-oscuros': 'Finales Oscuros',
    'enfrenta-tus-miedos': 'Enfrenta tus Miedos',
    'realeza': 'Realeza',
    'conflictos': 'Conflictos',
    'militar': 'Militar',
    'naturaleza': 'Naturaleza',
    'politica': 'Política',
    'inventos': 'Inventos',
    'fenomenos': 'Fenómenos',
    'exploracion': 'Exploración'
  };

  // Contar historias reales por categoría
  const getHistoryCount = (categoryId) => {
    const categoryName = categoryMapping[categoryId] || categoryId;
    return historias.filter(h => h.categoria === categoryName).length;
  };

  // Obtener historias destacadas por categoría
  const getFeaturedStories = (categoryId) => {
    const categoryName = categoryMapping[categoryId] || categoryId;
    return historias.filter(h => h.categoria === categoryName).slice(0, 2);
  };

  return (
    <div className="categorias-page">
      {/* Hero Section */}
      <motion.section 
        className="hero-categories"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="hero-background"></div>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-content"
          >
            <div className="hero-icon">
              <FaEye />
            </div>
            <h1 className="hero-title">
              Explora por Categorías
            </h1>
            <p className="hero-description">
              Descubre historias organizadas por temas fascinantes. Cada categoría te llevará a un mundo diferente de anécdotas sorprendentes y momentos únicos de la historia.
            </p>
            
            {/* Estadísticas */}
            <div className="hero-stats">
              <motion.div 
                className="stat-item"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Historias</span>
              </motion.div>
              <motion.div 
                className="stat-item"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <span className="stat-number">{stats.categories}</span>
                <span className="stat-label">Categorías</span>
              </motion.div>
              <motion.div 
                className="stat-item"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <span className="stat-number">{stats.countries}</span>
                <span className="stat-label">Países</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Categories Grid */}
      <section className="categories-grid-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2>Categorías Disponibles</h2>
            <p>Explora nuestras colecciones temáticas de historias increíbles</p>
          </motion.div>

          <div className="categories-grid">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              const storyCount = getHistoryCount(category.id);
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    to={`/historias?categoria=${category.id}`}
                    className="category-card"
                    onMouseEnter={() => setHoveredCategory(category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className={`category-card-inner bg-gradient-to-br ${category.gradient} ${category.isBloodTheme ? 'blood-theme' : ''}`}>
                      <div className="category-card-header">
                        <div className="category-emoji">{category.emoji}</div>
                        <div className="category-icon">
                          <IconComponent />
                        </div>
                      </div>
                      
                      <div className="category-card-content">
                        <h3 className="category-name">{category.name}</h3>
                        <p className="category-description">{category.description}</p>
                        
                        <div className="category-footer">
                          <div className="category-count">
                            <span className="count-number">{storyCount}</span>
                            <span className="count-text">
                              {storyCount === 1 ? 'historia' : 'historias'}
                            </span>
                          </div>
                          
                          <div className="category-arrow">
                            <span>→</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Stories by Category */}
      <section className="featured-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2>Historias Destacadas</h2>
            <p>Algunas de nuestras historias más fascinantes organizadas por categoría</p>
          </motion.div>
          
          <div className="featured-grid">
            {categories.filter(c => getHistoryCount(c.id) > 0).slice(0, 4).map((category, index) => {
              const IconComponent = category.icon;
              const stories = getFeaturedStories(category.id);
              
              return (
                <motion.div 
                  key={category.id} 
                  className="featured-category"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="featured-header">
                    <div className={`featured-icon bg-gradient-to-br ${category.gradient}`}>
                      <IconComponent />
                    </div>
                    <div className="featured-info">
                      <h3>{category.name}</h3>
                      <p>{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="featured-stories">
                    {stories.map((story) => (
                      <div key={story.id} className="featured-story">
                        <h4>{story.titulo}</h4>
                        <p>{story.contenido.substring(0, 120)}...</p>
                        <div className="story-meta">
                          <span>{story.pais}</span>
                          <span>{story.año}</span>
                        </div>
                      </div>
                    ))}
                    
                    {stories.length === 0 && (
                      <div className="no-stories">
                        <p>Próximamente historias de esta categoría</p>
                      </div>
                    )}
                  </div>
                  
                  <Link 
                    to={`/historias?categoria=${category.id}`}
                    className="featured-link"
                  >
                    Ver todas las historias de {category.name} →
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Categorias;
