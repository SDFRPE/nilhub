// src/routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadImage, deleteImage, uploadMultipleImages } = require('../config/cloudinary');
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

// ===================================
// POST /api/upload/imagen
// Subir una sola imagen (protegida)
// ===================================
router.post('/imagen', protect, upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó ninguna imagen'
      });
    }

    // Convertir buffer a base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Obtener folder del query (opcional)
    const folder = req.query.folder || 'nilhub/productos';

    // Subir a Cloudinary
    const result = await uploadImage(dataURI, folder);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al subir imagen'
    });
  }
});

// ===================================
// POST /api/upload/imagenes
// Subir múltiples imágenes (protegida)
// ===================================
router.post('/imagenes', protect, upload.array('imagenes', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron imágenes'
      });
    }

    // Convertir todos los archivos a base64
    const dataURIs = req.files.map(file => {
      const b64 = Buffer.from(file.buffer).toString('base64');
      return `data:${file.mimetype};base64,${b64}`;
    });

    // Obtener folder del query (opcional)
    const folder = req.query.folder || 'nilhub/productos';

    // Subir a Cloudinary
    const results = await uploadMultipleImages(dataURIs, folder);

    res.json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error('Error al subir imágenes:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al subir imágenes'
    });
  }
});

// ===================================
// DELETE /api/upload/:cloudinary_id
// Eliminar imagen (protegida)
// ===================================
router.delete('/:cloudinary_id', protect, async (req, res) => {
  try {
    // Capturar el cloudinary_id completo (puede tener slashes)
    const cloudinary_id = req.params.cloudinary_id;

    if (!cloudinary_id) {
      return res.status(400).json({
        success: false,
        error: 'ID de Cloudinary no proporcionado'
      });
    }

    // Eliminar de Cloudinary
    await deleteImage(cloudinary_id);

    res.json({
      success: true,
      data: {}
    });

  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al eliminar imagen'
    });
  }
});

module.exports = router;