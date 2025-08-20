import { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaArrowLeft, FaArrowRight, FaRegHeart, FaHeart, FaShare, FaDownload } from 'react-icons/fa';
import { FiFilter } from 'react-icons/fi';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import './Galeria.css';

const Galeria = () => {
  // Estado para las imágenes
  const [images, setImages] = useState([
    {
      id: 1,
      title: "El rey que declaró guerra al mar",
      url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop",
      category: "Realeza",
      country: "España",
      year: 1967,
      likes: 124,
      isLiked: false,
      description: "El rey Canuto el Grande intentó detener las mareas del océano como demostración de poder"
    },
    {
      id: 2,
      title: "La batalla de los pasteles",
      url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop",
      category: "Conflictos",
      country: "Francia",
      year: 1838,
      likes: 89,
      isLiked: false,
      description: "Una guerra que comenzó por pasteles franceses no pagados en México"
    },
    {
      id: 3,
      title: "El desfile militar más corto",
      url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=400&fit=crop",
      category: "Militar",
      country: "Reino Unido",
      year: 1913,
      likes: 156,
      isLiked: true,
      description: "Un desfile que duró exactamente 38 minutos y terminó en completo caos"
    },
    {
      id: 4,
      title: "La invasión de los conejos",
      url: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&h=400&fit=crop",
      category: "Naturaleza",
      country: "Australia",
      year: 1859,
      likes: 203,
      isLiked: false,
      description: "24 conejos liberados se convirtieron en millones y devastaron el país"
    },
    {
      id: 5,
      title: "El emperador que hizo cónsul a su caballo",
      url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&h=400&fit=crop",
      category: "Política",
      country: "Imperio Romano",
      year: 37,
      likes: 178,
      isLiked: true,
      description: "Calígula nombró a su caballo Incitatus como cónsul del imperio"
    },
    {
      id: 6,
      title: "La guerra por una oreja",
      url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
      category: "Conflictos",
      country: "España",
      year: 1739,
      likes: 92,
      isLiked: false,
      description: "Una guerra entre España e Inglaterra comenzó por la oreja cortada de un capitán"
    },
    {
      id: 7,
      title: "El día que llovió carne",
      url: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&h=400&fit=crop",
      category: "Fenómenos",
      country: "Estados Unidos",
      year: 1876,
      likes: 267,
      isLiked: false,
      description: "En Kentucky llovió literalmente carne fresca durante varios minutos"
    },
    {
      id: 8,
      title: "El inventor que murió por su invento",
      url: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=400&fit=crop",
      category: "Inventos",
      country: "Francia",
      year: 1912,
      likes: 145,
      isLiked: true,
      description: "Franz Reichelt murió probando su traje paracaídas saltando desde la Torre Eiffel"
    }
  ]);

  // Estado para el lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedCountry, setSelectedCountry] = useState('Todos');
  const [yearRange, setYearRange] = useState([1800, 2023]);

  // Obtener categorías y países únicos
  const categories = ['Todas', ...new Set(images.map(img => img.category))];
  const countries = ['Todos', ...new Set(images.map(img => img.country))];

  // Filtrar imágenes
  const filteredImages = images.filter(image => {
    const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         image.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || image.category === selectedCategory;
    const matchesCountry = selectedCountry === 'Todos' || image.country === selectedCountry;
    const matchesYear = image.year >= yearRange[0] && image.year <= yearRange[1];
    
    return matchesSearch && matchesCategory && matchesCountry && matchesYear;
  });

  // Manejar like
  const handleLike = (id) => {
    setImages(images.map(img => 
      img.id === id ? { ...img, isLiked: !img.isLiked, likes: img.isLiked ? img.likes - 1 : img.likes + 1 } : img
    ));
  };

  // Abrir lightbox
  const openLightbox = (index) => {
    setSelectedImage(index);
    setLightboxOpen(true);
  };

  // Cerrar lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  // Navegar en el lightbox
  const moveNext = () => {
    setSelectedImage((selectedImage + 1) % filteredImages.length);
  };

  const movePrev = () => {
    setSelectedImage((selectedImage - 1 + filteredImages.length) % filteredImages.length);
  };

  // Compartir imagen
  const shareImage = (image) => {
    if (navigator.share) {
      navigator.share({
        title: image.title,
        text: `Mira esta historia desopilante: ${image.title}`,
        url: window.location.href,
      })
      .catch(error => console.log('Error sharing:', error));
    } else {
      // Fallback para navegadores que no soportan Web Share API
      alert('Función de compartir no disponible en tu navegador');
    }
  };

  return (
    <div className="galeria-page">
      {/* Hero Section */}
      <div className="galeria-hero">
        <div className="hero-content">
          <h1>Galería de Historias Desopilantes</h1>
          <p>Descubre las historias más increíbles y divertidas de la historia a través de imágenes</p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="galeria-controls">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar historias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <FaTimes 
              className="clear-search" 
              onClick={() => setSearchTerm('')} 
            />
          )}
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="category-filter">
              <FiFilter className="filter-icon" />
              Categoría:
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="country-filter">
              <FiFilter className="filter-icon" />
              País:
            </label>
            <select
              id="country-filter"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              {countries.map((country, index) => (
                <option key={index} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="year-range">
              <FiFilter className="filter-icon" />
              Año: {yearRange[0]} - {yearRange[1]}
            </label>
            <div className="range-slider">
              <input
                type="range"
                min="1500"
                max="2023"
                value={yearRange[0]}
                onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
              />
              <input
                type="range"
                min="1500"
                max="2023"
                value={yearRange[1]}
                onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resultados de búsqueda */}
      <div className="results-count">
        <span className="count-number">{filteredImages.length}</span>
        <span className="count-text">
          {filteredImages.length === 1 ? 'historia encontrada' : 'historias encontradas'}
        </span>
      </div>

      {/* Galería de imágenes */}
      <div className="galeria-grid">
        {filteredImages.map((image, index) => (
          <div key={image.id} className="galeria-card">
            <div className="image-container" onClick={() => openLightbox(index)}>
              <img 
                src={image.url} 
                alt={image.title} 
                loading="lazy"
              />
              <div className="image-overlay">
                <div className="overlay-content">
                  <h3>{image.title}</h3>
                  <p className="location">{image.country}, {image.year}</p>
                  <p className="description">{image.description}</p>
                </div>
              </div>
            </div>
            
            <div className="image-meta">
              <div className="meta-left">
                <span className="category-badge">{image.category}</span>
              </div>
              <div className="meta-right">
                <button 
                  className={`like-button ${image.isLiked ? 'liked' : ''}`}
                  onClick={() => handleLike(image.id)}
                >
                  {image.isLiked ? <FaHeart /> : <FaRegHeart />}
                  <span>{image.likes}</span>
                </button>
                <button 
                  className="share-button"
                  onClick={() => shareImage(image)}
                >
                  <FaShare />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={closeLightbox}
        index={selectedImage}
        slides={filteredImages.map(img => ({
          src: img.url,
          title: img.title,
          description: `${img.country}, ${img.year}`
        }))}
        on={{
          view: ({ index }) => setSelectedImage(index)
        }}
      />

      {/* Mensaje cuando no hay resultados */}
      {filteredImages.length === 0 && (
        <div className="no-results">
          <h3>No se encontraron imágenes</h3>
          <p>Intenta con otros términos de búsqueda o ajusta los filtros</p>
          <button 
            className="reset-filters"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('Todas');
              setSelectedCountry('Todos');
              setYearRange([1800, 2023]);
            }}
          >
            Reiniciar filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default Galeria;