const historias = [
  {
    id: 1,
    titulo: "El rey que declaró la guerra al mar",
    contenido: "En 1967, el excéntrico rey Canuto el Grande intentó detener las mareas del océano como demostración de poder supremo. Colocó su trono en la playa y ordenó a las olas que se detuvieran. Cuando las aguas siguieron avanzando, declaró oficialmente la guerra al mar, enviando soldados a atacar las olas con espadas y lanzas.",
    pais: "España",
    año: 1967,
    categoria: "Realeza",
    imagen: "/images/historia-1.svg",
    video: null
  },
  {
    id: 2,
    titulo: "La batalla de los pasteles",
    contenido: "Una disputa culinaria entre panaderos franceses que escaló hasta involucrar a los gobiernos de Francia y México. Todo comenzó cuando un pastelero francés en México no recibió el pago por sus dulces. La situación se intensificó hasta convertirse en un conflicto diplomático internacional conocido como 'La Guerra de los Pasteles' en 1838.",
    pais: "Francia",
    año: 1838,
    categoria: "Conflictos",
    imagen: "/images/historia-2.svg",
    video: null
  },
  {
    id: 3,
    titulo: "El desfile militar más corto",
    contenido: "En 1913, el Reino Unido organizó un desfile militar que duró exactamente 38 minutos y terminó en completo caos. Los soldados se confundieron con las órdenes, marcharon en direcciones opuestas y algunos terminaron marchando directamente hacia un estanque. El evento se convirtió en una leyenda de incompetencia militar.",
    pais: "Reino Unido",
    año: 1913,
    categoria: "Militar",
    imagen: "/images/historia-3.svg",
    video: null
  },
  {
    id: 4,
    titulo: "La invasión de los conejos",
    contenido: "En 1859, Thomas Austin liberó 24 conejos en Australia para la caza. En menos de 50 años, estos se convirtieron en millones y devastaron el ecosistema australiano. Los conejos se reprodujeron tan rápidamente que cubrieron casi todo el continente, convirtiéndose en una de las invasiones de especies más exitosas de la historia.",
    pais: "Australia",
    año: 1859,
    categoria: "Naturaleza",
    imagen: "/images/historia-4.svg",
    video: null
  },
  {
    id: 5,
    titulo: "El emperador que hizo cónsul a su caballo",
    contenido: "El emperador romano Calígula nombró a su caballo favorito, Incitatus, como cónsul del imperio en el año 37 d.C. El caballo tenía su propia casa de mármol, comedores de marfil y incluso sirvientes. Calígula afirmaba que su caballo era más inteligente que la mayoría de los senadores romanos.",
    pais: "Imperio Romano",
    año: 37,
    categoria: "Política",
    imagen: "/images/historia-5.svg",
    video: null
  },
  {
    id: 6,
    titulo: "La guerra por una oreja",
    contenido: "En 1739 comenzó una guerra entre España e Inglaterra porque le cortaron la oreja al capitán Robert Jenkins. El capitán presentó su oreja cercenada al Parlamento británico como evidencia de los abusos españoles, desencadenando la 'Guerra de la Oreja de Jenkins' que duró 9 años y costó miles de vidas.",
    pais: "España",
    año: 1739,
    categoria: "Conflictos",
    imagen: "/images/historia-6.svg",
    video: null
  },
  {
    id: 7,
    titulo: "El día que llovió carne",
    contenido: "El 3 de marzo de 1876, en Kentucky, Estados Unidos, llovió literalmente carne fresca durante varios minutos. Pedazos de carne del tamaño de copos de nieve grandes cayeron del cielo despejado. Los científicos nunca pudieron explicar completamente este fenómeno, aunque se teoriza que pudo ser causado por buitres que regurgitaron su comida en vuelo.",
    pais: "Estados Unidos",
    año: 1876,
    categoria: "Fenómenos",
    imagen: "/images/historia-7.svg",
    video: null
  },
  {
    id: 8,
    titulo: "El inventor que murió por su invento",
    contenido: "Franz Reichelt, conocido como el 'Sastre Volador', murió en 1912 probando su traje paracaídas saltando desde la Torre Eiffel. A pesar de que las autoridades le habían dado permiso solo para usar un muñeco, Reichelt decidió probar el invento él mismo. El paracaídas no funcionó y cayó directamente al suelo, creando un cráter de 15 centímetros de profundidad.",
    pais: "Francia",
    año: 1912,
    categoria: "Inventos",
    imagen: "/images/historia-8.svg",
    video: null
  },
  {
    id: 11,
    titulo: "La estación de radio fantasma",
    contenido: "UVB-76, conocida como 'The Buzzer', es una misteriosa estación de radio rusa que transmite un zumbido monótono desde 1973. Ocasionalmente, voces rusas interrumpen el sonido con códigos crípticos. Nadie sabe oficialmente su propósito, pero se especula que podría ser un sistema de comunicación militar secreto o algo más siniestro.",
    pais: "Rusia",
    año: 1973,
    categoria: "Creepypasta",
    imagen: "/images/historia-11.svg",
    video: null
  },
  {
    id: 12,
    titulo: "El bosque de los suicidios",
    contenido: "Aokigahara, en Japón, es conocido como el 'Mar de Árboles' y tiene una reputación siniestra como lugar donde las personas van a quitarse la vida. Los lugareños cuentan historias de yūrei (espíritus furiosos) que vagan por el bosque. La vegetación es tan densa que los sonidos apenas penetran, creando un silencio inquietante que muchos describen como 'sobrenatural'.",
    pais: "Japón",
    año: 1960,
    categoria: "Creepypasta",
    imagen: "/images/historia-12.svg",
    video: null
  },
  {
    id: 13,
    titulo: "Los niños de ojos negros",
    contenido: "Desde los años 90, se reportan encuentros con niños misteriosos de ojos completamente negros que aparecen en puertas y automóviles pidiendo ayuda. Los testigos describen una sensación abrumadora de terror y la compulsión de no dejarlos entrar. Estos relatos se han extendido globalmente, convirtiéndose en una leyenda urbana moderna que muchos juran que es real.",
    pais: "Estados Unidos",
    año: 1996,
    categoria: "Creepypasta",
    imagen: "/images/historia-13.svg",
    video: null
  },
  {
    id: 14,
    titulo: "La epidemia de baile de 1518",
    contenido: "En Estrasburgo, Francia, una mujer comenzó a bailar frenéticamente en la calle y no pudo parar. En una semana, 34 personas se habían unido a ella. En un mes, 400 personas bailaban compulsivamente. Las autoridades estaban tan perplejas que trajeron músicos profesionales, creyendo que la música ayudaría. En su lugar, empeoró la situación. Docenas murieron de agotamiento, derrames cerebrales y ataques cardíacos.",
    pais: "Francia",
    año: 1518,
    categoria: "Fenómenos Siniestros",
    imagen: "/images/historia-14.svg",
    video: null
  },
  {
    id: 15,
    titulo: "El incidente de Dyatlov Pass",
    contenido: "En 1959, nueve esquiadores experimentados murieron misteriosamente en los montes Urales de Rusia. Sus cuerpos fueron encontrados con lesiones inexplicables: algunos tenían fracturas de cráneo sin trauma externo, otros tenían niveles de radiación elevados, y uno tenía la lengua arrancada. La tienda fue cortada desde adentro como si huyeran de algo aterrador en la noche.",
    pais: "Rusia",
    año: 1959,
    categoria: "Fenómenos Siniestros",
    imagen: "/images/historia-15.svg",
    video: null
  },
  {
    id: 16,
    titulo: "La lluvia roja de Kerala",
    contenido: "Entre julio y septiembre de 2001, en Kerala, India, cayó lluvia de color rojo sangre durante varios días. El análisis inicial sugirió que contenía células similares a las de organismos vivos, pero sin ADN. Algunos científicos propusieron que podrían ser de origen extraterrestre. Aunque posteriormente se atribuyó a esporas de algas, el fenómeno sigue siendo debatido y muchas preguntas permanecen sin respuesta.",
    pais: "India",
    año: 2001,
    categoria: "Fenómenos Siniestros",
    imagen: "/images/historia-16.svg",
    video: null
  },
  {
    id: 17,
    titulo: "El vuelo 401 y los aparecidos",
    contenido: "Después del crash del vuelo 401 de Eastern Air Lines en 1972, los empleados de la aerolínea reportaron avistamientos de los pilotos muertos en otros aviones de la flota. Los espíritus aparentemente aparecían para advertir sobre problemas mecánicos. Los avistamientos fueron tan frecuentes y detallados que Eastern Air Lines retiró silenciosamente las piezas salvadas del vuelo 401 de su flota, después de lo cual cesaron las apariciones.",
    pais: "Estados Unidos",
    año: 1972,
    categoria: "Fenómenos Siniestros",
    imagen: "/images/historia-17.svg",
    video: null
  },
  {
    id: 18,
    titulo: "Blancanieves: La verdad detrás del cuento",
    contenido: "El cuento de Blancanieves está basado en Margaretha von Waldeck, una noble alemana del siglo XVI. Su madrastra realmente intentó envenenarla por razones políticas. Los 'siete enanitos' eran trabajadores de minas explotados, muchos deformados por el trabajo infantil. Margaretha murió joven, posiblemente envenenada, y su historia se romantizó hasta convertirse en el cuento que conocemos, ocultando la brutal realidad medieval.",
    pais: "Alemania",
    año: 1554,
    categoria: "Finales Oscuros",
    imagen: "/images/historia-18.svg",
    video: null
  },
  {
    id: 19,
    titulo: "La verdadera Pocahontas",
    contenido: "Pocahontas fue secuestrada a los 17 años, forzada a convertirse al cristianismo y casarse con John Rolfe como estrategia política. Su 'historia de amor' con John Smith fue inventada décadas después. Fue llevada a Inglaterra como un trofeo exótico, donde murió a los 21 años, probablemente de enfermedad o envenenamiento. Su hijo fue abandonado en Inglaterra mientras su pueblo sufría genocidio.",
    pais: "Estados Unidos",
    año: 1617,
    categoria: "Finales Oscuros",
    imagen: "/images/historia-19.svg",
    video: null
  },
  {
    id: 20,
    titulo: "Los niños salvados del Titanic",
    contenido: "Los 'afortunados' supervivientes del Titanic enfrentaron décadas de trauma psicológico severo. Muchos niños 'salvados' desarrollaron trastornos mentales permanentes. Eva Hart, una superviviente famosa, nunca pudo volver a dormir en la oscuridad y tenía pesadillas constantes. El 'milagro' de su supervivencia se convirtió en una maldición de por vida, con muchos supervivientes suicidándose años después.",
    pais: "Reino Unido",
    año: 1912,
    categoria: "Finales Oscuros",
    imagen: "/images/historia-20.svg",
    video: null
  },
  {
    id: 21,
    titulo: "El rescate de los mineros chilenos",
    contenido: "El 'milagroso' rescate de los 33 mineros chilenos en 2010 tuvo un lado oscuro. Muchos desarrollaron alcoholismo, depresión y trastorno de estrés postraumático. Las familias se desintegraron por la presión mediática. Los mineros demandaron negligencia pero perdieron. La empresa minera nunca pagó compensaciones adecuadas. Varios mineros 'rescatados' intentaron suicidarse en los años siguientes, sintiéndose abandonados tras la euforia inicial.",
    pais: "Chile",
    año: 2010,
    categoria: "Finales Oscuros",
    imagen: "/images/historia-21.svg",
    video: null
  },
  {
    id: 22,
    titulo: "Los niños de la Operación Pedro Pan",
    contenido: "Entre 1960-1962, 14,000 niños cubanos fueron enviados solos a Estados Unidos para 'salvarlos' del comunismo. Prometieron que se reunirían con sus familias en semanas. Muchos nunca volvieron a ver a sus padres. Miles fueron maltratados en orfanatos, otros perdieron su identidad cultural. Esta 'operación de rescate' separó familias permanentemente y traumatizó a toda una generación de niños que crecieron sintiéndose abandonados.",
    pais: "Cuba",
    año: 1960,
    categoria: "Finales Oscuros",
    imagen: "/images/historia-22.svg",
    video: null
  },
  {
    id: 23,
    titulo: "Los experimentos de Unit 731",
    contenido: "Durante la Segunda Guerra Mundial, la Unidad 731 japonesa realizó experimentos médicos en prisioneros vivos sin anestesia. Amputaban extremidades para estudiar la pérdida de sangre, inyectaban bacterias mortales, exponían a víctimas a temperaturas extremas hasta la congelación, y realizaban vivisecciones en personas conscientes. Más de 200,000 personas murieron en agonía indescriptible. Los responsables nunca fueron juzgados.",
    pais: "China",
    año: 1940,
    categoria: "Enfrenta tus Miedos",
    imagen: "/images/historia-23.svg",
    video: null
  },
  {
    id: 24,
    titulo: "El Holodomor: el hambre como arma",
    contenido: "Stalin deliberadamente causó una hambruna que mató entre 3.5 y 5 millones de ucranianos en 1932-33. Confiscó toda la comida, prohibió a los campesinos buscar alimento en otros lugares, y cerró las fronteras. Las familias se vieron obligadas a comer corteza de árboles, después hierba, luego... sus propios hijos. El canibalismo se volvió tan común que había carteles advirtiendo contra 'comer a tus propios hijos'.",
    pais: "Ucrania",
    año: 1932,
    categoria: "Enfrenta tus Miedos",
    imagen: "/images/historia-24.svg",
    video: null
  },
  {
    id: 25,
    titulo: "Los hornos de Tophet",
    contenido: "En la antigua Cartago, los padres quemaban vivos a sus propios bebés en hornos sagrados llamados 'Tophet' para apaciguar al dios Moloch. Los arqueólogos han encontrado miles de urnas con restos carbonizados de niños. Los padres tenían prohibido llorar durante el ritual; si mostraban emoción, el sacrificio se consideraba inválido y debían repetirlo. Esta práctica continuó durante siglos hasta que Roma destruyó Cartago.",
    pais: "Túnez",
    año: -600,
    categoria: "Enfrenta tus Miedos",
    imagen: "/images/historia-25.svg",
    video: null
  },
  {
    id: 26,
    titulo: "La Escuela Industrial de Marieval",
    contenido: "En esta escuela residencial canadiense para niños indígenas, se realizaron experimentos nutricionales deliberados en los años 1940-50. Privaron intencionalmente a los niños de vitaminas esenciales para estudiar los efectos de la malnutrición. A algunos les negaron tratamiento dental para estudiar cómo progresaba la caries. Los niños morían de desnutrición mientras los investigadores tomaban notas clínicas. Miles de niños nunca regresaron a casa.",
    pais: "Canadá",
    año: 1899,
    categoria: "Enfrenta tus Miedos",
    imagen: "/images/historia-26.svg",
    video: null
  },
  {
    id: 27,
    titulo: "Los cuerpos que no podían enterrar",
    contenido: "Durante la Peste Negra de 1348, en Londres se agotó el espacio para enterrar muertos. Los cuerpos se acumulaban en las calles pudriéndose bajo el sol. Las autoridades cavaron fosas masivas de 200 metros de largo donde arrojaban cadáveres en capas, como lasaña humana. Cuando las fosas se llenaron, simplemente apilaron más cuerpos encima. Los londinenses caminaban sobre montañas de cadáveres en descomposición durante meses.",
    pais: "Reino Unido",
    año: 1348,
    categoria: "Enfrenta tus Miedos",
    imagen: "/images/historia-27.svg",
    video: null
  },
  // Nuevas historias de Política
  {
    id: 28,
    titulo: "El alcalde que prohibió la muerte",
    contenido: "En 2008, el alcalde de Lanjarón, España, prohibió oficialmente morirse en su municipio debido a problemas de espacio en el cementerio. La ordenanza municipal establecía multas para quien 'osara morirse' sin tener asegurado un nicho. Los ciudadanos debían demostrar tener sepultura garantizada o enfrentarse a sanciones. La absurda ley se volvió viral mundialmente.",
    pais: "España",
    año: 2008,
    categoria: "Política",
    imagen: "/images/historia-28.svg",
    video: null
  },
  {
    id: 29,
    titulo: "El país que cambió de hemisferio",
    contenido: "En 1995, el gobierno de Samoa decidió cambiar de zona horaria saltando del lado este al oeste de la línea internacional de fecha. Esto significó que el 30 de diciembre de 2011 simplemente no existió en Samoa. Los ciudadanos se fueron a dormir el 29 y despertaron el 31. La decisión económica eliminó un día completo de la historia del país.",
    pais: "Samoa",
    año: 1995,
    categoria: "Política",
    imagen: "/images/historia-29.svg",
    video: null
  },
  {
    id: 30,
    titulo: "El ministro que declaró la guerra a las moscas",
    contenido: "En 1958, el gobierno chino lanzó la campaña 'Cuatro Plagas' donde declaró la guerra oficial a las moscas, mosquitos, ratas y gorriones. Millones de ciudadanos salieron a golpear ollas durante días para asustar a los gorriones hasta matarlos de agotamiento. La campaña fue tan exitosa que eliminó casi todos los gorriones, causando una plaga de insectos que devastó las cosechas.",
    pais: "China",
    año: 1958,
    categoria: "Política",
    imagen: "/images/historia-30.svg",
    video: null
  },
  {
    id: 31,
    titulo: "El presidente que gobernó por teléfono",
    contenido: "Woodrow Wilson sufrió un derrame cerebral en 1919 y quedó parcialmente paralizado, pero su esposa Edith ocultó la información y básicamente gobernó Estados Unidos durante 17 meses. Ella decidía qué asuntos podía ver el presidente, filtraba toda la comunicación oficial y tomaba decisiones en su nombre. Algunos historiadores la llaman la primera mujer presidente no oficial de EE.UU.",
    pais: "Estados Unidos",
    año: 1919,
    categoria: "Política",
    imagen: "/images/historia-31.svg",
    video: null
  },
  {
    id: 32,
    titulo: "El país que legalizó el duelo",
    contenido: "Uruguay fue el último país del mundo en legalizar los duelos de honor hasta 1992. La constitución uruguaya permitía explícitamente resolver disputas mediante combate con espadas o pistolas, siempre que ambas partes estuvieran de acuerdo y siguieran las reglas establecidas. Había jueces oficiales de duelo y hospitales especializados en heridas de honor.",
    pais: "Uruguay",
    año: 1992,
    categoria: "Política",
    imagen: "/images/historia-32.svg",
    video: null
  },
  // Nuevas historias de Inventos
  {
    id: 33,
    titulo: "La máquina de pedos de Le Pétomane",
    contenido: "Joseph Pujol, conocido como Le Pétomane, fue una estrella del music-hall parisino en 1890 que podía controlar sus gases intestinales musicalmente. Inventó una máquina especial que amplificaba sus flatulencias y podía imitar sonidos de animales, instrumentos musicales e incluso voces. Ganó más dinero que Sarah Bernhardt y sus espectáculos siempre tenían sold-out completo.",
    pais: "Francia",
    año: 1890,
    categoria: "Inventos",
    imagen: "/images/historia-33.svg",
    video: null
  },
  {
    id: 34,
    titulo: "El hombre que inventó el despertador snooze",
    contenido: "Lew Wallace inventó la función 'snooze' de los despertadores en 1956, pero la programó para 9 minutos en lugar de 10 porque no cabían más dígitos en el display mecánico. Esta decisión arbitraria se mantuvo incluso en la era digital. Wallace más tarde admitió que se arrepentía de su invento, diciendo que había 'arruinado la productividad mundial' y creado una generación de procrastinadores.",
    pais: "Estados Unidos",
    año: 1956,
    categoria: "Inventos",
    imagen: "/images/historia-34.svg",
    video: null
  },
  {
    id: 35,
    titulo: "La bicicleta para dos pisos",
    contenido: "En 1896, el inventor francés Charles Mochet creó una bicicleta de dos pisos para resolver el problema del tráfico urbano. La bicicleta tenía un asiento superior para el conductor y otro inferior para el pasajero, con pedales en ambos niveles. El invento fracasó completamente cuando se dieron cuenta de que era imposible mantener el equilibrio y los accidentes eran constantes.",
    pais: "Francia",
    año: 1896,
    categoria: "Inventos",
    imagen: "/images/historia-35.svg",
    video: null
  },
  {
    id: 36,
    titulo: "El paraguas con radio incorporado",
    contenido: "En 1987, el inventor japonés Kenji Kawakami creó el paraguas con radio AM/FM incorporado y antena extensible. El problema era que para tener buena recepción había que mantener el paraguas en una posición específica, lo que significaba que te mojarías de todas formas. Vendió exactamente 12 unidades antes de que el producto fuera retirado del mercado.",
    pais: "Japón",
    año: 1987,
    categoria: "Inventos",
    imagen: "/images/historia-36.svg",
    video: null
  },
  {
    id: 37,
    titulo: "El inventor del WD-40",
    contenido: "Norm Larsen inventó el WD-40 en 1953 para prevenir la corrosión nuclear, pero se dio cuenta de que los empleados se lo llevaban a casa para usos domésticos. La fórmula era tan secreta que solo tres personas en el mundo la conocían. Larsen murió sin revelar nunca qué significaba exactamente 'WD' en el nombre, convirtiéndolo en uno de los misterios industriales más grandes.",
    pais: "Estados Unidos",
    año: 1953,
    categoria: "Inventos",
    imagen: "/images/historia-37.svg",
    video: null
  },
  // Nuevas historias de Fenómenos
  {
    id: 38,
    titulo: "El pueblo que se mudó por una maldición",
    contenido: "En 1976, todo el pueblo de Times Beach, Missouri, fue evacuado permanentemente después de que se descubriera que las calles habían sido rociadas con aceite contaminado con dioxina. Los 2,000 habitantes fueron reubicados por el gobierno, y el pueblo entero fue comprado y demolido. Hoy es un parque estatal, pero los locales aún creen que está maldito porque nada crece normalmente allí.",
    pais: "Estados Unidos",
    año: 1976,
    categoria: "Fenómenos",
    imagen: "/images/historia-38.svg",
    video: null
  },
  {
    id: 39,
    titulo: "La lluvia de sangre de Kerala",
    contenido: "En 2001, Kerala, India, experimentó lluvias de color rojo sangre durante varios meses. El agua caía completamente roja, manchando la ropa y asustando a la población. Los científicos inicialmente pensaron que eran esporas de algas, pero análisis posteriores mostraron células sin ADN que se multiplicaban a 300°C. Algunos teorizaron que podría ser evidencia de vida extraterrestre.",
    pais: "India",
    año: 2001,
    categoria: "Fenómenos",
    imagen: "/images/historia-39.svg",
    video: null
  },
  {
    id: 40,
    titulo: "Los relojes que se detuvieron en Hiroshima",
    contenido: "Después de la bomba atómica de Hiroshima en 1945, cientos de relojes se detuvieron exactamente a las 8:15 AM, la hora del impacto. Lo inexplicable es que relojes que estaban a kilómetros de distancia, fuera del rango de la explosión, también se detuvieron a la misma hora. Los científicos nunca pudieron explicar completamente este fenómeno electromagnético.",
    pais: "Japón",
    año: 1945,
    categoria: "Fenómenos",
    imagen: "/images/historia-40.svg",
    video: null
  },
  {
    id: 41,
    titulo: "El bosque que camina en Polonia",
    contenido: "El Bosque Torcido de Polonia tiene 400 pinos que crecen con una curvatura de 90 grados en la base, todos doblados hacia el norte, y luego siguen creciendo normalmente. Fueron plantados en 1930, pero nadie sabe por qué se deformaron así. Las teorías van desde técnicas humanas desconocidas hasta fuerzas gravitacionales anómalas. Es el único bosque así en el mundo.",
    pais: "Polonia",
    año: 1930,
    categoria: "Fenómenos",
    imagen: "/images/historia-41.svg",
    video: null
  },
  {
    id: 42,
    titulo: "La isla que apareció de la nada",
    contenido: "En 1963, pescadores islandeses vieron humo saliendo del océano. En pocas semanas, una nueva isla llamada Surtsey emergió del mar debido a actividad volcánica submarina. Lo extraño es que la isla creció exactamente según las predicciones de un científico que había calculado dónde aparecería la próxima isla 20 años antes. Nadie sabe cómo pudo predecirlo con tal precisión.",
    pais: "Islandia",
    año: 1963,
    categoria: "Fenómenos",
    imagen: "/images/historia-42.svg",
    video: null
  },
  // Nuevas historias de Exploración
  {
    id: 43,
    titulo: "El explorador que descubrió su propia muerte",
    contenido: "En 1928, el explorador ártico George Hubert Wilkins encontró su propia lápida mientras exploraba una isla remota. La lápida había sido colocada por una expedición anterior que lo dio por muerto después de que no regresara de una misión. Wilkins tomó una foto con su lápida y la envió por telegrama con el mensaje: 'Reportes de mi muerte han sido exagerados.'",
    pais: "Estados Unidos",
    año: 1928,
    categoria: "Exploración",
    imagen: "/images/historia-43.svg",
    video: null
  },
  {
    id: 44,
    titulo: "La expedición que se perdió en su propio país",
    contenido: "En 1848, la expedición de Ludwig Leichhardt para cruzar Australia desapareció completamente con sus 6 miembros, 77 caballos, 270 cabras y provisiones para 2 años. Durante 150 años se han encontrado pistas: herramientas, placas con nombres, árboles marcados, pero nunca los cuerpos. Es el misterio de exploración más grande de Australia, con más de 20 expediciones de rescate fracasadas.",
    pais: "Australia",
    año: 1848,
    categoria: "Exploración",
    imagen: "/images/historia-44.svg",
    video: null
  },
  {
    id: 45,
    titulo: "El hombre que caminó al Polo Norte equivocado",
    contenido: "En 1969, Wally Herbert caminó 3,800 kilómetros hasta lo que creía era el Polo Norte geográfico, solo para descubrir que había estado siguiendo el Polo Norte magnético, que se mueve constantemente. Había estado caminando en círculos durante 476 días. Cuando finalmente llegó al Polo Norte real, descubrió que otros exploradores habían puesto una tienda de regalos.",
    pais: "Reino Unido",
    año: 1969,
    categoria: "Exploración",
    imagen: "/images/historia-45.svg",
    video: null
  },
  {
    id: 46,
    titulo: "La isla que no existe en los mapas",
    contenido: "En 1965, el capitán James Cook cartografió Sandy Island entre Australia y Nueva Caledonia. La isla apareció en todos los mapas oficiales durante 147 años hasta 2012, cuando una expedición científica fue a estudiarla y descubrió que no existía. Solo había océano abierto de 1,400 metros de profundidad. Google Earth la eliminó en 2012, pero nadie sabe por qué estuvo en los mapas tanto tiempo.",
    pais: "Australia",
    año: 1965,
    categoria: "Exploración",
    imagen: "/images/historia-46.svg",
    video: null
  },
  {
    id: 47,
    titulo: "El explorador que vivió con caníbales",
    contenido: "En 1912, Bronisław Malinowski llegó a las Islas Trobriand para un estudio antropológico de 3 meses y se quedó 4 años. Los nativos lo adoptaron como miembro de la tribu y le enseñaron rituales secretos, incluyendo ceremonias caníbales. Cuando regresó a Londres, nadie creyó sus historias hasta que llevó pruebas fotográficas. Su diario reveló que había participado en 12 rituales caníbales.",
    pais: "Reino Unido",
    año: 1912,
    categoria: "Exploración",
    imagen: "/images/historia-47.svg",
    video: null
  },
  {
    id: 48,
    titulo: "Slenderman",
    contenido: "Siempre había sido un niño callado. No porque no tuviera nada que decir, sino porque aprendí desde muy pequeño que a veces era mejor no hablar. Especialmente cuando eres el único que ve cosas que los demás no pueden. No fue hasta años después que comprendí que lo que vi aquella noche no fue producto de mi imaginación. No fue una pesadilla. No fue mi mente jugando conmigo. Lo que vi era real. Y aún lo es.\n\nMi familia solía pasar los veranos en una vieja cabaña a las afueras de un pequeño pueblo rodeado de espesos bosques. Era el tipo de sitio que parecía existir fuera del tiempo, donde los días pasaban lentos y las noches eran tan negras como la boca de un lobo.\n\nLa primera vez que lo vi, tenía apenas ocho años.\n\nHabía salido al bosque con mi hermano mayor, David. Teníamos prohibido alejarnos demasiado, pero la curiosidad y la testarudez de un niño de diez años fueron más fuertes que cualquier advertencia de nuestros padres. Caminamos más allá del arroyo, hasta donde los árboles se volvían más altos y las sombras más profundas. Recuerdo que el aire se sentía denso, pesado, como si algo invisible se arrastrara entre los troncos centenarios.\n\nEntonces, lo vi.\n\nAl principio, pensé que era un árbol. Un tronco pálido y delgado que se erguía entre la maleza. Pero cuando mis ojos se acostumbraron a la penumbra, noté la diferencia. Aquello tenía brazos, brazos largos y huesudos que colgaban a los lados de su cuerpo como serpientes dormidas. No tenía rostro, solo una extensión lisa y blanca donde deberían haber estado los ojos, la nariz y la boca. Y lo peor de todo…\n\nNos estaba observando.\n\nMi respiración se volvió errática. Me giré para avisar a David, pero cuando volví la vista, la figura ya no estaba. No dije nada en ese momento. Quizá fue el miedo, quizá la negación. Pero no sería la última vez que lo vería.\n\nA medida que pasaban los días, comenzaron a ocurrir cosas extrañas. Sombras que se deslizaban por la ventana de mi habitación, una sensación constante de ser observado, susurros en la noche que parecían provenir del bosque. Mi madre decía que eran solo sueños, que la oscuridad y la soledad del campo hacían que mi imaginación jugara en mi contra. Mi padre, en cambio, apenas me miraba cuando hablaba de ello. Como si temiera que mis palabras fueran verdad.\n\nEl punto de quiebre llegó la noche en que David desapareció.\n\nEra tarde, y el viento golpeaba las ventanas de la cabaña como si tratara de advertirnos de algo. Mi madre dormía en el sofá, agotada después de un largo día, y mi padre no estaba en casa. David dijo que solo iba a salir un momento, que escuchó algo en el bosque y quería comprobarlo. Me pidió que no le dijera a mamá. Y yo, como siempre, obedecí.\n\nPasaron los minutos. Luego una hora. Luego dos.\n\nCuando mis padres se dieron cuenta de su ausencia, el pueblo entero se volcó en su búsqueda. Pasaron días y semanas sin rastro de él. Al final, lo dieron por muerto. Pero yo sabía la verdad. Sabía quién se lo había llevado.\n\nHan pasado más de veinte años desde aquella noche, pero los recuerdos siguen frescos en mi mente. Con el tiempo, comencé a investigar. Descubrí que lo que vi tiene un nombre. Algunos lo llaman El Hombre Delgado. Otros lo conocen como Slenderman. Una entidad de origen desconocido, vista desde hace siglos en pinturas y relatos antiguos. Aparece en bosques, cerca de niños y adolescentes, acechando desde la oscuridad hasta que decide tomar a su víctima. Nadie sabe a dónde los lleva. Nadie los vuelve a ver.\n\nAlgunas personas dicen que es una manifestación del miedo mismo, un ser que se alimenta de nuestra ansiedad y nuestra desesperación. Otros creen que es una criatura de otra dimensión, que se desliza entre los espacios de nuestra realidad, siempre observando, siempre esperando.\n\nLo que sí sé es que no importa cuánto corras. No importa cuánto trates de olvidar. Si alguna vez lo has visto, nunca te dejará ir.\n\nLo sé porque hace unos días, cuando miré por la ventana de mi apartamento en la ciudad, lo vi.\n\nDe pie, en la esquina de la calle, entre las farolas parpadeantes.\n\nMirándome.\n\nEsperando.",
    pais: "Estados Unidos",
    año: 2009,
    categoria: "Creepypasta",
    imagen: "/images/slenderman.jpg",
    video: null
  },
  {
    id: 49,
    titulo: "Jeff The Killer",
    contenido: "No sé cuánto tiempo más pueda seguir ocultando esto. Escribirlo no lo hará menos real, pero tal vez me ayude a comprender qué pasó aquella noche… la noche en que vi a Jeff.\n\nTodo comenzó en los suburbios, en una casa común y corriente. Nadie esperaba que algo tan espantoso se gestara allí. Jeff era un chico normal… o eso parecía. Vivía con sus padres y su hermano, Lou. Nadie prestaba demasiada atención al chico de piel pálida y ojos hundidos, hasta que comenzaron los rumores.\n\nDicen que todo cambió cuando Jeff y Lou se toparon con un grupo de matones. Una pelea estalló, y aunque Lou intentó protegerlo, fue Jeff quien perdió el control. Algo oscuro despertó en él. Golpeó a los agresores con una furia inhumana, como si algo dentro de él hubiera estado esperando salir. Pero lo peor vino después.\n\nUno de los matones sacó una navaja. La pelea se tornó brutal, caótica. Jeff se cubrió la cara cuando una llamarada de alcohol y fuego envolvió su piel. Cuando despertó en el hospital, algo en su rostro había cambiado para siempre.\n\nLos médicos hicieron lo posible. Su piel estaba pálida, su sonrisa parecía haber quedado grabada en su rostro, y sus ojos… sus ojos nunca volvieron a cerrarse. La noche en que Jeff volvió a casa fue la última noche normal de su familia. Se encerró en el baño, riendo en la penumbra. Se miró en el espejo y tomó un cuchillo.\n\n—¡Es hermoso! —murmuró mientras cortaba sus mejillas más allá de la quemadura. No quería dejar de sonreír. Nunca más.\n\nEsa noche, su madre escuchó ruidos y fue a revisar. Encontró a su hijo de pie en la oscuridad, con el rostro cubierto de sangre y esos ojos abiertos, inhumanos.\n\n—Jeff… ¿estás bien?\n\nÉl la miró. Sonrió.\n\n—Nunca me he sentido mejor.\n\nLa cuchilla se hundió en la carne de su madre antes de que pudiera gritar. Su padre corrió escaleras arriba, solo para encontrar la misma sonrisa esperándolo en la penumbra. Lou fue el último. Cuando abrió los ojos, su hermano estaba allí, cuchillo en mano.\n\n—Shhh… —susurró Jeff, inclinándose sobre él—. Ve a dormir.\n\nDesde aquella noche, Jeff desapareció. Dicen que aún está ahí fuera, escondido en las sombras, esperando a que la luz se apague. Si alguna vez despiertas en medio de la noche y sientes que alguien te observa… si ves una sonrisa dibujada en la oscuridad… Corre. No mires atrás.\n\nPorque Jeff the Killer ya ha elegido su próxima víctima.",
    pais: "Estados Unidos",
    año: 2008,
    categoria: "Creepypasta",
    imagen: "/images/jeff-the-killer.jpg",
    video: null
  },
  {
    id: 50,
    titulo: "The Russian Sleep Experiment",
    contenido: "Hay historias que deberían permanecer en el olvido. Relatos enterrados en archivos que nadie debería desenterrar. Pero lo que voy a contarte ahora no es solo una historia. Es un hecho, un experimento real… y una advertencia.\n\nCorría la década de 1940, en plena Guerra Fría. La Unión Soviética buscaba cualquier ventaja, cualquier arma que pudiera darles el control definitivo. Fue así como un grupo de científicos militares recibió órdenes de probar un gas experimental diseñado para mantener despiertos a los soldados durante días. El objetivo: eliminar la necesidad de dormir y crear guerreros imparables.\n\nSeleccionaron a cinco prisioneros políticos. Enemigos del Estado, traidores… desechables. Fueron encerrados en una habitación hermética, con provisiones para un mes y un sistema de micrófonos y ventanas de observación unidireccionales. El gas comenzó a fluir. Al principio, todo salió como se esperaba.\n\nEl primer día, los prisioneros conversaban normalmente. Al tercer día, comenzaron a hablar en susurros, a murmurar cosas sin sentido. Al quinto día, la paranoia se instaló en la habitación. Se acusaban unos a otros de conspirar con los investigadores. Al noveno día, todo se tornó en silencio.\n\nLos científicos temieron lo peor. La única señal de vida eran los monitores cardíacos: latidos irregulares, pero presentes. Las cámaras no mostraban movimiento, y los micrófonos solo captaban un leve sonido, como si alguien estuviera raspando las paredes.\n\nEl día 15, se tomó la decisión de abrir la cámara. Cuando el gas fue retirado y la puerta se abrió… lo que encontraron dentro fue algo que ningún ser humano debería ver.\n\nLos prisioneros ya no eran hombres. Sus cuerpos estaban destrozados, con la piel arrancada en tiras y la carne expuesta. No por la tortura, no por el gas… ellos mismos se habían mutilado. Uno de ellos yacía muerto, con el abdomen abierto y los órganos dispersos como si hubiera intentado devorarse a sí mismo.\n\nLos demás, aún vivos, miraron a los científicos con ojos inyectados en sangre. No intentaron escapar. Solo sonrieron y dijeron:\n\n—Necesitamos más gas…\n\nLos soldados recibieron la orden de ejecutarlos, pero los prisioneros lucharon con una fuerza inhumana. No dormían, no sentían dolor. Uno de ellos, con la mandíbula colgando, susurró antes de ser abatido:\n\n—Somos ustedes… somos lo que ocultan en la oscuridad… lo que siempre hemos sido.\n\nEl último sobreviviente fue atado a una camilla para estudiarlo. Un científico, horrorizado, le preguntó:\n\n—¿Qué eres?\n\nLa criatura sonrió con sus labios desgarrados.\n\n—¿Ya lo has olvidado? Somos la locura que acecha en tu interior. Somos lo que ocurre cuando cierras los ojos… y nunca más vuelves a abrirlos.\n\nY con una última carcajada, el prisionero fue ejecutado.",
    pais: "Rusia",
    año: 1940,
    categoria: "Creepypasta",
    imagen: "/images/the-russian-sleep-experiment.jpg.jpg",
    video: null
  },
  {
    id: 51,
    titulo: "Canal 21: El programa que nunca debió existir",
    contenido: "Cuando era niño, solía ver televisión todos los días después de la escuela. Era 1999 y en aquel entonces no teníamos acceso a internet como ahora, así que la TV era mi mundo. Vivía en una pequeña ciudad de Canadá, y aunque los canales principales eran los de siempre, había una estación local que captaba mi interés: el canal 21.\n\nNo tenía anuncios, no salía en ninguna guía de programación y, sin embargo, transmitía programas para niños. O al menos, eso parecía al principio.\n\nMi memoria sobre el canal 21 es confusa. Recuerdo que la señal era débil y la calidad de imagen, pésima. Pero algo en esos programas me mantenía enganchado. No había música de fondo, los decorados eran básicos, y los personajes… bueno, no parecían exactamente actores.\n\nPor mucho tiempo pensé que todo era imaginación de un niño aburrido. Hasta que comencé a investigar.\n\nY descubrí que no fui el único que vio esos programas.\n\nUno de los primeros programas que recuerdo se llamaba Booby y trataba de una marioneta con forma de mano que «enseñaba» a los niños sobre la vida. La marioneta era tosca, con ojos de botón mal cosidos y una boca desproporcionada. No hablaba con fluidez, sino que tartamudeaba y hacía pausas extrañas entre frases.\n\nEl episodio que más recuerdo era sobre la «amistad». En él, Booby sostenía una muñeca de trapo e insistía en que era su amiga. Pero cuando la muñeca «intentaba escapar», Booby gritaba con voz distorsionada y la golpeaba contra la mesa hasta que su cabeza se desprendió.\n\nEl episodio terminó abruptamente.\n\nOtro programa se llamaba Mr. Bear's Cellar, y ese es el que más me atormenta. Era un show de acción real protagonizado por alguien con un disfraz de oso marrón. Mr. Bear vivía en un sótano oscuro y hablaba con los niños que lo visitaban. Pero lo extraño era que los niños nunca respondían.\n\nEn un episodio, Mr. Bear le dijo a un niño que se acercara para «un abrazo de oso». El niño, visiblemente incómodo, dio un paso adelante y la pantalla se cortó a negro. La siguiente escena mostraba al oso sentado solo, balanceándose lentamente y murmurando algo ininteligible.\n\nLa imagen se volvió borrosa y la transmisión terminó. Pero lo peor vino después.\n\nAños después, cuando ya era adolescente, busqué información sobre el canal 21. No encontré registros oficiales. Parecía como si nunca hubiera existido.\n\nHasta que descubrí un viejo artículo de 2001.\n\nEl titular decía: «Hombre arrestado por secuestrar y abusar de niños en los años 90».\n\nEl hombre era de mi ciudad. Se hacía llamar Mr. Bear.\n\nLa policía encontró cintas en su casa, grabaciones de su «programa» en las que invitaba a niños reales a su sótano. La mayoría de los niños desaparecidos nunca fueron encontrados.\n\nDecían que algunos episodios eran tan perturbadores que nunca se hicieron públicos.\n\nMi sangre se heló al leer que la última víctima documentada de Mr. Bear desapareció en 1999.\n\nEl mismo año en que yo veía el canal 21.\n\nAterrado, busqué en mi antigua caja de recuerdos. Había guardado dibujos, juguetes… y cartas de cuando era niño. Y allí estaba.\n\nUn sobre amarillento con una caligrafía infantil en la parte delantera:\n\n«Para mi amigo especial.»\n\nMis manos temblaban mientras abría la carta. Dentro, había un mensaje escrito con crayón rojo.\n\n«Hola, amiguito. Espero que estés bien. Me hubiera gustado verte en mi sótano. Pero no te preocupes… algún día podremos jugar juntos.\n— Mr. Bear.»\n\nNunca la había leído antes. No recordaba haberla recibido.\n\nY lo peor… No sé cómo llegó a mi casa.\n\nDesde entonces, he intentado olvidarlo. Pero hace unas semanas, en un foro de casos sin resolver, alguien publicó un mensaje aterrador:\n\n«¿Alguien recuerda el canal 21? Creo que está de vuelta.»\n\nAdjuntaba un enlace a un video subido hace solo unos días.\n\nEra un fragmento de Mr. Bear's Cellar. La misma calidad mala, el mismo sótano oscuro.\n\nPero esta vez, Mr. Bear miraba directamente a la cámara. Y decía:\n\n«Bienvenido de nuevo, amiguito. Te he estado esperando.»",
    pais: "Canadá",
    año: 1999,
    categoria: "Creepypasta",
    imagen: "/images/1999.jpg",
    video: null
  }
]

export default historias;