import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { buildApiUrl } from '../config/api';
import { 
  FaEye, 
  FaEyeSlash, 
  FaExpandArrowsAlt, 
  FaTimes, 
  FaHeart, 
  FaRegHeart, 
  FaComment, 
  FaShare, 
  FaPaperPlane,
  FaUser
} from 'react-icons/fa';
import './HistoriaCard.css';

const HistoriaCard = ({ id, titulo, contenido, imagen, video, pais, año, categoria }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [userName, setUserName] = useState('');
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(3);
  const [commentError, setCommentError] = useState('');
  
  // Verificar que tenemos un ID válido - CRITICAL FIX
  const storyId = id || Math.floor(Math.random() * 45) + 1; // Fallback aleatorio entre 1-45
  
  // Configurar límite de caracteres para mostrar "Leer más" - AUMENTADO PARA MEJOR UX
  const CHAR_LIMIT = 400; // Aumentado de 200 a 400 para mostrar más contenido
  const shouldShowReadMore = contenido && contenido.length > CHAR_LIMIT;
  
  // Mostrar contenido completo por defecto, solo cortar si es MUY largo
  const displayContent = shouldShowReadMore && !isExpanded 
    ? contenido.substring(0, CHAR_LIMIT) + '...' 
    : contenido;

  // Cargar datos iniciales (likes y comentarios)
  useEffect(() => {
    if (storyId) {
      fetchStoryData();
    }
  }, [storyId]);

  const fetchStoryData = async () => {
    if (!storyId) {
      console.error('CRITICAL ERROR: storyId is still undefined/null:', storyId);
      return;
    }
    
    try {
      console.log('✅ Fetching data for story', storyId, 'for title:', titulo?.substring(0, 30));
      
      // Obtener likes
      const likesResponse = await fetch(buildApiUrl(`/api/stories/${storyId}/likes`));
      if (likesResponse.ok) {
        const likesData = await likesResponse.json();
        console.log('Likes data received:', likesData);
        setLikes(likesData.likes || 0); // Cambiar de count a likes
        setIsLiked(likesData.hasLiked || false); // Cambiar de userLiked a hasLiked
      }
      
      // Obtener comentarios
      const commentsResponse = await fetch(buildApiUrl(`/api/stories/${storyId}/comments`));
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        console.log('Comments data received:', commentsData);
        // Verificar si commentsData es un array o tiene una propiedad comments
        const commentsArray = Array.isArray(commentsData) ? commentsData : (commentsData.comments || []);
        setComments(commentsArray);
      }
    } catch (error) {
      console.error('Error loading story data:', error);
    }
  };

  const handleLike = async () => {
    // Optimistic update - actualizar UI inmediatamente
    const newIsLiked = !isLiked;
    const newLikes = newIsLiked ? likes + 1 : Math.max(0, likes - 1);
    
    setIsLiked(newIsLiked);
    setLikes(newLikes);
    
    try {
      const response = await fetch(buildApiUrl(`/api/stories/${storyId}/likes`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ liked: newIsLiked })
      });

      if (response.ok) {
        const data = await response.json();
        // Actualizar con los datos reales del servidor
        setLikes(data.likes);
        setIsLiked(data.hasLiked);
      } else {
        // Revertir cambios si hay error
        setIsLiked(isLiked);
        setLikes(likes);
        console.error('Error response:', response.status);
      }
    } catch (error) {
      console.error('Error updating like:', error);
      // Revertir cambios si hay error
      setIsLiked(isLiked);
      setLikes(likes);
    }
  };

  // Función para detectar y filtrar contenido spam (URLs, enlaces maliciosos)
  const detectSpamContent = (text) => {
    // Patrones de URLs más precisos (evitar falsos positivos con puntuación)
    const urlPattern = /(https?:\/\/[^\s]+)|(www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,})|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/gi;
    const suspiciousPatterns = [
      /bit\.ly/i,
      /tinyurl/i,
      /shorturl/i,
      /click.*here/i,
      /free.*money/i,
      /win.*prize/i,
      /urgent/i,
      /congratulations/i,
      /viagra/i,
      /casino/i,
      /lottery/i,
      /click.*now/i,
      /limited.*time/i
    ];

    // Limpiar texto de puntuación común para evitar falsos positivos
    const cleanText = text.replace(/[!?.,;:]+$/g, '');

    // Verificar URLs solo en el texto limpio y que realmente parezcan dominios
    const urlMatches = cleanText.match(urlPattern);
    if (urlMatches) {
      // Filtrar falsos positivos verificando que realmente sea un dominio
      const realUrls = urlMatches.filter(match => {
        // No debe ser solo una palabra con puntuación
        return match.includes('/') || (match.includes('.') && match.length > 4 && !/^[a-zA-Z]+!*$/.test(match));
      });
      
      if (realUrls.length > 0) {
        return 'No se permiten enlaces en los comentarios para evitar spam.';
      }
    }

    // Verificar patrones sospechosos
    for (let pattern of suspiciousPatterns) {
      if (pattern.test(text)) {
        return 'Este comentario contiene contenido que puede ser spam.';
      }
    }

    return null;
  };

  const handleComment = async (e) => {
    e.preventDefault();
    setCommentError('');
    
    if (!newComment.trim() || !userName.trim()) {
      setCommentError('Por favor completa tu nombre y comentario.');
      return;
    }

    // Verificar spam
    const spamError = detectSpamContent(newComment) || detectSpamContent(userName);
    if (spamError) {
      setCommentError(spamError);
      return;
    }

    // Verificar longitud mínima y máxima
    if (newComment.trim().length < 10) {
      setCommentError('El comentario debe tener al menos 10 caracteres.');
      return;
    }

    if (newComment.trim().length > 500) {
      setCommentError('El comentario no puede exceder 500 caracteres.');
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/api/stories/${storyId}/comments`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: userName.trim(),
          comment: newComment.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [...prev, data]);
        setNewComment('');
        setCommentError('');
        // No limpiar userName para mantenerlo durante la sesión
      } else {
        setCommentError('Error al enviar el comentario. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      setCommentError('Error de conexión. Inténtalo de nuevo.');
    }
  };

  const loadComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    setIsLoadingComments(true);
    setShowComments(true);
    
    try {
      const response = await fetch(buildApiUrl(`/api/stories/${storyId}/comments`));
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []); // <-- CORREGIDO
        setVisibleCommentsCount(3);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const loadMoreComments = () => {
    setVisibleCommentsCount(prev => prev + 3);
  };

  const shareStory = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: titulo,
          text: `${contenido.substring(0, 100)}...`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  return (
    <>
    <motion.div 
      className="historia-card"
      whileHover={{ scale: 1.03 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="card-header">
        <h3 className="historia-title">{titulo}</h3>
        <div className="historia-meta">
          <span className="meta-location">📍 {pais}</span>
          <span className="meta-year">📅 {año}</span>
          <span className="meta-category">🏷️ {categoria}</span>
        </div>
      </div>
      
      {imagen && (
        <div className="imagen-container">
          <img 
            src={imagen.startsWith('/') ? imagen : `/images/${imagen}`} 
            alt={titulo} 
            loading="lazy"
            onClick={openModal}
            style={{ cursor: 'pointer' }}
          />
        </div>
      )}
      
      <div className="contenido-container">
        <p className="historia-content">{displayContent}</p>
        
        {shouldShowReadMore && (
          <div className="card-controls">
            <button 
              className="read-more-btn"
              onClick={toggleReadMore}
              aria-label={isExpanded ? 'Mostrar menos contenido' : 'Mostrar más contenido'}
            >
              {isExpanded ? (
                <>
                  <FaEyeSlash className="control-icon" />
                  Leer menos
                </>
              ) : (
                <>
                  <FaEye className="control-icon" />
                  Ver más
                </>
              )}
            </button>
            <button 
              className="expand-btn" 
              onClick={openModal} 
              title="Ver en grande"
              aria-label="Ver historia en pantalla completa"
            >
              <FaExpandArrowsAlt className="control-icon" />
              Ver completa
            </button>
          </div>
        )}
      </div>

      {/* Acciones de la historia */}
      <div className="historia-actions">
        <button 
          className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          title={isLiked ? 'Quitar me gusta' : 'Me gusta'}
        >
          {isLiked ? <FaHeart className="action-icon" /> : <FaRegHeart className="action-icon" />}
          <span>{likes}</span>
        </button>

        <button 
          className="action-btn comment-btn"
          onClick={loadComments}
          title="Ver comentarios"
        >
          <FaComment className="action-icon" />
          <span>{comments.length}</span>
        </button>

        <button 
          className="action-btn share-btn"
          onClick={shareStory}
          title="Compartir historia"
        >
          <FaShare className="action-icon" />
        </button>
      </div>

      {/* Sección de comentarios */}
      {showComments && (
        <motion.div 
          className="comments-section"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="comments-header">
            <h4>Comentarios ({comments.length})</h4>
          </div>

          {/* Formulario para nuevo comentario */}
          <form className="comment-form" onSubmit={handleComment}>
            <div className="comment-inputs">
              <input
                type="text"
                placeholder="Tu nombre"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="comment-name-input"
                maxLength="50"
                id={`comment-name-${storyId}`}
                name="userName"
              />
              <div className="comment-input-wrapper">
                <textarea
                  placeholder="Escribe tu comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="comment-textarea"
                  maxLength="500"
                  rows="3"
                  id={`comment-text-${storyId}`}
                  name="commentText"
                />
                <button 
                  type="submit" 
                  className="comment-submit-btn"
                  disabled={!newComment.trim() || !userName.trim()}
                  title="Enviar comentario"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
            
            {/* Mensaje de error */}
            {commentError && (
              <div className="comment-error">
                {commentError}
              </div>
            )}
          </form>

          {/* Lista de comentarios */}
          <div className="comments-list">
            {isLoadingComments ? (
              <div className="comments-loading">Cargando comentarios...</div>
            ) : comments.length > 0 ? (
              <>
                {comments.slice(0, visibleCommentsCount).map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <FaUser className="comment-user-icon" />
                      <span className="comment-username">{comment.userName}</span>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                ))}
                
                {/* Botón Ver más mensajes */}
                {comments.length > visibleCommentsCount && (
                  <div className="load-more-comments">
                    <button 
                      onClick={loadMoreComments}
                      className="load-more-btn"
                    >
                      Ver más mensajes ({comments.length - visibleCommentsCount} restantes)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-comments">
                <p>¡Sé el primero en comentar esta historia!</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
      
      {video && (
        <div className="video-container">
          <video controls>
            <source src={`/videos/${video}`} type="video/mp4" />
            Tu navegador no soporta el elemento de video.
          </video>
        </div>
      )}
    </motion.div>
    
    {/* Modal de pantalla completa */}
    {isModalOpen && (
      <motion.div 
        className="historia-modal"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        onClick={closeModal}
      >
        <div 
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="modal-close-btn" 
            onClick={closeModal}
            aria-label="Cerrar historia"
          >
            <FaTimes />
          </button>
          
          <div className="modal-header">
            <h2 className="modal-title">{titulo}</h2>
            <div className="modal-meta">
              {pais && <span className="meta-tag">📍 {pais}</span>}
              {año && <span className="meta-tag">📅 {año}</span>}
              {categoria && <span className="meta-tag">🏷️ {categoria}</span>}
            </div>
          </div>
          
          <div className="modal-body">
            {imagen && (
              <div className="modal-image-container">
                <img 
                  src={imagen.startsWith('/') ? imagen : `/images/${imagen}`} 
                  alt={titulo}
                  loading="lazy"
                  onLoad={() => console.log('✅ Imagen cargada:', imagen)}
                  onError={(e) => console.error('❌ Error cargando imagen:', imagen, e)}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxWidth: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
            )}
            
            <p className="modal-text">{contenido}</p>
            
            {video && (
              <div className="modal-video-container">
                <video controls>
                  <source src={`/videos/${video}`} type="video/mp4" />
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            )}
          </div>

          {/* Acciones del modal */}
          <div className="modal-actions">
            <button 
              className={`modal-action-btn like-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              {isLiked ? <FaHeart /> : <FaRegHeart />}
              <span>{likes} Me gusta</span>
            </button>

            <button 
              className="modal-action-btn comment-btn"
              onClick={loadComments}
            >
              <FaComment />
              <span>{comments.length} Comentarios</span>
            </button>

            <button 
              className="modal-action-btn share-btn"
              onClick={shareStory}
            >
              <FaShare />
              <span>Compartir</span>
            </button>
          </div>

          {/* Comentarios en modal */}
          {showComments && (
            <div className="modal-comments">
              <div className="comments-header">
                <h4>Comentarios ({comments.length})</h4>
              </div>

              <form className="comment-form" onSubmit={handleComment}>
                <div className="comment-inputs">
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="comment-name-input"
                    maxLength="50"
                    id={`modal-comment-name-${storyId}`}
                    name="modalUserName"
                  />
                  <div className="comment-input-wrapper">
                    <textarea
                      placeholder="Escribe tu comentario..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="comment-textarea"
                      maxLength="500"
                      rows="3"
                      id={`modal-comment-text-${storyId}`}
                      name="modalCommentText"
                    />
                    <button 
                      type="submit" 
                      className="comment-submit-btn"
                      disabled={!newComment.trim() || !userName.trim()}
                    >
                      <FaPaperPlane />
                    </button>
                  </div>
                </div>
                
                {/* Mensaje de error */}
                {commentError && (
                  <div className="comment-error">
                    {commentError}
                  </div>
                )}
              </form>

              <div className="comments-list">
                {comments.length > 0 ? (
                  <>
                    {comments.slice(0, visibleCommentsCount).map((comment) => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-header">
                          <FaUser className="comment-user-icon" />
                          <span className="comment-username">{comment.userName}</span>
                          <span className="comment-date">
                            {new Date(comment.createdAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="comment-text">{comment.text}</p>
                      </div>
                    ))}
                    
                    {/* Botón Ver más mensajes en modal */}
                    {comments.length > visibleCommentsCount && (
                      <div className="load-more-comments">
                        <button 
                          onClick={loadMoreComments}
                          className="load-more-btn"
                        >
                          Ver más mensajes ({comments.length - visibleCommentsCount} restantes)
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-comments">
                    <p>¡Sé el primero en comentar esta historia!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    )}
  </>
  )
}

export default HistoriaCard