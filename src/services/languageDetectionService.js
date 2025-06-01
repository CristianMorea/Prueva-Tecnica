// languageDetectionService
const { queryHuggingFaceModel } = require("../config/huggingface");

// Modelo alternativo más confiable para detección de idioma
const MODEL = 'facebook/fasttext-language-identification';

/**
 * Detecta el idioma de un texto usando Hugging Face
 * @param {string} text - Texto a analizar
 * @returns {Promise<string>} - Código de idioma detectado (ej: 'es', 'en')
 */
const detectLanguage = async (text) => {
  try {
    // Validar entrada
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error("Texto inválido o vacío");
    }

    // Limpiar y truncar texto si es muy largo
    const cleanText = text.trim().substring(0, 500);
    
    console.log(`🔍 Detectando idioma para texto: "${cleanText.substring(0, 100)}..."`);
    
    const result = await queryHuggingFaceModel(MODEL, {
      inputs: cleanText
    });

    console.log('📊 Respuesta del modelo:', JSON.stringify(result, null, 2));

    // Verificar formato de respuesta
    if (!result || !Array.isArray(result) || result.length === 0) {
      // Fallback: detectar idioma manualmente para casos comunes
      return detectLanguageFallback(cleanText);
    }

    // Obtener el idioma con mayor confianza
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
    
    // Fallback en caso de error
    console.log("🔄 Usando detección de idioma de respaldo...");
    return detectLanguageFallback(text);
  }
};

/**
 * Detección de idioma de respaldo usando patrones simples
 * @param {string} text - Texto a analizar
 * @returns {string} - Código de idioma detectado
 */
const detectLanguageFallback = (text) => {
  if (!text || text.trim().length === 0) {
    return 'en'; // Idioma por defecto
  }

  const lowerText = text.toLowerCase();
  
  // Patrones comunes para español
  const spanishPatterns = [
    /\b(el|la|los|las|un|una|de|del|que|es|en|con|por|para|su|sus|se|te|me|le|lo|al|pero|como|más|muy|todo|toda|todos|todas|este|esta|estos|estas|ese|esa|esos|esas|aquel|aquella|aquellos|aquellas|y|o|si|no|sí|también|además|porque|cuando|donde|cómo|qué|quién|cuál|cuáles|cuándo|dónde|por qué|para qué)\b/g,
    /ción\b/g,
    /dad\b/g,
    /mente\b/g
  ];
  
  // Patrones comunes para inglés
  const englishPatterns = [
    /\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by|from|up|about|into|through|during|before|after|above|below|between|among|this|that|these|those|i|you|he|she|it|we|they|me|him|her|us|them|my|your|his|her|its|our|their|will|would|could|should|may|might|can|must|shall|ought|have|has|had|do|does|did|be|am|is|are|was|were|been|being|get|got|getting|make|made|making|take|took|taken|taking|come|came|coming|go|went|going|see|saw|seen|seeing|know|knew|known|knowing|think|thought|thinking|say|said|saying|tell|told|telling|give|gave|given|giving|find|found|finding|work|worked|working|call|called|calling|try|tried|trying|ask|asked|asking|need|needed|needing|feel|felt|feeling|become|became|becoming|leave|left|leaving|put|putting|mean|meant|meaning|keep|kept|keeping|let|letting|begin|began|beginning|seem|seemed|seeming|help|helped|helping|talk|talked|talking|turn|turned|turning|start|started|starting|show|showed|showing|hear|heard|hearing|play|played|playing|run|ran|running|move|moved|moving|live|lived|living|believe|believed|believing|hold|held|holding|bring|brought|bringing|happen|happened|happening|write|wrote|written|writing|provide|provided|providing|sit|sat|sitting|stand|stood|standing|lose|lost|losing|pay|paid|paying|meet|met|meeting|include|included|including|continue|continued|continuing|set|setting|learn|learned|learning|change|changed|changing|lead|led|leading|understand|understood|understanding|watch|watched|watching|follow|followed|following|stop|stopped|stopping|create|created|creating|speak|spoke|spoken|speaking|read|reading|allow|allowed|allowing|add|added|adding|spend|spent|spending|grow|grew|grown|growing|open|opened|opening|walk|walked|walking|win|won|winning|offer|offered|offering|remember|remembered|remembering|love|loved|loving|consider|considered|considering|appear|appeared|appearing|buy|bought|buying|wait|waited|waiting|serve|served|serving|die|died|dying|send|sent|sending|expect|expected|expecting|build|built|building|stay|stayed|staying|fall|fell|fallen|falling|cut|cutting|reach|reached|reaching|kill|killed|killing|remain|remained|remaining|suggest|suggested|suggesting|raise|raised|raising|pass|passed|passing|sell|sold|selling|require|required|requiring|report|reported|reporting|decide|decided|deciding|pull|pulled|pulling)\b/g,
    /ing\b/g,
    /ed\b/g,
    /tion\b/g,
    /ness\b/g
  ];

  let spanishScore = 0;
  let englishScore = 0;

  // Contar coincidencias para español
  spanishPatterns.forEach(pattern => {
    const matches = lowerText.match(pattern);
    if (matches) {
      spanishScore += matches.length;
    }
  });

  // Contar coincidencias para inglés
  englishPatterns.forEach(pattern => {
    const matches = lowerText.match(pattern);
    if (matches) {
      englishScore += matches.length;
    }
  });

  // Verificar caracteres específicos del español
  if (/[ñáéíóúü]/g.test(lowerText)) {
    spanishScore += 10;
  }

  console.log(`📊 Puntuación - Español: ${spanishScore}, Inglés: ${englishScore}`);

  // Determinar idioma basado en puntuaciones
  if (spanishScore > englishScore) {
    console.log("✅ Idioma detectado (fallback): es");
    return 'es';
  } else if (englishScore > spanishScore) {
    console.log("✅ Idioma detectado (fallback): en");
    return 'en';
  } else {
    // Si hay empate, usar español como predeterminado para tu contexto
    console.log("✅ Idioma detectado (fallback - empate): es");
    return 'es';
  }
};

module.exports = { 
  detectLanguage,
  detectLanguageFallback 
};