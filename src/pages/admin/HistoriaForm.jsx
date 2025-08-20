import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { buildApiUrl } from '../../config/api';
import { 
  FaArrowLeft, 
  FaSave, 
  FaImage, 
  FaVideo, 
  FaTags, 
  FaEye,
  FaStar,
  FaTrash
} from 'react-icons/fa';
import './HistoriaForm.css';

const HistoriaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    pais: '',
    año: new Date().getFullYear(),
    categoria: '',
    destacada: false,
    activa: true,
    tags: '',
    videoUrl: '',
    videoTitulo: '',
    videoDescripcion: ''
  });

  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categorias = [
    'Realeza', 'Conflictos', 'Militar', 'Naturaleza', 'Política', 
    'Ciencia', 'Arte', 'Deportes', 'Religión', 'Economía', 'Tecnología', 'Cultura'
  ];

  useEffect(() => {
    if (isEdit) {
      loadHistoria();
    }
  }, [id, isEdit]);

  const loadHistoria = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(buildApiUrl(`/api/admin/historias/${id}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const historia = await response.json();
        setFormData({
          titulo: historia.titulo || '',
          contenido: historia.contenido || '',
          pais: historia.pais || '',
          año: historia.año || new Date().getFullYear(),
          categoria: historia.categoria || '',
          destacada: historia.destacada || false,
          activa: historia.activa !== undefined ? historia.activa : true,
          tags: historia.tags?.join(', ') || '',
          videoUrl: historia.video?.url || '',
          videoTitulo: historia.video?.titulo || '',
          videoDescripcion: historia.video?.descripcion || ''
        });
        
        if (historia.imagen) {
          setImagenPreview(historia.imagen);
        }
      } else if (response.status === 401) {
        navigate('/admin/login');
      } else {
        setError('Error al cargar la historia');
      }
    } catch (error) {
      console.error('Error loading historia:', error);
      setError('Error de conexión');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        return;
      }
      
      setImagen(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagenPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagen(null);
    setImagenPreview('');
    document.getElementById('imagen').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('admin_token');
      const formDataToSend = new FormData();
      
      // Agregar todos los campos del formulario
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          formDataToSend.append(key, formData[key]);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Agregar imagen si existe
      if (imagen) {
        formDataToSend.append('imagen', imagen);
      }

      const url = isEdit ? buildApiUrl(`/api/admin/historias/${id}`) : buildApiUrl('/api/admin/historias');
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(isEdit ? 'Historia actualizada exitosamente' : 'Historia creada exitosamente');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 2000);
      } else {
        setError(data.error || 'Error al guardar la historia');
      }
    } catch (error) {
      console.error('Error saving historia:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const caracteresRestantes = 2000 - formData.contenido.length;

  return (
    <div className="historia-form-page">
      <div className="historia-form-header">
        <button 
          className="historia-back-btn"
          onClick={() => navigate('/admin/dashboard')}
        >
          <FaArrowLeft />
          Volver al Dashboard
        </button>
        <h1>{isEdit ? 'Editar Historia' : 'Nueva Historia'}</h1>
      </div>

      <div className="historia-form-container">
        <form onSubmit={handleSubmit} className="historia-form">
          {error && (
            <div className="historia-message error">
              {error}
            </div>
          )}
          
          {success && (
            <div className="historia-message success">
              {success}
            </div>
          )}

          <div className="historia-form-grid">
            {/* Información Básica */}
            <div className="historia-form-section">
              <h3>📝 Información Básica</h3>
              
              <div className="historia-form-group">
                <label htmlFor="titulo">
                  Título *
                </label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="El título de la historia..."
                  required
                  maxLength="200"
                />
                <small>{formData.titulo.length}/200 caracteres</small>
              </div>

              <div className="historia-form-group">
                <label htmlFor="contenido">
                  Contenido *
                </label>
                <textarea
                  id="contenido"
                  name="contenido"
                  value={formData.contenido}
                  onChange={handleChange}
                  placeholder="Cuenta la historia completa..."
                  required
                  rows="8"
                  minLength="50"
                  maxLength="2000"
                />
                <small 
                  className={caracteresRestantes < 100 ? 'warning' : ''}
                >
                  {caracteresRestantes} caracteres restantes
                </small>
              </div>
            </div>

            {/* Clasificación */}
            <div className="historia-form-section">
              <h3>🏷️ Clasificación</h3>
              
              <div className="historia-form-row">
                <div className="historia-form-group">
                  <label htmlFor="categoria">
                    Categoría *
                  </label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(categoria => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="historia-form-group">
                  <label htmlFor="pais">
                    País *
                  </label>
                  <input
                    type="text"
                    id="pais"
                    name="pais"
                    value={formData.pais}
                    onChange={handleChange}
                    placeholder="Ej: España, Francia..."
                    required
                  />
                </div>
              </div>

              <div className="historia-form-group">
                <label htmlFor="año">
                  Año *
                </label>
                <input
                  type="number"
                  id="año"
                  name="año"
                  value={formData.año}
                  onChange={handleChange}
                  min="-3000"
                  max={new Date().getFullYear()}
                  required
                />
              </div>

              <div className="historia-form-group">
                <label htmlFor="tags">
                  <FaTags />
                  Tags (separados por comas)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="historia, divertida, increíble..."
                />
              </div>
            </div>

            {/* Multimedia */}
            <div className="historia-form-section">
              <h3>🎨 Multimedia</h3>
              
              <div className="historia-form-group">
                <label htmlFor="imagen">
                  <FaImage />
                  Imagen de la Historia
                </label>
                <div className="historia-image-upload">
                  <input
                    type="file"
                    id="imagen"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="historia-file-input"
                  />
                  <label htmlFor="imagen" className="historia-upload-label">
                    <FaImage />
                    {imagenPreview ? 'Cambiar imagen' : 'Subir imagen'}
                  </label>
                </div>
                
                {imagenPreview && (
                  <div className="historia-image-preview">
                    <img src={imagenPreview} alt="Preview" />
                    <button
                      type="button"
                      className="historia-remove-image"
                      onClick={removeImage}
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
                <small>Máximo 5MB. Formatos: JPG, PNG, GIF</small>
              </div>

              <div className="historia-form-group">
                <label htmlFor="videoUrl">
                  <FaVideo />
                  URL del Video (opcional)
                </label>
                <input
                  type="url"
                  id="videoUrl"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              {formData.videoUrl && (
                <>
                  <div className="historia-form-group">
                    <label htmlFor="videoTitulo">
                      Título del Video
                    </label>
                    <input
                      type="text"
                      id="videoTitulo"
                      name="videoTitulo"
                      value={formData.videoTitulo}
                      onChange={handleChange}
                      placeholder="Título del video..."
                    />
                  </div>

                  <div className="historia-form-group">
                    <label htmlFor="videoDescripcion">
                      Descripción del Video
                    </label>
                    <textarea
                      id="videoDescripcion"
                      name="videoDescripcion"
                      value={formData.videoDescripcion}
                      onChange={handleChange}
                      placeholder="Descripción del video..."
                      rows="3"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Configuración */}
            <div className="historia-form-section">
              <h3>⚙️ Configuración</h3>
              
              <div className="historia-form-checkboxes">
                <label className="historia-checkbox-label">
                  <input
                    type="checkbox"
                    name="destacada"
                    checked={formData.destacada}
                    onChange={handleChange}
                  />
                  <span className="historia-checkbox-custom">
                    <FaStar />
                  </span>
                  Historia destacada
                  <small>Se mostrará en la sección destacados</small>
                </label>

                <label className="historia-checkbox-label">
                  <input
                    type="checkbox"
                    name="activa"
                    checked={formData.activa}
                    onChange={handleChange}
                  />
                  <span className="historia-checkbox-custom">
                    <FaEye />
                  </span>
                  Historia activa
                  <small>Visible para los usuarios</small>
                </label>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="historia-form-actions">
            <button
              type="button"
              className="historia-btn secondary"
              onClick={() => navigate('/admin/dashboard')}
              disabled={loading}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="historia-btn primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="historia-spinner"></div>
                  {isEdit ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <FaSave />
                  {isEdit ? 'Actualizar Historia' : 'Crear Historia'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HistoriaForm;
