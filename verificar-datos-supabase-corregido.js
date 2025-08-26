require("dotenv").config();
const axios = require("axios");

// Obtener credenciales de Supabase desde variables de entorno
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("[ERROR] Las variables de entorno SUPABASE_URL y SUPABASE_KEY son necesarias.");
  console.error("Por favor, asegúrate de que el archivo .env contiene estas variables.");
  process.exit(1);
}

// Función para realizar consultas a la API de Supabase
async function consultarTabla(tabla) {
  try {
    const response = await axios({
      method: "get",
      url: SUPABASE_URL + "/rest/v1/" + tabla + "?select=count&limit=0",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json"
      }
    });

    if (response.status === 200) {
      return true;
    } else {
      console.error("[ERROR] Error consultando la tabla " + tabla + ": " + response.statusText);
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error("[ERROR] La tabla \"" + tabla + "\" no existe en la base de datos.");
    } else {
      console.error("[ERROR] Error consultando la tabla " + tabla + ": " + (error.message || "Error desconocido"));
    }
    return false;
  }
}

// Función para contar registros en una tabla
async function contarRegistros(tabla) {
  try {
    const response = await axios({
      method: "get",
      url: SUPABASE_URL + "/rest/v1/" + tabla + "?select=count",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json",
        "Prefer": "count=exact"
      }
    });

    if (response.status === 200) {
      const count = response.headers["content-range"] ? 
                    response.headers["content-range"].split("/")[1] : 
                    response.data.length;
      return parseInt(count);
    } else {
      console.error("[ERROR] Error contando registros en " + tabla + ": " + response.statusText);
      return 0;
    }
  } catch (error) {
    console.error("[ERROR] Error contando registros en " + tabla + ": " + (error.message || "Error desconocido"));
    return 0;
  }
}

// Función principal
async function verificarDatos() {
  console.log("[INFO] Verificando datos en Supabase...");

  const tablas = ["historias", "comentarios", "story_interactions"];
  let todasExisten = true;
  let datosFaltantes = false;

  // Verificar que todas las tablas existen
  for (const tabla of tablas) {
    const existe = await consultarTabla(tabla);
    
    if (existe) {
      const count = await contarRegistros(tabla);
      console.log("[OK] Tabla \"" + tabla + "\" encontrada con " + count + " registros");
      
      if (count === 0) {
        datosFaltantes = true;
        console.log("[AVISO] La tabla \"" + tabla + "\" no contiene registros");
      }
    } else {
      todasExisten = false;
    }
  }

  if (!todasExisten) {
    console.error("[ERROR] No se pudieron verificar todas las tablas necesarias.");
    process.exit(1);
  } else if (datosFaltantes) {
    console.log("[AVISO] Algunas tablas no tienen datos.");
    console.log("[INFO] Puedes insertar datos de ejemplo manualmente usando el SQL generado.");
    process.exit(0);
  } else {
    console.log("[OK] Todas las tablas existen y contienen datos.");
    process.exit(0);
  }
}

verificarDatos().catch(err => {
  console.error("[ERROR] Error inesperado:", err);
  process.exit(1);
});
