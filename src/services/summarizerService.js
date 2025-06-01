const { queryHuggingFaceModel } = require("../config/huggingface");

const MODELS = [
  "sshleifer/distilbart-cnn-12-6", // Modelo rápido y eficiente
];

const summarizeWithHuggingFace = async (text) => {
  let lastError = null;

  for (const model of MODELS) {
    try {
      console.log(`🧠 Intentando resumir con modelo: ${model}`);

      const result = await queryHuggingFaceModel(model, text, {
        max_length: 150,
        min_length: 40,
        do_sample: false,
      });

      console.log(`✅ Éxito con modelo: ${model}`);

      if (Array.isArray(result) && result.length > 0) {
        return result[0].summary_text || result[0].generated_text || JSON.stringify(result[0]);
      } else if (result.summary_text) {
        return result.summary_text;
      } else if (result.generated_text) {
        return result.generated_text;
      } else {
        return typeof result === "string" ? result : JSON.stringify(result);
      }
    } catch (error) {
      console.error(`❌ Error con modelo ${model}:`, error);
      lastError = error;
    }
  }

  throw new Error(`Todos los modelos fallaron. Último error: ${JSON.stringify(lastError)}`);
};

module.exports = summarizeWithHuggingFace;
