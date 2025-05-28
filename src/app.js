const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const summaryRoutes = require('./routes/summaryRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1/summarize', summaryRoutes);

// Usar el puerto dinámico proporcionado por Render
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
