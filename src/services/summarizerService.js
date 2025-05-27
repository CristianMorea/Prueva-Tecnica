const summarizeWithHuggingFace = require('../config/huggingface');

const summarizeText = async (text) => {
  return await summarizeWithHuggingFace(text);
};

module.exports = summarizeText;
