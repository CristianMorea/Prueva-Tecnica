// controllers/translationController.js
const translationService = require('../services/translationService');
const pdfService = require('../services/pdfservice');
const fs = require('fs').promises;
const path = require('path');

class TranslationController {
    /**
     * Obtiene la lista de idiomas disponibles para traducción
     */
    async getSupportedLanguages(req, res) {
        try {
            const result = translationService.getSupportedLanguages();
            
            res.status(200).json({
                success: true,
                message: 'Idiomas obtenidos exitosamente',
                data: result
            });

        } catch (error) {
            console.error('Error obteniendo idiomas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Traduce texto simple
     */
    async translateText(req, res) {
        try {
            const { text, targetLanguage, sourceLanguage = 'auto' } = req.body;

            // Validaciones
            if (!text || !targetLanguage) {
                return res.status(400).json({
                    success: false,
                    message: 'Texto y idioma destino son requeridos',
                    required: ['text', 'targetLanguage']
                });
            }

            const result = await translationService.translateLongText(
                text, 
                targetLanguage, 
                sourceLanguage
            );

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Error en la traducción',
                    error: result.error
                });
            }

            res.status(200).json({
                success: true,
                message: 'Texto traducido exitosamente',
                data: result
            });

        } catch (error) {
            console.error('Error en traducción de texto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Traduce archivos PDF o TXT
     */
    async translateFile(req, res) {
        try {
            const { targetLanguage, sourceLanguage = 'auto' } = req.body;
            
            // Validar que se subió un archivo
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se proporcionó ningún archivo',
                    supportedTypes: ['.pdf', '.txt']
                });
            }

            // Validar idioma destino
            if (!targetLanguage) {
                return res.status(400).json({
                    success: false,
                    message: 'El idioma destino es requerido',
                    required: ['targetLanguage']
                });
            }

            const file = req.file;
            const fileExtension = path.extname(file.originalname).toLowerCase();
            
            // Validar tipo de archivo
            if (!['.pdf', '.txt'].includes(fileExtension)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de archivo no soportado',
                    supportedTypes: ['.pdf', '.txt'],
                    receivedType: fileExtension
                });
            }

            let extractedText = '';

            // Extraer texto según el tipo de archivo
            if (fileExtension === '.pdf') {
                try {
                    extractedText = await pdfService.extractTextFromBuffer(file.buffer);
                } catch (pdfError) {
                    return res.status(400).json({
                        success: false,
                        message: 'Error procesando archivo PDF',
                        error: pdfError.message
                    });
                }
            } else if (fileExtension === '.txt') {
                extractedText = file.buffer.toString('utf-8');
            }

            // Validar que se extrajo texto
            if (!extractedText || extractedText.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo extraer texto del archivo o el archivo está vacío'
                });
            }

            // Traducir el texto
            const translationResult = await translationService.translateLongText(
                extractedText,
                targetLanguage,
                sourceLanguage
            );

            if (!translationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Error en la traducción del archivo',
                    error: translationResult.error
                });
            }

            // Respuesta exitosa
            res.status(200).json({
                success: true,
                message: 'Archivo traducido exitosamente',
                data: {
                    fileName: file.originalname,
                    fileSize: file.size,
                    fileType: fileExtension,
                    originalTextLength: extractedText.length,
                    translatedTextLength: translationResult.translatedText.length,
                    sourceLanguage: translationResult.sourceLanguage,
                    targetLanguage: translationResult.targetLanguage,
                    targetLanguageName: translationResult.targetLanguageName,
                    chunksProcessed: translationResult.chunksProcessed,
                    originalText: extractedText,
                    translatedText: translationResult.translatedText
                }
            });

        } catch (error) {
            console.error('Error en traducción de archivo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Traduce archivo y devuelve solo el texto traducido (respuesta más ligera)
     */
    async translateFileLight(req, res) {
        try {
            const { targetLanguage, sourceLanguage = 'auto' } = req.body;
            
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se proporcionó ningún archivo'
                });
            }

            if (!targetLanguage) {
                return res.status(400).json({
                    success: false,
                    message: 'El idioma destino es requerido'
                });
            }

            const file = req.file;
            const fileExtension = path.extname(file.originalname).toLowerCase();
            
            if (!['.pdf', '.txt'].includes(fileExtension)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de archivo no soportado',
                    supportedTypes: ['.pdf', '.txt']
                });
            }

            let extractedText = '';

            if (fileExtension === '.pdf') {
                extractedText = await pdfService.extractTextFromBuffer(file.buffer);
            } else if (fileExtension === '.txt') {
                extractedText = file.buffer.toString('utf-8');
            }

            if (!extractedText || extractedText.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo extraer texto del archivo'
                });
            }

            const translationResult = await translationService.translateLongText(
                extractedText,
                targetLanguage,
                sourceLanguage
            );

            if (!translationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Error en la traducción',
                    error: translationResult.error
                });
            }

            // Respuesta ligera - solo texto traducido
            res.status(200).json({
                success: true,
                message: 'Archivo traducido exitosamente',
                data: {
                    fileName: file.originalname,
                    targetLanguage: translationResult.targetLanguage,
                    targetLanguageName: translationResult.targetLanguageName,
                    translatedText: translationResult.translatedText
                }
            });

        } catch (error) {
            console.error('Error en traducción ligera:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = new TranslationController();