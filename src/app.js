// app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Cargar variables de entorno
dotenv.config();

// Importar rutas
const summaryRoutes = require('./routes/summaryRoutes');
const languageRoutes = require("./routes/languageRoutes");
const translationRoutes = require('./routes/translationRoutes');

const app = express();

// Configurar CORS
app.use(cors());

// Rate limiting (opcional para producción)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana de tiempo
  message: {
    success: false,
    message: 'Demasiadas solicitudes, intenta de nuevo más tarde',
    error: 'RATE_LIMIT_EXCEEDED'
  }
});

// Aplicar rate limiting solo en producción
if (process.env.NODE_ENV === 'production') {
  app.use('/api/', limiter);
}

// Middleware para parsing de JSON y URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para logging de requests (en desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Rutas principales
app.use('/api/v1/summarize', summaryRoutes);
app.use("/api/v1/language", languageRoutes);
app.use('/api/v1/translation', translationRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0'
  });
});

// Middleware para manejar rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error global:', error);

  // Error de JSON malformado
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'JSON malformado en el cuerpo de la solicitud',
      error: 'INVALID_JSON'
    });
  }

  // Error de payload demasiado grande
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Archivo demasiado grande. Tamaño máximo: 10MB',
      error: 'FILE_TOO_LARGE'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
  });
});

// NO arrancar el servidor aquí

module.exports = app;
