 
//translationService.js 
require('dotenv').config();
const { HfInference } = require('@huggingface/inference');
const pdfService = require('./pdfservice');
const fileService = require('./fileService');

class TranslationService {
  constructor(hfClient = new HfInference(process.env.HUGGINGFACE_API_KEY)) {
    this.hf = hfClient;
    this.defaultModel = 'Helsinki-NLP/opus-mt-mul-en';
    this.supportedLanguages = {
      en: 'English', es: 'Spanish', fr: 'French', de: 'German',
      it: 'Italian', pt: 'Portuguese', ru: 'Russian', zh: 'Chinese',
      ja: 'Japanese', ko: 'Korean', ar: 'Arabic', hi: 'Hindi',
      nl: 'Dutch', sv: 'Swedish', no: 'Norwegian', da: 'Danish',
      fi: 'Finnish', pl: 'Polish', tr: 'Turkish', he: 'Hebrew'
    };
  }

  getSupportedLanguages() {
    return {
      success: true,
      languages: this.supportedLanguages,
      totalLanguages: Object.keys(this.supportedLanguages).length
    };
  }

  cleanText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/([.?!])(?=[^\s])/g, '$1 ')
      .trim();
  }

  getTranslationModel(sourceLang, targetLang) {
    const modelMap = {
      'es-en': 'Helsinki-NLP/opus-mt-es-en',
      'en-es': 'Helsinki-NLP/opus-mt-en-es',
      'fr-en': 'Helsinki-NLP/opus-mt-fr-en',
      'en-fr': 'Helsinki-NLP/opus-mt-en-fr',
      'de-en': 'Helsinki-NLP/opus-mt-de-en',
      'en-de': 'Helsinki-NLP/opus-mt-en-de',
      'it-en': 'Helsinki-NLP/opus-mt-it-en',
      'en-it': 'Helsinki-NLP/opus-mt-en-it',
      'pt-en': 'Helsinki-NLP/opus-mt-pt-en',
      'en-pt': 'Helsinki-NLP/opus-mt-en-pt',
      'ru-en': 'Helsinki-NLP/opus-mt-ru-en',
      'en-ru': 'Helsinki-NLP/opus-mt-en-ru'
    };

    const source = sourceLang === 'auto' ? 'mul' : sourceLang;
    const pair = `${source}-${targetLang}`;
    return modelMap[pair] || this.defaultModel;
  }

  async translateText(text, targetLanguage, sourceLanguage = 'auto') {
    try {
      if (!text || !targetLanguage) {
        throw new Error('Text and target language are required');
      }
      if (!this.supportedLanguages[targetLanguage]) {
        throw new Error(`Target language '${targetLanguage}' not supported`);
      }

      const clean = this.cleanText(text);
      const model = this.getTranslationModel(sourceLanguage, targetLanguage);

      const response = await this.hf.translation({
        model,
        inputs: clean
      });

      const resultText = Array.isArray(response) ? response[0]?.translation_text : response.translation_text;

      return {
        success: true,
        translatedText: resultText
      };
    } catch (error) {
      const message = error.message.includes('API error') ? 'API error' : error.message;
      return {
        success: false,
        error: message
      };
    }
  }

  splitTextIntoChunks(text, maxLength = 450) {
    const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [text];
    const chunks = [];
    let chunk = '';

    for (const sentence of sentences) {
      const sentenceClean = sentence.trim();
      if ((chunk + sentenceClean).length <= maxLength) {
        chunk += sentenceClean + ' ';
      } else {
        if (chunk) chunks.push(chunk.trim());
        chunk = sentenceClean + ' ';
      }
    }

    if (chunk) chunks.push(chunk.trim());
    return chunks;
  }

  async translateLongText(text, targetLanguage, sourceLanguage = 'auto') {
    let results = [];
    const startTime = Date.now();

    try {
      const chunks = this.splitTextIntoChunks(text);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const res = await this.translateText(chunk, targetLanguage, sourceLanguage);
        if (!res.success) {
          throw new Error(`Error processing chunk ${i + 1}: ${res.error}`);
        }
        results.push(res.translatedText);
        await new Promise(r => setTimeout(r, 100));
      }

      return {
        success: true,
        translatedText: results.join(' '),
        chunksProcessed: chunks.length,
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        partialResult: results.join(' ')
      };
    }
  }

  // ✅ NUEVO: Traducción de archivos (PDF o TXT)
  async translateFile(file, targetLanguage, sourceLanguage = 'auto') {
    const { buffer, mimetype } = file;
    let text;

    if (mimetype === 'application/pdf') {
      text = await pdfService.extractTextFromPDFBuffer(buffer);
    } else if (mimetype === 'text/plain') {
      text = buffer.toString('utf-8');
    } else {
      throw new Error('Tipo de archivo no soportado');
    }

    return await this.translateLongText(text, targetLanguage, sourceLanguage);
  }

  // ✅ NUEVO: Versión ligera (sin dividir texto)
  async translateFileLight(file, targetLanguage, sourceLanguage = 'auto') {
    const { buffer, mimetype } = file;
    let text;

    if (mimetype === 'application/pdf') {
      text = await pdfService.extractTextFromPDFBuffer(buffer);
    } else if (mimetype === 'text/plain') {
      text = buffer.toString('utf-8');
    } else {
      throw new Error('Tipo de archivo no soportado');
    }

    return await this.translateText(text, targetLanguage, sourceLanguage);
  }
}

module.exports = TranslationService;
