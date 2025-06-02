//traslationContoller
const TranslationService = require('../services/translationService');

exports.getSupportedLanguages = async (req, res, next) => {
  try {
    const service = new TranslationService();
    const result = await service.getSupportedLanguages();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.translateText = async (req, res, next) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'auto' } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Texto y idioma de destino son requeridos',
      });
    }

    const service = new TranslationService();
    const result = await service.translateLongText(text, targetLanguage, sourceLanguage);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.translateFile = async (req, res, next) => {
  try {
    const file = req.file;
    const { targetLanguage, sourceLanguage = 'auto' } = req.body;

    if (!file || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Archivo y idioma de destino son requeridos',
      });
    }

    const service = new TranslationService();
    const result = await service.translateFile(file, targetLanguage, sourceLanguage);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.translateFileLight = async (req, res, next) => {
  try {
    const file = req.file;
    const { targetLanguage, sourceLanguage = 'auto' } = req.body;

    if (!file || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Archivo y idioma de destino son requeridos',
      });
    }

    const service = new TranslationService();
    const result = await service.translateFileLight(file, targetLanguage, sourceLanguage);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
