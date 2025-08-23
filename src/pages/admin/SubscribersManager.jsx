import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api';
import { 
  FaEnvelope, 
  FaUser, 
  FaCalendarAlt, 
  FaSearch, 
  FaFilter,
  FaUsers,
  FaUserSlash,
  FaUserPlus,
  FaEye,
  FaTrash,
  FaDownload,
  FaTimes,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import './SubscribersManager.css';

const SubscribersManager = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'true', 'false'
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const loadStats = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/subscribers/stats'), {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading subscriber stats:', error);
    }
  };

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(filterActive !== 'all' && { isActive: filterActive })
      });

      const response = await fetch(buildApiUrl(`/api/subscribers?${queryParams}`), {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers || []);
        setPagination({
          current: parseInt(data.currentPage),
          pages: data.totalPages,
          total: data.total
        });
      }
    } catch (error) {
      console.error('Error loading subscribers:', error);
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadSubscribers();
  }, [currentPage, filterActive]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredSubscribers = subscribers.filter(subscriber => {
    if (!searchTerm) return true;
    return (
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const exportSubscribers = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Email,Nombre,Estado,Fuente,Fecha Suscripción\n"
      + subscribers.map(sub => 
          `${sub.email},${sub.name || ''},${sub.isActive ? 'Activo' : 'Inactivo'},${sub.source},${formatDate(sub.subscribedAt)}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `suscriptores_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteSubscriber = async (id, email) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar al suscriptor ${email}?`)) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/api/subscribers/${id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Recargar la lista de suscriptores y estadísticas
        loadSubscribers();
        loadStats();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'No se pudo eliminar el suscriptor'}`);
      }
    } catch (error) {
      console.error('Error eliminando suscriptor:', error);
      alert('Error de conexión al eliminar suscriptor');
    }
  };

  const toggleSubscriberStatus = async (id, currentStatus) => {
    const action = currentStatus ? 'desactivar' : 'reactivar';
    if (!window.confirm(`¿Estás seguro de que quieres ${action} este suscriptor?`)) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/api/subscribers/${id}/toggle`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Recargar la lista de suscriptores y estadísticas
        loadSubscribers();
        loadStats();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || `No se pudo ${action} el suscriptor`}`);
      }
    } catch (error) {
      console.error(`Error ${action}ndo suscriptor:`, error);
      alert(`Error de conexión al ${action} suscriptor`);
    }
  };

  return (
    <div className="subscribers-manager">
      {/* Stats Cards */}
      <div className="subscribers-stats-grid">
        <div className="subscribers-stat-card active">
          <div className="subscribers-stat-icon">
            <FaUsers />
          </div>
          <div className="subscribers-stat-content">
            <h3>{stats.totalActive || 0}</h3>
            <p>Suscriptores Activos</p>
          </div>
        </div>
        
        <div className="subscribers-stat-card inactive">
          <div className="subscribers-stat-icon">
            <FaUserSlash />
          </div>
          <div className="subscribers-stat-content">
            <h3>{stats.totalInactive || 0}</h3>
            <p>Suscriptores Inactivos</p>
          </div>
        </div>
        
        <div className="subscribers-stat-card today">
          <div className="subscribers-stat-icon">
            <FaUserPlus />
          </div>
          <div className="subscribers-stat-content">
            <h3>{stats.totalToday || 0}</h3>
            <p>Nuevos Hoy</p>
          </div>
        </div>
        
        <div className="subscribers-stat-card total">
          <div className="subscribers-stat-icon">
            <FaEnvelope />
          </div>
          <div className="subscribers-stat-content">
            <h3>{(stats.totalActive || 0) + (stats.totalInactive || 0)}</h3>
            <p>Total Suscriptores</p>
          </div>
        </div>
      </div>

      {/* Sources breakdown */}
      {stats.bySource && Object.keys(stats.bySource).length > 0 && (
        <div className="subscribers-sources">
          <h3>Suscriptores por Fuente</h3>
          <div className="sources-grid">
            {Object.entries(stats.bySource).map(([source, count]) => (
              <div key={source} className="source-item">
                <span className="source-name">{source}</span>
                <span className="source-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="subscribers-controls">
        <div className="controls-left">
          <div className="subscribers-search-container">
            <FaSearch className="subscribers-search-icon" />
            <input
              type="text"
              placeholder="Buscar por email o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="subscribers-search-input"
            />
            {searchTerm && (
              <button 
                className="subscribers-clear-search"
                onClick={() => setSearchTerm('')}
              >
                <FaTimes />
              </button>
            )}
          </div>
          
          <div className="subscribers-filter-container">
            <FaFilter className="subscribers-filter-icon" />
            <select
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value);
                setCurrentPage(1);
              }}
              className="subscribers-filter-select"
            >
              <option value="all">Todos los estados</option>
              <option value="true">Solo Activos</option>
              <option value="false">Solo Inactivos</option>
            </select>
          </div>
        </div>

        <div className="controls-right">
          <button 
            className="subscribers-export-btn"
            onClick={exportSubscribers}
            title="Exportar a CSV"
          >
            <FaDownload /> Exportar
          </button>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="subscribers-table-container">
        <div className="subscribers-table-header">
          <h2>Gestión de Suscriptores</h2>
          <p>
            Mostrando {filteredSubscribers.length} de {pagination.total || 0} suscriptores
          </p>
        </div>
        
        {loading ? (
          <div className="subscribers-loading">
            <div className="subscribers-spinner"></div>
            <p>Cargando suscriptores...</p>
          </div>
        ) : (
          <div className="subscribers-table-wrapper">
            <table className="subscribers-table">
              <thead>
                <tr>
                  <th>Suscriptor</th>
                  <th>Estado</th>
                  <th>Fuente</th>
                  <th>Fecha Suscripción</th>
                  <th>Último Email</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map(subscriber => (
                  <tr key={subscriber._id}>
                    <td>
                      <div className="subscriber-info">
                        <div className="subscriber-avatar">
                          <FaUser />
                        </div>
                        <div className="subscriber-details">
                          <div className="subscriber-email">
                            {subscriber.email}
                          </div>
                          {subscriber.name && (
                            <div className="subscriber-name">
                              {subscriber.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`subscriber-status ${subscriber.isActive ? 'active' : 'inactive'}`}>
                        {subscriber.isActive ? (
                          <>
                            <FaCheck /> Activo
                          </>
                        ) : (
                          <>
                            <FaTimes /> Inactivo
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className="subscriber-source">
                        {subscriber.source}
                      </span>
                    </td>
                    <td>
                      <div className="subscriber-date">
                        <FaCalendarAlt />
                        {formatDate(subscriber.subscribedAt)}
                      </div>
                    </td>
                    <td>
                      <div className="subscriber-last-email">
                        {subscriber.lastEmailSent ? (
                          formatDate(subscriber.lastEmailSent)
                        ) : (
                          <span className="no-email-sent">Nunca</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="subscriber-actions">
                        <button
                          className="subscriber-action-btn view"
                          title="Ver detalles"
                        >
                          <FaEye />
                        </button>
                        <button
                          className={`subscriber-action-btn ${subscriber.isActive ? 'deactivate' : 'activate'}`}
                          title={subscriber.isActive ? 'Desactivar suscripción' : 'Reactivar suscripción'}
                          onClick={() => toggleSubscriberStatus(subscriber._id, subscriber.isActive)}
                        >
                          {subscriber.isActive ? <FaTimes /> : <FaCheck />}
                        </button>
                        <button
                          className="subscriber-action-btn delete"
                          title="Eliminar suscriptor permanentemente"
                          onClick={() => deleteSubscriber(subscriber._id, subscriber.email)}
                        >
                          <FaTrash />
                        </button>
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
          <div className="subscribers-pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="subscribers-pagination-btn"
            >
              Anterior
            </button>
            
            <span className="subscribers-pagination-info">
              Página {currentPage} de {pagination.pages}
            </span>
            
            <button
              disabled={currentPage === pagination.pages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="subscribers-pagination-btn"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* No results message */}
      {!loading && filteredSubscribers.length === 0 && (
        <div className="subscribers-no-results">
          <FaExclamationTriangle />
          <h3>No se encontraron suscriptores</h3>
          <p>
            {searchTerm 
              ? `No hay suscriptores que coincidan con "${searchTerm}"`
              : 'No hay suscriptores registrados en el sistema'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscribersManager;
