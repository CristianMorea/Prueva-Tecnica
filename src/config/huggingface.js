const fetch = require('node-fetch');

const summarizeWithHuggingFace = async (text) => {
  const response = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: text })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error("Error desde Hugging Face API: " + error);
  }

  const result = await response.json();
  return result[0].summary_text;
};

module.exports = summarizeWithHuggingFace;