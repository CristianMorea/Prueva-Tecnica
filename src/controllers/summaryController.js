const fs = require('fs');
const path = require('path');
const { extractTextFromPDF } = require('../services/pdfservice');
const summarizeText = require('../services/summarizerService');

const MAX_CHUNK_LENGTH = 1000; // Máximo de caracteres por fragmento

// Función para limpiar texto
function cleanText(text) {
  return text
    .replace(/[\r\n\t]+/g, ' ') // quitar saltos de línea y tabs
    .replace(/\s+/g, ' ')        // múltiples espacios por uno solo
    .trim();
}

// Función para dividir texto en fragmentos
function splitTextIntoChunks(text, maxLength) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = start + maxLength;

    // Para no cortar palabras, buscamos espacio antes de cortar
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(' ', end);
      if (lastSpace > start) {
        end = lastSpace;
      }
    }

    const chunk = text.slice(start, end);
    chunks.push(chunk.trim());
    start = end;
  }
  return chunks;
}

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
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: "Formato no soportado. Solo PDF o TXT" });
    }

    // Limpiar texto
    const textoLimpio = cleanText(text);
    if (!textoLimpio) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: "El texto no contiene contenido válido para resumir" });
    }

    // Dividir texto en fragmentos
    const chunks = splitTextIntoChunks(textoLimpio, MAX_CHUNK_LENGTH);

    // Resumir cada fragmento y concatenar resúmenes
    let resumenFinal = '';
    for (const chunk of chunks) {
      const resumenChunk = await summarizeText(chunk);
      resumenFinal += resumenChunk + ' ';
    }

    resumenFinal = resumenFinal.trim();

    fs.unlinkSync(file.path); // Eliminar archivo temporal

    return res.json({ resumen: resumenFinal });
  } catch (err) {
    console.error("Error al generar resumen:", err);
    return res.status(500).json({ message: "Error interno del servidor", error: err.message });
  }
};
