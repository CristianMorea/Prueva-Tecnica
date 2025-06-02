const { queryHuggingFaceModel } = require("../config/huggingface");

const MODEL = 'facebook/fasttext-language-identification';

const detectLanguage = async (text) => {
  try {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error("Texto inválido o vacío");
    }

    const cleanText = text.trim().substring(0, 500);

    console.log(`🔍 Detectando idioma para texto: "${cleanText.substring(0, 100)}..."`);

    const result = await queryHuggingFaceModel(MODEL, {
      inputs: cleanText
    });

    console.log('📊 Respuesta del modelo:', JSON.stringify(result, null, 2));

    if (!Array.isArray(result) || result.length === 0) {
      return detectLanguageFallback(cleanText);
    }

    const topResult = result[0];
    if (!topResult || !topResult.label || typeof topResult.score !== 'number') {
      return detectLanguageFallback(cleanText);
    }

    const detectedLanguage = topResult.label.toLowerCase();
    const confidence = (topResult.score * 100).toFixed(2);

    console.log(`✅ Idioma detectado: ${detectedLanguage} (${confidence}%)`);

    return detectedLanguage;
  } catch (error) {
    console.error("❌ Error detectando idioma:", error.message);
    console.log("🔄 Usando detección de idioma de respaldo...");
    return detectLanguageFallback(text);
  }
};

const detectLanguageFallback = (text) => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return 'en'; // valor por defecto
  }

  const lowerText = text.toLocaleLowerCase();

  const spanishPatterns = [
    /\b(el|la|los|las|un|una|de|del|que|es|en|con|por|para|su|sus|se|te|me|le|lo|al|pero|como|más|muy|todo|toda|todos|todas|este|esta|estos|estas|ese|esa|esos|esas|aquel|aquella|aquellos|aquellas|y|o|si|no|sí|también|además|porque|cuando|donde|cómo|qué|quién|cuál|cuáles|cuándo|dónde|por qué|para qué)\b/g,
    /ción\b/g,
    /dad\b/g,
    /mente\b/g
  ];

  const englishPatterns = [
    /\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by|from|this|that|these|those|is|are|was|were|be|being|been|have|has|had|do|does|did|will|would|can|could|should|shall|may|might|must|i|you|he|she|it|we|they|my|your|his|her|our|their|me|him|her|us|them|hello|world)\b/g,
    /ing\b/g,
    /ed\b/g,
    /tion\b/g,
    /ness\b/g
  ];

  let spanishScore = 0;
  let englishScore = 0;

  spanishPatterns.forEach(pattern => {
    const matches = lowerText.match(pattern);
    if (matches) spanishScore += matches.length;
  });

  englishPatterns.forEach(pattern => {
    const matches = lowerText.match(pattern);
    if (matches) englishScore += matches.length;
  });

  if (/[ñáéíóúü]/.test(lowerText)) {
    spanishScore += 10;
  }

  console.log(`📊 Puntuación fallback - Español: ${spanishScore}, Inglés: ${englishScore}`);

  if (spanishScore > englishScore) {
    console.log("✅ Idioma detectado (fallback): es");
    return 'es';
  } else if (englishScore > spanishScore) {
    console.log("✅ Idioma detectado (fallback): en");
    return 'en';
  } else {
    console.log("✅ Idioma detectado (fallback - empate): en");
    return 'en'; // valor por defecto coherente
  }
};

module.exports = {
  detectLanguage,
  detectLanguageFallback
};
