const express = require('express');
const multer = require('multer');
const { summarizeFile } = require('../controllers/summaryController');

const router = express.Router();
const upload = multer({ dest: 'src/uploads/' });

router.post('/', upload.single('file'), summarizeFile);

module.exports = router;
