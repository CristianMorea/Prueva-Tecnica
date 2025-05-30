const fetch = require('node-fetch');

const summarizeWithHuggingFace = async (text) => {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/mrm8488/bert2bert_shared-spanish-finetuned-summarization",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: text })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error("Error desde Hugging Face API: " + error);
  }

  const result = await response.json();

  // Manejo flexible del formato del resultado
  if (Array.isArray(result)) {
    return result[0].summary_text || result[0].summary || result[0];
  } else if (result.summary_text) {
    return result.summary_text;
  } else {
    return typeof result === 'string' ? result : JSON.stringify(result);
  }
};

module.exports = summarizeWithHuggingFace;
