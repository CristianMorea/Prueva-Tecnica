// routes/translationRoutes.js
const express = require('express');
const multer = require('multer');
const translationController = require('../controllers/translationController');

const router = express.Router();

// Configuración de multer para manejo de archivos
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB máximo
    },
    fileFilter: (req, file, cb) => {
        // Validar tipos de archivo permitidos
        const allowedTypes = ['application/pdf', 'text/plain'];
        const allowedExtensions = ['.pdf', '.txt'];
        
        const fileExtension = file.originalname.toLowerCase().substr(file.originalname.lastIndexOf('.'));
        
        if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido. Solo se aceptan archivos PDF y TXT'), false);
        }
    }
});

// Middleware para manejo de errores de multer
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'El archivo es demasiado grande. Tamaño máximo: 10MB',
                error: 'FILE_TOO_LARGE'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Campo de archivo inesperado',
                error: 'UNEXPECTED_FILE_FIELD'
            });
        }
    }
    
    if (error.message.includes('Tipo de archivo no permitido')) {
        return res.status(400).json({
            success: false,
            message: error.message,
            supportedTypes: ['.pdf', '.txt']
        });
    }
    
    next(error);
};

/**
 * @route GET /api/translation/languages
 * @desc Obtiene la lista de idiomas disponibles para traducción
 * @access Public
 */
router.get('/languages', translationController.getSupportedLanguages);

/**
 * @route POST /api/translation/text
 * @desc Traduce texto simple
 * @access Public
 * @body {
 *   text: string (requerido),
 *   targetLanguage: string (requerido),
 *   sourceLanguage: string (opcional, default: 'auto')
 * }
 */
router.post('/text', translationController.translateText);

/**
 * @route POST /api/translation/file
 * @desc Traduce archivo PDF o TXT (respuesta completa)
 * @access Public
 * @multipart file: archivo PDF o TXT (requerido)
 * @body {
 *   targetLanguage: string (requerido),
 *   sourceLanguage: string (opcional, default: 'auto')
 * }
 */
router.post('/file', 
    upload.single('file'), 
    handleMulterError, 
    translationController.translateFile
);

/**
 * @route POST /api/translation/file/light
 * @desc Traduce archivo PDF o TXT (respuesta ligera - solo texto traducido)
 * @access Public
 * @multipart file: archivo PDF o TXT (requerido)
 * @body {
 *   targetLanguage: string (requerido),
 *   sourceLanguage: string (opcional, default: 'auto')
 * }
 */
router.post('/file/light', 
    upload.single('file'), 
    handleMulterError, 
    translationController.translateFileLight
);

// Middleware global para manejo de errores
router.use((error, req, res, next) => {
    console.error('Error en rutas de traducción:', error);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
});

module.exports = router;