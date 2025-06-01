const express = require("express");
const multer = require("multer");
const { detectLanguageFromFile } = require("../controllers/languageController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/detect-language", upload.single("file"), detectLanguageFromFile);

module.exports = router;
