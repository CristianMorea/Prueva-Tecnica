require('dotenv').config();
const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

class TranslationService {
    constructor() {
        this.defaultModel = 'Helsinki-NLP/opus-mt-mul-en'; // Fallback
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
            .replace(/\s+/g, ' ')          // espacios múltiples -> uno
            .replace(/([.?!])(?=[^\s])/g, '$1 ') // asegúrate de que haya un espacio después de puntuación
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
            if (!text || !targetLanguage) throw new Error('Texto o idioma destino inválido');
            if (!this.supportedLanguages[targetLanguage]) throw new Error(`Idioma destino '${targetLanguage}' no soportado`);

            const clean = this.cleanText(text);
            const model = this.getTranslationModel(sourceLanguage, targetLanguage);
            
            const response = await hf.translation({
                model,
                inputs: clean,
                parameters: {
                    tgt_lang: targetLanguage
                }
            });

            const resultText = Array.isArray(response) ? response[0]?.translation_text : response.translation_text;

            return {
                success: true,
                originalText: text,
                translatedText: resultText,
                sourceLanguage,
                targetLanguage,
                targetLanguageName: this.supportedLanguages[targetLanguage]
            };
        } catch (error) {
            console.error('Error en traducción:', error);
            return {
                success: false,
                error: error.message || 'Error en el servicio de traducción',
                originalText: text
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
        try {
            const chunks = this.splitTextIntoChunks(text);
            const results = [];

            for (const chunk of chunks) {
                const res = await this.translateText(chunk, targetLanguage, sourceLanguage);
                if (!res.success) throw new Error(`Error en chunk: ${res.error}`);
                results.push(res.translatedText);
                await new Promise(r => setTimeout(r, 100)); // Pausa para evitar rate limiting
            }

            return {
                success: true,
                originalText: text,
                translatedText: results.join(' '),
                sourceLanguage,
                targetLanguage,
                targetLanguageName: this.supportedLanguages[targetLanguage],
                chunksProcessed: chunks.length
            };
        } catch (error) {
            console.error('Error en traducción larga:', error);
            return {
                success: false,
                error: error.message || 'Error en traducción larga',
                originalText: text
            };
        }
    }
}

module.exports = new TranslationService();
