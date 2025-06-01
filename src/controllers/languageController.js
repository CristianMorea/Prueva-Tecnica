const fs = require("fs");
const pdfParse = require("pdf-parse");
const { detectLanguage } = require("../services/languageDetectionService");

async function detectLanguageFromFile(req, res) {
    try {
        const file = req.file;

        if (!file) return res.status(400).json({ error: "No file uploaded" });

        let textContent = "";

        if (file.mimetype === "application/pdf") {
            const dataBuffer = fs.readFileSync(file.path);
            const data = await pdfParse(dataBuffer);
            textContent = data.text;
        } else if (file.mimetype === "text/plain") {
            textContent = fs.readFileSync(file.path, "utf-8");
        } else {
            return res.status(400).json({ error: "Only PDF or TXT files are supported" });
        }

        const language = await detectLanguage(textContent.slice(0, 1000)); // Limitamos a los primeros 1000 caracteres
        res.json({ language });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { detectLanguageFromFile };
