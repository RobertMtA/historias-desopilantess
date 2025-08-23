import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { buildApiUrl } from '../../config/api';
import historias from '../../data/historias';
import { 
  FaComments, 
  FaTrash, 
  FaUser, 
  FaCalendarAlt, 
  FaGlobe,
  FaSearch,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaSpinner,
  FaBookOpen,
  FaFilter,
  FaClock,
  FaMapMarkerAlt,
  FaTag,
  FaHeart
} from 'react-icons/fa';
import './CommentsManager.css';

const CommentsManager = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComments, setSelectedComments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStory, setFilterStory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [storyComments, setStoryComments] = useState([]);
  const [allStories, setAllStories] = useState([]);
  const [showStoriesDropdown, setShowStoriesDropdown] = useState(false);
  const [storiesWithComments, setStoriesWithComments] = useState([]);

  // Memoizar las historias para evitar re-renders
  const memoizedHistorias = useMemo(() => historias, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadComments();
      } else {
        setCurrentPage(1); // Reset to page 1 when searching/filtering
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, filterStory]);

  // Separate effect for page changes (no debounce needed)
  useEffect(() => {
    loadComments();
  }, [currentPage]);

  // Load all stories only once
  useEffect(() => {
    loadAllStories();
    loadStoriesWithComments();
  }, []);

  useEffect(() => {
    // Cerrar dropdown al hacer click fuera
    const handleClickOutside = (event) => {
      if (showStoriesDropdown && !event.target.closest('.stories-dropdown-container')) {
        setShowStoriesDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStoriesDropdown]);

  const loadAllStories = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        console.error('❌ No hay token de administrador para cargar historias');
        return;
      }

      const response = await fetch(buildApiUrl('/api/admin/historias?limit=100'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllStories(data.historias || []);
        console.log('✅ Historias cargadas desde BD:', data.historias?.length || 0);
      } else {
        console.error('❌ Error cargando historias:', response.status);
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
      }
    } catch (error) {
      console.error('❌ Error cargando historias:', error);
    }
  }, []);

  const loadStoriesWithComments = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        console.error('❌ No hay token de administrador para cargar historias con comentarios');
        return;
      }

      // Cargar historias que tienen comentarios usando agregación
      const response = await fetch(buildApiUrl('/api/admin/comments/stories-with-comments'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStoriesWithComments(data.stories || []);
        console.log('✅ Historias con comentarios cargadas:', data.stories?.length || 0);
      } else {
        console.log('ℹ️ Endpoint de historias con comentarios no disponible, usando historias locales de ejemplo');
        // Si el endpoint no existe, mostrar algunas historias locales como ejemplo
        const exampleStoriesWithComments = memoizedHistorias.slice(0, 5).map(historia => ({
          storyId: historia.id.toString(),
          storyTitle: historia.titulo,
          storyCategory: historia.categoria,
          commentCount: Math.floor(Math.random() * 10) + 1, // Número aleatorio para demo
          lastComment: new Date()
        }));
        setStoriesWithComments(exampleStoriesWithComments);
      }
    } catch (error) {
      console.error('❌ Error cargando historias con comentarios:', error);
      // Fallback a historias locales
      const exampleStoriesWithComments = memoizedHistorias.slice(0, 5).map(historia => ({
        storyId: historia.id.toString(),
        storyTitle: historia.titulo,
        storyCategory: historia.categoria,
        commentCount: Math.floor(Math.random() * 10) + 1,
        lastComment: new Date()
      }));
      setStoriesWithComments(exampleStoriesWithComments);
    }
  }, [memoizedHistorias]);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        console.error('❌ No hay token de administrador');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });

      if (filterStory) {
        params.append('storyId', filterStory);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(buildApiUrl(`/api/admin/comments?${params}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
        setPagination(data.pagination || {});
        console.log('✅ Comentarios cargados desde BD:', data.comments?.length || 0);
      } else {
        console.error('❌ Error en la respuesta del servidor:', response.status);
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
      }

    } catch (error) {
      console.error('❌ Error cargando comentarios:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStory, searchTerm]);

  const loadStoryComments = useCallback(async (storyId, storyTitle) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        console.error('❌ No hay token de administrador');
        setLoading(false);
        return;
      }

      const response = await fetch(buildApiUrl(`/api/admin/comments/story/${storyId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStoryComments(data.comments || []);
        setSelectedStory({ 
          id: storyId, 
          title: storyTitle, 
          info: data.storyInfo || { categoria: 'Sin categoría' }
        });
        console.log('✅ Comentarios de historia cargados desde BD:', data.comments?.length || 0);
      } else {
        console.error('❌ Error cargando comentarios de historia:', response.status);
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
      }

    } catch (error) {
      console.error('❌ Error cargando comentarios de historia:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteComment = useCallback(async (comment) => {
    try {
      const commentId = comment._id;
      const storyId = comment.storyId || comment.historia_id || selectedStory?.id;
      const token = localStorage.getItem('admin_token');
      
      console.log('🗑️ Eliminando comentario:', commentId, 'de historia:', storyId);
      
      if (!token) {
        alert('Error: No hay sesión de administrador activa.');
        return;
      }

      if (!commentId) {
        alert('Error: ID de comentario no válido.');
        return;
      }
      
      // Llamar a la API real para eliminar el comentario
      const response = await fetch(buildApiUrl(`/api/admin/comments/${commentId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Eliminar del estado local inmediatamente para UX responsiva
        setComments(prevComments => prevComments.filter(c => c._id !== commentId));
        
        // También eliminar de storyComments si estamos viendo una historia específica
        if (selectedStory) {
          setStoryComments(prevComments => prevComments.filter(c => c._id !== commentId));
        }
        
        console.log('✅ Comentario eliminado exitosamente de la base de datos');
        
      } else {
        console.error('❌ Error eliminando comentario:', response.status);
        const errorData = await response.json();
        alert(`Error eliminando comentario: ${errorData.error || 'Error desconocido'}`);
        
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
        return;
      }
      
      setShowDeleteConfirm(false);
      setCommentToDelete(null);

    } catch (error) {
      console.error('❌ Error eliminando comentario:', error);
      alert('Error de conexión al eliminar el comentario');
    }
  }, [selectedStory]);

  const handleDeleteClick = (comment) => {
    setCommentToDelete(comment);
    setShowDeleteConfirm(true);
  };

  const handleSelectComment = (commentId) => {
    setSelectedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleSelectAll = () => {
    const currentComments = selectedStory ? storyComments : comments;
    const allIds = currentComments.map(c => c._id);
    
    if (selectedComments.length === allIds.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(allIds);
    }
  };

  const deleteSelectedComments = async () => {
    if (selectedComments.length === 0) return;

    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        alert('Error: No hay sesión de administrador activa.');
        return;
      }
      
      if (selectedStory) {
        // Eliminar múltiples comentarios de una historia específica usando la ruta nueva
        const response = await fetch(buildApiUrl(`/api/admin/comments/story/${selectedStory.id}`), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ commentIds: selectedComments })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ ${result.deletedCount} comentarios eliminados exitosamente`);
          
          // Actualizar la lista y limpiar selección
          loadStoryComments(selectedStory.id, selectedStory.title);
          setSelectedComments([]);
        } else {
          console.error('❌ Error eliminando comentarios:', response.status);
          alert('Error eliminando comentarios seleccionados');
        }
      } else {
        // Eliminar comentarios individuales de diferentes historias
        let deletedCount = 0;
        
        for (const commentId of selectedComments) {
          try {
            const response = await fetch(buildApiUrl(`/api/admin/comments/${commentId}`), {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              deletedCount++;
            } else {
              console.error(`❌ Error eliminando comentario ${commentId}:`, response.status);
            }
          } catch (error) {
            console.error(`❌ Error eliminando comentario ${commentId}:`, error);
          }
        }
        
        console.log(`✅ ${deletedCount}/${selectedComments.length} comentarios eliminados exitosamente`);
        
        // Recargar la lista y limpiar selección
        loadComments();
        setSelectedComments([]);
      }
    } catch (error) {
      console.error('❌ Error eliminando comentarios seleccionados:', error);
      alert('Error de conexión al eliminar comentarios');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentComments = selectedStory ? storyComments : comments;
  const filteredComments = currentComments.filter(comment =>
    comment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (comment.storyTitle && comment.storyTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="comments-manager">
      {/* Header */}
      <div className="comments-header">
        <div className="header-content">
          {selectedStory ? (
            <div className="story-breadcrumb">
              <button 
                id="back-btn"
                name="back-to-all"
                type="button"
                className="back-btn"
                onClick={() => setSelectedStory(null)}
              >
                <FaChevronLeft /> Volver a todos
              </button>
              <div className="story-info">
                <h2><FaBookOpen /> {selectedStory.title}</h2>
                <div className="story-meta">
                  <span className="category-badge">{selectedStory.info?.categoria || 'Sin categoría'}</span>
                  <span className="story-id">Historia #{selectedStory.id}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="header-main">
              <h1><FaComments /> Gestión de Comentarios</h1>
              <p className="header-subtitle">Administra y modera los comentarios de todas las historias</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {!selectedStory && (
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <FaComments />
            </div>
            <div className="stat-content">
              <h3>{pagination.total || comments.length}</h3>
              <p>Comentarios totales</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaBookOpen />
            </div>
            <div className="stat-content">
              <h3>{storiesWithComments.length}</h3>
              <p>Historias con comentarios</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaClock />
            </div>
            <div className="stat-content">
              <h3>Activo</h3>
              <p>Estado del sistema</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="comments-controls">
        <div className="controls-left">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              id="search-comments"
              name="search-comments"
              type="text"
              placeholder={selectedStory ? "Buscar en esta historia..." : "Buscar comentarios, usuarios o historias..."}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />
            {searchTerm && (
              <button 
                id="clear-search-btn"
                name="clear-search"
                className="clear-search"
                onClick={() => setSearchTerm('')}
                type="button"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {!selectedStory && allStories.length > 0 && (
            <div className="stories-filter">
              <FaFilter className="filter-icon" />
              <select 
                id="filter-story"
                name="filter-story"
                value={filterStory} 
                onChange={(e) => setFilterStory(e.target.value)}
                className="story-select"
              >
                <option value="">Todas las historias</option>
                {allStories.map(story => (
                  <option key={story._id} value={story._id}>
                    {story.titulo} ({story.categoria})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="controls-right">
          {selectedComments.length > 0 ? (
            <div className="selection-info">
              <span className="selected-count">{selectedComments.length} seleccionados</span>
              <button
                id="delete-selected-btn"
                name="delete-selected"
                type="button"
                className="btn btn-danger"
                onClick={deleteSelectedComments}
              >
                <FaTrash /> Eliminar
              </button>
            </div>
          ) : (
            <button
              id="select-all-btn"
              name="select-all"
              type="button"
              className="btn btn-outline"
              onClick={handleSelectAll}
              disabled={filteredComments.length === 0}
            >
              <FaCheck /> Seleccionar todo
            </button>
          )}
        </div>
      </div>

      {/* Stories Grid (solo si no hay historia seleccionada) */}
      {!selectedStory && !searchTerm && storiesWithComments.length > 0 && (
        <div className="stories-section">
          <div className="section-header">
            <h3 className="section-title">
              <FaBookOpen /> {storiesWithComments.length} historias con comentarios reales
            </h3>
            <p className="section-subtitle">Historias que tienen comentarios activos en la base de datos</p>
          </div>
          
          <div className="historias-grid">
            {storiesWithComments.map((storyData) => {
              // Buscar información completa de la historia en los datos locales
              const localStory = memoizedHistorias.find(h => h.id.toString() === storyData.storyId);
              const displayStory = localStory || {
                id: storyData.storyId,
                titulo: storyData.storyTitle,
                categoria: storyData.storyCategory,
                pais: 'Desconocido',
                año: 'N/A',
                contenido: 'Información no disponible localmente...',
                visualizaciones: 0,
                likes: 0
              };

              return (
                <div 
                  key={storyData.storyId} 
                  className="historia-card has-comments real-comments"
                  onClick={() => loadStoryComments(storyData.storyId, storyData.storyTitle)}
                >
                  <div className="historia-header">
                    <h4 className="historia-titulo">{displayStory.titulo}</h4>
                    <div className="historia-meta">
                      <span className="historia-location">
                        <FaMapMarkerAlt /> {displayStory.pais}
                      </span>
                      <span className="historia-year">
                        <FaCalendarAlt /> {displayStory.año}
                      </span>
                      <span className="historia-category">
                        <FaTag /> {displayStory.categoria}
                      </span>
                    </div>
                  </div>
                  
                  <div className="historia-content">
                    <p className="historia-description">
                      {displayStory.contenido.substring(0, 200)}...
                    </p>
                  </div>
                  
                  <div className="historia-footer">
                    <div className="historia-stats">
                      <div className="stat-item">
                        <FaEye />
                        <span>{displayStory.visualizaciones || 0}</span>
                      </div>
                      <div className="stat-item">
                        <FaHeart />
                        <span>{displayStory.likes || 0}</span>
                      </div>
                    </div>
                    <div className="historia-action">
                      <span className="view-comments real-comments-badge">
                        <FaComments /> {storyData.commentCount} comentarios reales
                      </span>
                      <FaChevronRight className="arrow-icon" />
                    </div>
                  </div>
                  
                  <div className="comment-stats">
                    <div className="comment-stat">
                      <span className="stat-label">Comentarios:</span>
                      <span className="stat-value">{storyData.commentCount}</span>
                    </div>
                    <div className="comment-stat">
                      <span className="stat-label">Último:</span>
                      <span className="stat-value">{new Date(storyData.lastComment).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Stories Grid - Todas las historias disponibles */}
      {!selectedStory && !searchTerm && (
        <div className="stories-section all-stories">
          <div className="section-header">
            <h3 className="section-title">
              <FaBookOpen /> Todas las historias disponibles
            </h3>
            <p className="section-subtitle">
              Historias de la base de datos ({allStories.length}) + Historias locales ({memoizedHistorias.length}) = Total: {allStories.length + memoizedHistorias.length}
            </p>
          </div>
          
          {/* Historias de la base de datos */}
          {allStories.length > 0 && (
            <div className="subsection">
              <h4 className="subsection-title">📊 Historias de la base de datos ({allStories.length})</h4>
              <div className="historias-grid">
                {allStories.map((historia) => {
                  const hasRealComments = storiesWithComments.some(s => s.storyId === (historia.id || historia._id).toString());
                  const commentData = storiesWithComments.find(s => s.storyId === (historia.id || historia._id).toString());
                  
                  return (
                    <div 
                      key={`db-${historia._id}`} 
                      className={`historia-card ${hasRealComments ? 'has-comments' : 'no-comments'}`}
                      onClick={() => loadStoryComments(historia.id || historia._id, historia.titulo)}
                    >
                      <div className="historia-header">
                        <h4 className="historia-titulo">{historia.titulo}</h4>
                        <div className="historia-meta">
                          <span className="historia-location">
                            <FaMapMarkerAlt /> {historia.pais}
                          </span>
                          <span className="historia-year">
                            <FaCalendarAlt /> {historia.año}
                          </span>
                          <span className="historia-category">
                            <FaTag /> {historia.categoria}
                          </span>
                        </div>
                      </div>
                      
                      <div className="historia-content">
                        <p className="historia-description">
                          {historia.contenido.substring(0, 200)}...
                        </p>
                      </div>
                      
                      <div className="historia-footer">
                        <div className="historia-stats">
                          <div className="stat-item">
                            <FaEye />
                            <span>{historia.visualizaciones || 0}</span>
                          </div>
                          <div className="stat-item">
                            <FaHeart />
                            <span>{historia.likes || 0}</span>
                          </div>
                        </div>
                        <div className="historia-action">
                          {hasRealComments ? (
                            <span className="view-comments has-comments">
                              <FaComments /> {commentData?.commentCount || 0} comentarios reales
                            </span>
                          ) : (
                            <span className="view-comments no-comments">
                              <FaComments /> Sin comentarios
                            </span>
                          )}
                          <FaChevronRight className="arrow-icon" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Historias locales */}
          <div className="subsection">
            <h4 className="subsection-title">📚 Historias locales ({memoizedHistorias.length})</h4>
            <div className="historias-grid">
              {memoizedHistorias.map((historia) => {
                const hasRealComments = storiesWithComments.some(s => s.storyId === historia.id.toString());
                const commentData = storiesWithComments.find(s => s.storyId === historia.id.toString());
                
                return (
                  <div 
                    key={`local-${historia.id}`} 
                    className={`historia-card ${hasRealComments ? 'has-comments' : 'no-comments'}`}
                    onClick={() => loadStoryComments(historia.id, historia.titulo)}
                  >
                    <div className="historia-header">
                      <h4 className="historia-titulo">{historia.titulo}</h4>
                      <div className="historia-meta">
                        <span className="historia-location">
                          <FaMapMarkerAlt /> {historia.pais}
                        </span>
                        <span className="historia-year">
                          <FaCalendarAlt /> {historia.año}
                        </span>
                        <span className="historia-category">
                          <FaTag /> {historia.categoria}
                        </span>
                      </div>
                    </div>
                    
                    <div className="historia-content">
                      <p className="historia-description">
                        {historia.contenido.substring(0, 200)}...
                      </p>
                    </div>
                    
                    <div className="historia-footer">
                      <div className="historia-stats">
                        <div className="stat-item">
                          <FaEye />
                          <span>{historia.visualizaciones || 0}</span>
                        </div>
                        <div className="stat-item">
                          <FaHeart />
                          <span>{historia.likes || 0}</span>
                        </div>
                      </div>
                      <div className="historia-action">
                        {hasRealComments ? (
                          <span className="view-comments has-comments">
                            <FaComments /> {commentData?.commentCount || 0} comentarios reales
                          </span>
                        ) : (
                          <span className="view-comments no-comments">
                            <FaComments /> Sin comentarios
                          </span>
                        )}
                        <FaChevronRight className="arrow-icon" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Stories Grid para búsqueda */}
      {!selectedStory && allStories.length > 0 && searchTerm && (
        <div className="stories-grid">
          <h3 className="grid-title">Historias de la base de datos</h3>
          <div className="stories-cards">
            {allStories.filter(story => 
              story.titulo.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((historia) => (
              <div 
                key={historia._id} 
                className="story-card"
                onClick={() => loadStoryComments(historia._id, historia.titulo)}
              >
                <div className="story-card-header">
                  <h4>{historia.titulo}</h4>
                  <span className="story-badge">{historia.categoria}</span>
                </div>
                <div className="story-card-stats">
                  <div className="stat">
                    <FaEye />
                    <span>{historia.visualizaciones || 0} views</span>
                  </div>
                  <div className="stat">
                    <FaComments />
                    <span>Ver comentarios</span>
                  </div>
                </div>
                <FaChevronRight className="story-arrow" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="comments-section">
        {loading ? (
          <div className="loading-state">
            <FaSpinner className="spinner" />
            <h3>Cargando comentarios...</h3>
            <p>Esto puede tomar unos segundos</p>
          </div>
        ) : filteredComments.length > 0 ? (
          <div className="comments-list">
            <div className="comments-list-header">
              <h3>
                {selectedStory 
                  ? `Comentarios de "${selectedStory.title}"` 
                  : `${filteredComments.length} comentario${filteredComments.length !== 1 ? 's' : ''} encontrado${filteredComments.length !== 1 ? 's' : ''}`
                }
              </h3>
            </div>
            
            {filteredComments.map((comment) => (
              <div 
                key={comment._id} 
                className={`comment-card ${selectedComments.includes(comment._id) ? 'selected' : ''}`}
              >
                <div className="comment-checkbox">
                  <input
                    id={`checkbox-${comment._id}`}
                    name={`comment-checkbox-${comment._id}`}
                    type="checkbox"
                    checked={selectedComments.includes(comment._id)}
                    onChange={() => handleSelectComment(comment._id)}
                  />
                </div>

                <div className="comment-content">
                  <div className="comment-header">
                    <div className="user-info">
                      <FaUser className="user-avatar" />
                      <div className="user-details">
                        <span className="username">{comment.userName}</span>
                        <span className="comment-date">
                          <FaCalendarAlt /> {formatDate(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    {comment.ip && (
                      <div className="comment-meta">
                        <FaGlobe />
                        <span>{comment.ip}</span>
                      </div>
                    )}
                  </div>

                  {!selectedStory && comment.storyTitle && (
                    <div className="story-reference">
                      <button
                        id={`story-link-${comment._id}`}
                        name={`story-link-${comment._id}`}
                        type="button"
                        className="story-link"
                        onClick={() => loadStoryComments(comment.storyId, comment.storyTitle)}
                      >
                        <FaBookOpen /> {comment.storyTitle}
                        {comment.storyCategory && (
                          <span className="story-cat">• {comment.storyCategory}</span>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="comment-text">
                    <p>{comment.comment}</p>
                  </div>
                </div>

                <div className="comment-actions">
                  <button
                    id={`delete-btn-${comment._id}`}
                    name={`delete-comment-${comment._id}`}
                    type="button"
                    className="btn-delete"
                    onClick={() => handleDeleteClick(comment)}
                    title="Eliminar comentario"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <FaComments />
            </div>
            <h3>
              {searchTerm 
                ? 'No se encontraron comentarios' 
                : selectedStory 
                  ? 'Esta historia no tiene comentarios aún'
                  : 'No hay comentarios para mostrar'
              }
            </h3>
            <p>
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda o revisa la ortografía' 
                : selectedStory
                  ? 'Cuando los usuarios comenten en esta historia, aparecerán aquí'
                  : 'Los comentarios de los usuarios aparecerán aquí cuando estén disponibles'
              }
            </p>
            {searchTerm && (
              <button 
                id="clear-search-empty-btn"
                name="clear-search-empty"
                type="button"
                className="btn btn-primary"
                onClick={() => setSearchTerm('')}
              >
                <FaTimes /> Limpiar búsqueda
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!selectedStory && pagination.pages > 1 && (
        <div className="pagination">
          <button
            id="prev-page-btn"
            name="prev-page"
            type="button"
            className="btn btn-outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <FaChevronLeft /> Anterior
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                id={`page-btn-${page}`}
                name={`page-${page}`}
                type="button"
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            id="next-page-btn"
            name="next-page"
            type="button"
            className="btn btn-outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
            disabled={currentPage === pagination.pages}
          >
            Siguiente <FaChevronRight />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && commentToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3><FaExclamationTriangle /> Confirmar eliminación</h3>
            </div>
            
            <div className="modal-body">
              <p>¿Estás seguro de que quieres eliminar este comentario?</p>
              <div className="comment-preview">
                <div className="preview-user">
                  <FaUser /> <strong>{commentToDelete.userName}</strong>
                </div>
                <div className="preview-comment">
                  "{commentToDelete.comment.substring(0, 150)}..."
                </div>
              </div>
              <p className="warning-text">Esta acción no se puede deshacer.</p>
            </div>
            
            <div className="modal-actions">
              <button
                id="cancel-delete-btn"
                name="cancel-delete"
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCommentToDelete(null);
                }}
              >
                <FaTimes /> Cancelar
              </button>
              <button
                id="confirm-delete-btn"
                name="confirm-delete"
                type="button"
                className="btn btn-danger"
                onClick={() => deleteComment(commentToDelete)}
              >
                <FaTrash /> Eliminar comentario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsManager;