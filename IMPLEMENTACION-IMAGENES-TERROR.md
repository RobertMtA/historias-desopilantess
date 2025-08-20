# 🎭 GUÍA DE IMPLEMENTACIÓN DE IMÁGENES DE TERROR HISTÓRICO

## 📁 Estructura de Carpetas
```
src/assets/images/
├── backgrounds/
│   ├── hero-terror-main.jpg        (Imagen principal del hero)
│   ├── ancient-parchment.jpg       (Textura de pergamino para secciones)
│   ├── masks-collection.jpg        (Colección de máscaras históricas)
│   └── blood-texture.png          (Textura de sangre para overlays)
├── masks/
│   ├── venetian-mask.jpg          (Máscaras venecianas)
│   ├── greek-tragedy-mask.jpg     (Máscaras griegas)
│   └── plague-doctor-mask.jpg     (Máscaras de doctor de la peste)
└── textures/
    ├── old-paper.jpg              (Papel envejecido)
    ├── rust-metal.jpg             (Metal oxidado)
    └── gothic-ornaments.png       (Ornamentos góticos)
```

## 🎨 Especificaciones de Imágenes

### Hero Principal (hero-terror-main.jpg)
- **Dimensiones**: 1920x1080px mínimo
- **Contenido**: Máscaras históricas, libros antiguos, pergaminos con sangre sutil
- **Estilo**: Oscuro, con tonos sepias y rojos apagados
- **Calidad**: Alta resolución para efecto parallax

### Texturas de Fondo
- **Formato**: JPG para fotos, PNG para transparencias
- **Dimensiones**: 1200x800px mínimo
- **Estilo**: Envejecido, con manchas y texturas orgánicas

## 🔧 Cómo Implementar las Imágenes

### 1. Agregar las imágenes a la carpeta assets
```bash
# Coloca tus imágenes en:
src/assets/images/backgrounds/
```

### 2. Actualizar las rutas en terror-effects.css
```css
/* Línea 34 - Cambiar la ruta de la imagen principal */
background-image: 
  url('../images/backgrounds/hero-terror-main.jpg');

/* Para texturas adicionales en las secciones */
.featured-section::before {
  background-image: 
    url('../images/textures/old-paper.jpg'),
    radial-gradient(circle at 20% 80%, rgba(139, 0, 0, 0.1) 0%, transparent 50%);
}
```

### 3. Crear variantes para diferentes secciones
```css
/* Hero principal */
.hero-section::before {
  background-image: url('../images/backgrounds/hero-terror-main.jpg');
}

/* Sección destacadas con máscaras */
.featured-section::before {
  background-image: url('../images/masks/venetian-mask.jpg');
  opacity: 0.1;
}

/* Sección recientes con pergamino */
.recent-section::before {
  background-image: url('../images/textures/old-paper.jpg');
  opacity: 0.15;
}

/* Categorías con ornamentos */
.categories-section::before {
  background-image: url('../images/textures/gothic-ornaments.png');
  opacity: 0.08;
}
```

## 🎪 Prompts Sugeridos para Generadores de IA

### Para la Imagen Principal del Hero
```
"Dark historical scene with vintage venetian masks, old leather-bound books, 
aged parchment scrolls with subtle blood drops, flickering candlelight, 
gothic architecture background, sepia and dark red color palette, 
mysterious atmospheric lighting, cinematic composition, 4K quality"
```

### Para Texturas de Pergamino
```
"Ancient parchment paper texture, aged and weathered, coffee stains, 
subtle burn marks on edges, historical document appearance, 
neutral beige and brown tones, high resolution seamless pattern"
```

### Para Máscaras Históricas
```
"Collection of historical masks: venetian carnival masks, 
greek theater tragedy masks, medieval plague doctor masks, 
arranged dramatically with soft shadows, museum lighting, 
dark background, detailed textures, professional photography style"
```

### Para Ornamentos Góticos
```
"Gothic ornamental borders and decorative elements, 
medieval manuscript illuminations style, intricate details, 
dark bronze and gold colors, transparent PNG format, 
suitable for overlay graphics"
```

## ⚡ Optimización de Performance

### Compresión de Imágenes
- **Hero**: 200-400KB máximo
- **Texturas**: 100-200KB máximo
- **Ornamentos PNG**: 50-100KB máximo

### Formatos Modernos
```css
/* Usar WebP con fallback */
.hero-section::before {
  background-image: url('../images/backgrounds/hero-terror-main.webp');
  background-image: url('../images/backgrounds/hero-terror-main.jpg');
}
```

### Responsive Images
```css
/* Imágenes más pequeñas para móvil */
@media (max-width: 768px) {
  .hero-section::before {
    background-image: url('../images/backgrounds/hero-terror-mobile.jpg');
  }
}
```

## 🎯 Checklist de Implementación

- [ ] Crear/descargar imágenes según especificaciones
- [ ] Colocar imágenes en carpetas correspondientes
- [ ] Actualizar rutas en terror-effects.css
- [ ] Probar en diferentes dispositivos
- [ ] Optimizar tamaños de archivo
- [ ] Verificar efecto parallax
- [ ] Ajustar opacidades de overlays
- [ ] Testear tiempos de carga

## 🚀 Activación de Efectos

Una vez que tengas las imágenes:

1. **Coloca las imágenes** en las carpetas indicadas
2. **Actualiza las rutas** en `terror-effects.css`
3. **Recarga la página** - ¡Los efectos se activarán automáticamente!

Los efectos incluyen:
- ✅ Parallax scrolling
- ✅ Animaciones de partículas de sangre
- ✅ Efectos de goteo en títulos
- ✅ Brillos y sombras atmosféricas
- ✅ Hover effects en tarjetas
- ✅ Transiciones suaves
- ✅ Cursores personalizados

¡Tu sitio de historias desopilantes tendrá una atmósfera de terror histórico única! 🎭💀
