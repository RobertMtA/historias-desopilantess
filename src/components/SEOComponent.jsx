import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEOComponent = ({
  title = "Historias Desopilantes - Las Mejores Anécdotas y Relatos Divertidos",
  description = "Descubre las historias más divertidas y desopilantes. Relatos únicos, anécdotas increíbles y momentos que te harán reír hasta llorar. ¡Comparte tus propias historias!",
  keywords = "historias divertidas, anécdotas, relatos, humor, historias desopilantes, momentos graciosos, experiencias divertidas, cuentos, narrativa, entretenimiento",
  image = "https://historias-desopilantes.com/og-image.jpg",
  url = "https://historias-desopilantes.com",
  type = "website",
  author = "Historias Desopilantes",
  publishedTime,
  modifiedTime,
  section,
  tags,
  canonicalUrl,
  noIndex = false,
  structuredData,
  lang = "es"
}) => {
  // Construcción del título optimizado para SEO
  const pageTitle = title.includes('Historias Desopilantes') 
    ? title 
    : `${title} | Historias Desopilantes`;

  // Meta keywords optimizadas
  const metaKeywords = Array.isArray(keywords) ? keywords.join(', ') : keywords;

  // URL canónica
  const canonical = canonicalUrl || url;

  // Structured Data por defecto
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": url,
    "image": image,
    "inLanguage": lang,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Historias Desopilantes",
      "url": "https://historias-desopilantes.com"
    }
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Básicos HTML */}
      <html lang={lang} />
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content={author} />
      
      {/* Robots y indexación */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}
      
      {/* URL Canónica */}
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Historias Desopilantes" />
      <meta property="og:locale" content="es_ES" />
      
      {/* Open Graph para artículos */}
      {type === 'article' && (
        <>
          <meta property="article:author" content={author} />
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tags && Array.isArray(tags) && tags.map((tag, index) => (
            <meta property="article:tag" content={tag} key={index} />
          ))}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@historiasdesopilantes" />
      <meta name="twitter:creator" content="@historiasdesopilantes" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#3b82f6" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Historias Desopilantes" />
      
      {/* Preconnect para rendimiento */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
      
      {/* DNS Prefetch para recursos externos */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
      
      {/* Verificaciones para motores de búsqueda */}
      <meta name="google-site-verification" content="tu-codigo-de-verificacion-google" />
      <meta name="bing-site-verification" content="tu-codigo-de-verificacion-bing" />
      <meta name="yandex-verification" content="tu-codigo-de-verificacion-yandex" />
      
      {/* Geo Tags */}
      <meta name="geo.region" content="AR" />
      <meta name="geo.country" content="Argentina" />
      
      {/* Additional meta tags */}
      <meta name="rating" content="General" />
      <meta name="distribution" content="Global" />
      <meta name="revisit-after" content="7 days" />
      <meta name="language" content="Spanish" />
      
      {/* Para PWA */}
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Favicons y Apple Touch Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#3b82f6" />
    </Helmet>
  );
};

SEOComponent.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.oneOf(['website', 'article', 'profile']),
  author: PropTypes.string,
  publishedTime: PropTypes.string,
  modifiedTime: PropTypes.string,
  section: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  canonicalUrl: PropTypes.string,
  noIndex: PropTypes.bool,
  structuredData: PropTypes.object,
  lang: PropTypes.string
};

export default SEOComponent;
