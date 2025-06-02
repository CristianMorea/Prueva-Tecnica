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

      console.log(`✅ Éxito con modelo: ${model}`, result);

      // Aquí revisamos si el resultado tiene la propiedad "resumen"
      if (result && typeof result === "object") {
        if (result.resumen) {
          return result.resumen;
        }
        // En caso que venga en otras propiedades, las dejamos por si acaso
        if (result.summary_text) return result.summary_text;
        if (result.generated_text) return result.generated_text;
        return JSON.stringify(result);
      }

      if (typeof result === "string") return result;

      return JSON.stringify(result);
    } catch (error) {
      console.error(`❌ Error con modelo ${model}:`, error);
      lastError = error;
    }
  }

  throw new Error(`Todos los modelos fallaron. Último error: ${lastError?.message || 'Desconocido'}`);
};

module.exports = summarizeWithHuggingFace;
