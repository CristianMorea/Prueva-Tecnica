const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const summaryRoutes = require('./routes/summaryRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1/summarize', summaryRoutes);

const PORT = process.env.PORT || 10000;
const ENV = process.env.NODE_ENV || 'development';

// Puedes guardar la URL pública en una variable de entorno o usarla directamente aquí
const PUBLIC_URL = process.env.RENDER_EXTERNAL_URL || 'https://prueva-tecnica.onrender.com';

app.listen(PORT, '0.0.0.0', () => {
  if (ENV === 'production') {
    console.log(`🚀 Servidor desplegado en producción en: ${PUBLIC_URL}`);
  } else {
    console.log(`🚀 Servidor corriendo en modo ${ENV} en http://localhost:${PORT}`);
  }
});
