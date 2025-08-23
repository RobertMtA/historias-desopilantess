const {onRequest} = require("firebase-functions/v2/https");
const {logger} = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const {Pool} = require("pg");

// Configuración de PostgreSQL para Railway
const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || "postgres", 
  password: process.env.PGPASSWORD || "password",
  database: process.env.PGDATABASE || "historias_db",
  ssl: process.env.NODE_ENV === "production" ? 
    {rejectUnauthorized: false} : false,
});

// Configuración CORS
const corsOptions = {
  origin: [
    "https://histostorias-desopilantes.web.app",
    "https://histostorias-desopilantes.firebaseapp.com",
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:4000",
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

// Función para el test de API
exports.test = onRequest((request, response) => {
  // Configurar CORS
  const origin = request.get("origin");
  if (corsOptions.origin.includes(origin)) {
    response.set("Access-Control-Allow-Origin", origin);
  }
  response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.set("Access-Control-Allow-Credentials", "true");

  if (request.method === "OPTIONS") {
    response.status(200).send();
    return;
  }

  logger.info("API test endpoint called", {structuredData: true});
  response.json({
    status: "success",
    message: "API funcionando correctamente con Firebase Functions",
    timestamp: new Date().toISOString(),
  });
});

// Función para el formulario de contacto
exports.contact = onRequest((request, response) => {
  // Configurar CORS
  const origin = request.get("origin");
  if (corsOptions.origin.includes(origin)) {
    response.set("Access-Control-Allow-Origin", origin);
  }
  response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.set("Access-Control-Allow-Credentials", "true");

  if (request.method === "OPTIONS") {
    response.status(200).send();
    return;
  }

  if (request.method === "POST") {
    const {name, email, message} = request.body;

    // Log del formulario para debugging
    logger.info("Formulario de contacto enviado", {
      name,
      email,
      message: message ? message.substring(0, 100) + "..." : "Sin mensaje",
      structuredData: true,
    });

    // Simular procesamiento (aquí podrías enviar email, etc.)
    response.json({
      status: "success",
      message: "Mensaje enviado correctamente",
      data: {name, email},
    });
  } else {
    response.status(405).json({
      status: "error",
      message: "Método no permitido",
    });
  }
});
