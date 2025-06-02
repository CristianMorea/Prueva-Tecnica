const { detectLanguage } = require('../services/languageDetectionService'); 
const { readPdfFile } = require('../services/fileService');

const detectLanguageFromFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let text;
    const { mimetype, path, buffer } = req.file;

    if (mimetype === 'application/pdf') {
      text = await readPdfFile(path);
    } else if (mimetype === 'text/plain') {
      text = buffer.toString('utf8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Cambié aquí para que no anide el objeto
    const language = await detectLanguage(text);
    res.json({ language });
  } catch (error) {
    res.status(500).json({ 
      error: error.message.includes('PDF') ? 'Invalid PDF structure' : error.message 
    });
  }
};

module.exports = { detectLanguageFromFile };
