import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSearch, FaBars, FaTimes, FaGlobeAmericas } from 'react-icons/fa';
import { MdOutlineEmojiEvents } from 'react-icons/md';
import { GiHistogram } from 'react-icons/gi';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // Cerrar el menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Efecto para el scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Redirigir a la página de historias con el query de búsqueda
    window.location.href = `/historias?search=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : 'header-default'}`}>
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="header-logo">
            <img 
              src="/img/img-logo.jpg" 
              alt="Historias Desopilantes Logo" 
              className={`header-logo-img ${isScrolled ? 'header-logo-scrolled' : 'header-logo-default'}`} 
            />
            <GiHistogram className={`header-icon ${isScrolled ? 'header-icon-scrolled' : 'header-icon-default'}`} />
            <span className={`header-title ${isScrolled ? 'header-title-scrolled' : 'header-title-default'}`}>
              HistoriasDesopilantes
            </span>
          </Link>

          {/* Menú de navegación para desktop */}
          <nav className="header-nav">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'nav-link-active' : ''} ${isScrolled ? 'nav-link-scrolled' : 'nav-link-default'}`}
            >
              Inicio
            </Link>
            <Link 
              to="/historias" 
              className={`nav-link ${location.pathname === '/historias' ? 'nav-link-active' : ''} ${isScrolled ? 'nav-link-scrolled' : 'nav-link-default'}`}
            >
              Historias
            </Link>
            <Link 
              to="/galeria" 
              className={`nav-link ${location.pathname === '/galeria' ? 'nav-link-active' : ''} ${isScrolled ? 'nav-link-scrolled' : 'nav-link-default'}`}
            >
              Galería
            </Link>
            <Link 
              to="/categorias" 
              className={`nav-link ${location.pathname === '/categorias' ? 'nav-link-active' : ''} ${isScrolled ? 'nav-link-scrolled' : 'nav-link-default'}`}
            >
              Categorías
            </Link>
            <Link 
              to="/about" 
              className={`nav-link ${location.pathname === '/about' ? 'nav-link-active' : ''} ${isScrolled ? 'nav-link-scrolled' : 'nav-link-default'}`}
            >
              Sobre Nosotros
            </Link>
            <Link 
              to="/contacto" 
              className={`nav-link ${location.pathname === '/contacto' ? 'nav-link-active' : ''} ${isScrolled ? 'nav-link-scrolled' : 'nav-link-default'}`}
            >
              Contacto
            </Link>
          </nav>

          {/* Barra de búsqueda para desktop */}
          <div className="header-search">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Buscar historias..."
                className={`search-input ${isScrolled ? 'search-input-scrolled' : 'search-input-default'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit" 
                className={`search-button ${isScrolled ? 'search-button-scrolled' : 'search-button-default'}`}
              >
                <FaSearch />
              </button>
            </form>
          </div>

          {/* Botón de menú móvil */}
          <button 
            className="mobile-menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <FaTimes className={`mobile-menu-icon ${isScrolled ? 'mobile-menu-icon-scrolled' : 'mobile-menu-icon-default'}`} />
            ) : (
              <FaBars className={`mobile-menu-icon ${isScrolled ? 'mobile-menu-icon-scrolled' : 'mobile-menu-icon-default'}`} />
            )}
          </button>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className={`mobile-menu ${isScrolled ? 'mobile-menu-scrolled' : 'mobile-menu-default'}`}>
            <nav className="mobile-nav">
              <Link 
                to="/" 
                className={`mobile-nav-link ${location.pathname === '/' ? 'mobile-nav-link-active' : ''} ${isScrolled ? 'mobile-nav-link-scrolled' : 'mobile-nav-link-default'}`}
              >
                Inicio
              </Link>
              <Link 
                to="/historias" 
                className={`mobile-nav-link ${location.pathname === '/historias' ? 'mobile-nav-link-active' : ''} ${isScrolled ? 'mobile-nav-link-scrolled' : 'mobile-nav-link-default'}`}
              >
                Historias
              </Link>
              <Link 
                to="/galeria" 
                className={`mobile-nav-link ${location.pathname === '/galeria' ? 'mobile-nav-link-active' : ''} ${isScrolled ? 'mobile-nav-link-scrolled' : 'mobile-nav-link-default'}`}
              >
                Galería
              </Link>
              <Link 
                to="/categorias" 
                className={`mobile-nav-link ${location.pathname === '/categorias' ? 'mobile-nav-link-active' : ''} ${isScrolled ? 'mobile-nav-link-scrolled' : 'mobile-nav-link-default'}`}
              >
                Categorías
              </Link>
              <Link 
                to="/about" 
                className={`mobile-nav-link ${location.pathname === '/about' ? 'mobile-nav-link-active' : ''} ${isScrolled ? 'mobile-nav-link-scrolled' : 'mobile-nav-link-default'}`}
              >
                Sobre Nosotros
              </Link>
              <Link 
                to="/contacto" 
                className={`mobile-nav-link ${location.pathname === '/contacto' ? 'mobile-nav-link-active' : ''} ${isScrolled ? 'mobile-nav-link-scrolled' : 'mobile-nav-link-default'}`}
              >
                Contacto
              </Link>
            </nav>

            {/* Barra de búsqueda móvil */}
            <div className="mobile-search">
              <form onSubmit={handleSearch} className="mobile-search-form">
                <input
                  type="text"
                  placeholder="Buscar historias..."
                  className={`mobile-search-input ${isScrolled ? 'mobile-search-input-scrolled' : 'mobile-search-input-default'}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit" 
                  className={`mobile-search-button ${isScrolled ? 'mobile-search-button-scrolled' : 'mobile-search-button-default'}`}
                >
                  <FaSearch />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;