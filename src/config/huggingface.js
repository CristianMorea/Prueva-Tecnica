const axios = require("axios");

const queryHuggingFaceModel = async (model, inputs, parameters = {}, apiKey = process.env.HUGGINGFACE_API_KEY) => {
  try {
    const url = `https://api-inference.huggingface.co/models/${model}`;

    console.log("🔍 Solicitando modelo:", model);
    console.log("🌐 URL:", url);
    console.log("📨 Inputs:", inputs);
    console.log("⚙️ Parámetros:", parameters);

    const response = await axios.post(
      url,
      { inputs, parameters },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Respuesta recibida del modelo");
    return response.data;
  } catch (error) {
    console.error("❌ Error al consultar modelo Hugging Face:");
    if (error.response) {
      console.error("🔴 Status:", error.response.status);
      console.error("🔴 Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("🔴 Error:", error.message);
    }
    throw error.response ? error.response.data : error;
  }
};

module.exports = { queryHuggingFaceModel };
