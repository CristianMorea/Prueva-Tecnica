const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const summaryRoutes = require('./routes/summaryRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1/summarize', summaryRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
