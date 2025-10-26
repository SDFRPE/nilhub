// backend/src/routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

// Configurar multer para memoria (buffer)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Validar tipo de archivo
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});

/**
 * @route   POST /api/upload/imagen
 * @desc    Subir una sola imagen
 * @access  Private
 */
router.post('/imagen', protect, upload.single('imagen'), uploadController.subirImagen);

/**
 * @route   POST /api/upload/imagenes
 * @desc    Subir múltiples imágenes (máx 5)
 * @access  Private
 */
router.post('/imagenes', protect, upload.array('imagenes', 5), uploadController.subirImagenes);

/**
 * @route   DELETE /api/upload/:cloudinary_id
 * @desc    Eliminar imagen
 * @access  Private
 */
router.delete('/:cloudinary_id', protect, uploadController.eliminarImagen);

module.exports = router;