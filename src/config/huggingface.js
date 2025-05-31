const fetch = require('node-fetch');

const summarizeWithHuggingFace = async (text) => {
  // Lista de modelos a probar en orden de preferencia
  const MODELS = [
    "facebook/bart-large-cnn",           // Más confiable
    "sshleifer/distilbart-cnn-12-6",    // Más rápido
    "google/pegasus-xsum",              // Alternativa
    "t5-small"                          // Fallback
  ];

  let lastError = null;

  // Intentar con cada modelo hasta que uno funcione
  for (const model of MODELS) {
    try {
      console.log(`Intentando con modelo: ${model}`);
      
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            inputs: text,
            parameters: {
              max_length: 150,
              min_length: 40,
              do_sample: false
            }
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Éxito con modelo: ${model}`);
        
        // Manejo del resultado
        if (Array.isArray(result) && result.length > 0) {
          return result[0].summary_text || result[0].generated_text || result[0];
        } else if (result.summary_text) {
          return result.summary_text;
        } else if (result.generated_text) {
          return result.generated_text;
        } else {
          return typeof result === 'string' ? result : JSON.stringify(result);
        }
      } else {
        const error = await response.text();
        console.log(`❌ Error con ${model}: ${response.status} - ${error}`);
        lastError = `${response.status} - ${error}`;
        continue; // Probar siguiente modelo
      }
    } catch (error) {
      console.log(`❌ Exception con ${model}:`, error.message);
      lastError = error.message;
      continue; // Probar siguiente modelo
    }
  }

  // Si ningún modelo funcionó, lanzar error
  throw new Error(`Todos los modelos fallaron. Último error: ${lastError}`);
};

module.exports = summarizeWithHuggingFace;