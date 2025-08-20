import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaTimes, FaFilter, FaHistory, FaGlobe } from 'react-icons/fa';
import { motion } from 'framer-motion';
import HistoriaCard from '../components/HistoriaCard';
import historias from '../data/historias';
import styles from './Historias.module.css';

const Historias = () => {
  const [searchParams] = useSearchParams();
  const [filtro, setFiltro] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroPais, setFiltroPais] = useState('Todos');

  // Mapeo de IDs de categorías a nombres en los datos (igual que en Categorias.jsx)
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

  // Efecto para manejar parámetros de URL
  useEffect(() => {
    const categoria = searchParams.get('categoria');
    if (categoria && categoryMapping[categoria]) {
      setFiltroCategoria(categoryMapping[categoria]);
    }
  }, [searchParams]);

  // Obtener categorías y países únicos
  const categorias = ['Todas', ...new Set(historias.map(h => h.categoria).filter(Boolean))];
  const paises = ['Todos', ...new Set(historias.map(h => h.pais))];

  const historiasFiltradas = historias.filter(historia => {
    const matchesSearch = historia.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
                         historia.contenido.toLowerCase().includes(filtro.toLowerCase()) ||
                         historia.pais.toLowerCase().includes(filtro.toLowerCase());
    const matchesCategoria = filtroCategoria === 'Todas' || historia.categoria === filtroCategoria;
    const matchesPais = filtroPais === 'Todos' || historia.pais === filtroPais;
    
    return matchesSearch && matchesCategoria && matchesPais;
  });

  return (
    <div className={styles['historias-page']}>
      {/* Hero Section */}
      <div className={styles['hero-section']}>
        <div className={styles['hero-content']}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <FaHistory className={styles['hero-icon']} />
            <h1>Historias Desopilantes del Mundo</h1>
            <p>Descubre las anécdotas más increíbles, divertidas y sorprendentes de la historia mundial</p>
          </motion.div>
        </div>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className={styles['controls-section']}>
        <div className={styles['search-container']}>
          <FaSearch className={styles['search-icon']} />
          <label htmlFor="historias-search-input" className="visually-hidden">
            Buscar historias
          </label>
          <input
            type="text"
            id="historias-search-input"
            name="search"
            placeholder="Buscar historias increíbles..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className={styles['search-input']}
          />
          {filtro && (
            <FaTimes 
              className={styles['clear-search']} 
              onClick={() => setFiltro('')} 
            />
          )}
        </div>

        <div className={styles['filters-container']}>
          <div className={styles['filter-group']}>
            <FaFilter className={styles['filter-icon']} />
            <label htmlFor="categoria-select">Categoría:</label>
            <select
              id="categoria-select"
              name="categoria"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className={styles['filter-select']}
            >
              {categorias.map((categoria, index) => (
                <option key={index} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          <div className={styles['filter-group']}>
            <FaGlobe className={styles['filter-icon']} />
            <label htmlFor="pais-select">País:</label>
            <select
              id="pais-select"
              name="pais"
              value={filtroPais}
              onChange={(e) => setFiltroPais(e.target.value)}
              className={styles['filter-select']}
            >
              {paises.map((pais, index) => (
                <option key={index} value={pais}>{pais}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles['results-count']}>
          <span className={styles['count-number']}>{historiasFiltradas.length}</span>
          <span className={styles['count-text']}>
            {historiasFiltradas.length === 1 ? 'historia encontrada' : 'historias encontradas'}
          </span>
        </div>
      </div>
      
      {/* Grid de historias */}
      <motion.div 
        className={styles['historias-grid']}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {historiasFiltradas.map((historia, index) => (
          <motion.div
            key={historia.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <HistoriaCard {...historia} />
          </motion.div>
        ))}
      </motion.div>

      {/* Mensaje cuando no hay resultados */}
      {historiasFiltradas.length === 0 && (
        <motion.div 
          className={styles['no-results']}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FaHistory className={styles['no-results-icon']} />
          <h3>No se encontraron historias</h3>
          <p>Intenta con otros términos de búsqueda o ajusta los filtros</p>
          <button 
            className={styles['reset-filters']}
            onClick={() => {
              setFiltro('');
              setFiltroCategoria('Todas');
              setFiltroPais('Todos');
            }}
          >
            Reiniciar filtros
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default Historias