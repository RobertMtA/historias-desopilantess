import styles from './VideoEmbed.module.css';

const VideoEmbed = ({ url, title }) => {
  // Extraer ID de YouTube
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  const videoId = getYouTubeId(url);

  return (
    <div className={styles['video-embed']}>
      {title && <div className={styles['video-title']}>{title}</div>}
      <div className={styles['video-responsive']}>
        <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Embedded youtube"
      />
    </div>
    </div>
  )
}

export default VideoEmbed