const fs = require('fs');
const path = require('path');
const { extractTextFromPDF } = require('./services/pdfservice');
const summarizeText = require('./services/summarizerService');

exports.summarizeFile = async (req, res) => {
  try {
    const file = req.file;

    if (!file) return res.status(400).json({ message: "Archivo no proporcionado" });

    const ext = path.extname(file.originalname).toLowerCase();
    let text = '';

    if (ext === '.pdf') {
      text = await extractTextFromPDF(file.path);
    } else if (ext === '.txt') {
      text = fs.readFileSync(file.path, 'utf-8');
    } else {
      return res.status(400).json({ message: "Formato no soportado. Solo PDF o TXT" });
    }

    const trimmedText = text.slice(0, 2000); // Limita tamaño para la API
    const resumen = await summarizeText(trimmedText);

    fs.unlinkSync(file.path); // Borra archivo temporal

    return res.json({ resumen });
  } catch (err) {
    console.error("Error al generar resumen:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
