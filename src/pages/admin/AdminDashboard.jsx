import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../../config/api';
import { 
  FaBook, 
  FaEye, 
  FaHeart, 
  FaUsers, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaFilter,
  FaStar,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaImage,
  FaVideo
} from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({});
  const [historias, setHistorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const navigate = useNavigate();

  const categorias = ['Realeza', 'Conflictos', 'Militar', 'Naturaleza', 'Política', 'Ciencia', 'Arte', 'Deportes', 'Religión', 'Economía', 'Tecnología', 'Cultura'];

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadHistorias();
  }, [currentPage, searchTerm, filterCategoria]);

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');
    
    if (!token || !userData) {
      navigate('/admin/login');
      return;
    }

    try {
      setAdmin(JSON.parse(userData));
    } catch (error) {
      console.error('Error parsing user data:', error);
      handleLogout();
    }
  };

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(buildApiUrl('/api/admin/historias/stats/general'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadHistorias = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filterCategoria && { categoria: filterCategoria })
      });

      const response = await fetch(buildApiUrl(`/api/admin/historias?${queryParams}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistorias(data.historias);
        setPagination(data.pagination);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error('Error loading historias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const toggleDestacada = async (id, destacada) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(buildApiUrl(`/api/admin/historias/${id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ destacada: !destacada })
      });

      if (response.ok) {
        loadHistorias();
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error updating historia:', error);
    }
  };

  const deleteHistoria = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta historia?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(buildApiUrl(`/api/admin/historias/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadHistorias();
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error deleting historia:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!admin) {
    return <div className="admin-loading">Cargando...</div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <h1>🎭 Panel de Administración</h1>
          <p>Historias Desopilantes</p>
        </div>
        <div className="admin-header-right">
          <div className="admin-user-info">
            <div className="admin-avatar">
              {admin.avatar ? (
                <img src={admin.avatar} alt={admin.nombre} />
              ) : (
                <span>{admin.nombre.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="admin-user-details">
              <span className="admin-user-name">{admin.nombre}</span>
              <span className="admin-user-role">{admin.rol}</span>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="admin-nav">
        <button className="admin-nav-item active">
          <FaChartBar /> Dashboard
        </button>
        <button className="admin-nav-item" onClick={() => navigate('/admin/historias/nueva')}>
          <FaPlus /> Nueva Historia
        </button>
        <button className="admin-nav-item">
          <FaCog /> Configuración
        </button>
      </nav>

      {/* Main Content */}
      <main className="admin-main">
        {/* Stats Cards */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <FaBook />
            </div>
            <div className="admin-stat-content">
              <h3>{stats.total || 0}</h3>
              <p>Total Historias</p>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <FaEye />
            </div>
            <div className="admin-stat-content">
              <h3>{stats.totalViews || 0}</h3>
              <p>Total Visualizaciones</p>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <FaStar />
            </div>
            <div className="admin-stat-content">
              <h3>{stats.destacadas || 0}</h3>
              <p>Historias Destacadas</p>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <FaHeart />
            </div>
            <div className="admin-stat-content">
              <h3>{stats.activas || 0}</h3>
              <p>Historias Activas</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="admin-controls">
          <div className="admin-search-container">
            <FaSearch className="admin-search-icon" />
            <input
              type="text"
              placeholder="Buscar historias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>
          
          <div className="admin-filter-container">
            <FaFilter className="admin-filter-icon" />
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="admin-filter-select"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          <button 
            className="admin-add-button"
            onClick={() => navigate('/admin/historias/nueva')}
          >
            <FaPlus /> Nueva Historia
          </button>
        </div>

        {/* Historias Table */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h2>Gestión de Historias</h2>
          </div>
          
          {loading ? (
            <div className="admin-loading-table">
              <div className="admin-spinner-large"></div>
              <p>Cargando historias...</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Historia</th>
                    <th>Categoría</th>
                    <th>País</th>
                    <th>Año</th>
                    <th>Visualizaciones</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {historias.map(historia => (
                    <tr key={historia._id}>
                      <td>
                        <div className="admin-historia-cell">
                          <div className="admin-historia-media">
                            {historia.imagen ? (
                              <img src={historia.imagen} alt={historia.titulo} />
                            ) : (
                              <div className="admin-no-image">
                                <FaImage />
                              </div>
                            )}
                            {historia.video?.url && (
                              <div className="admin-video-indicator">
                                <FaVideo />
                              </div>
                            )}
                          </div>
                          <div className="admin-historia-info">
                            <h4>{historia.titulo}</h4>
                            <p>{historia.contenido.substring(0, 80)}...</p>
                            <span className="admin-historia-date">
                              {formatDate(historia.fechaCreacion)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-categoria-tag">
                          {historia.categoria}
                        </span>
                      </td>
                      <td>{historia.pais}</td>
                      <td>{historia.año}</td>
                      <td>
                        <div className="admin-views">
                          <FaEye />
                          {historia.views}
                        </div>
                      </td>
                      <td>
                        <div className="admin-status-badges">
                          {historia.activa && (
                            <span className="admin-badge active">Activa</span>
                          )}
                          {historia.destacada && (
                            <span className="admin-badge featured">Destacada</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button
                            className="admin-action-btn edit"
                            onClick={() => navigate(`/admin/historias/${historia._id}/editar`)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className={`admin-action-btn ${historia.destacada ? 'unstar' : 'star'}`}
                            onClick={() => toggleDestacada(historia._id, historia.destacada)}
                          >
                            <FaStar />
                          </button>
                          {admin.permisos?.historias?.eliminar && (
                            <button
                              className="admin-action-btn delete"
                              onClick={() => deleteHistoria(historia._id)}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="admin-pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="admin-pagination-btn"
              >
                Anterior
              </button>
              
              <span className="admin-pagination-info">
                Página {currentPage} de {pagination.pages}
              </span>
              
              <button
                disabled={currentPage === pagination.pages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="admin-pagination-btn"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
