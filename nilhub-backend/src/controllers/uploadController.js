// backend/src/controllers/uploadController.js
const { uploadImage, deleteImage, uploadMultipleImages } = require('../config/cloudinary');

/**
 * @route   POST /api/upload/imagen
 * @desc    Sube una sola imagen a Cloudinary
 * @access  Private (requiere JWT)
 * 
 * @param {Object} req.file - Archivo subido por multer
 * @param {string} req.query.folder - Carpeta en Cloudinary (opcional, default: nilhub/productos)
 * 
 * @returns {Object} 200 - URL y cloudinary_id de la imagen
 * @returns {Object} 400 - No se proporcionó imagen
 * @returns {Object} 500 - Error al subir
 */
const subirImagen = async (req, res) => {
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

    console.log(`✅ Imagen subida: ${result.cloudinary_id}`);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error al subir imagen:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al subir imagen'
    });
  }
};

/**
 * @route   POST /api/upload/imagenes
 * @desc    Sube múltiples imágenes a Cloudinary (máx 5)
 * @access  Private (requiere JWT)
 * 
 * @param {Array} req.files - Archivos subidos por multer
 * @param {string} req.query.folder - Carpeta en Cloudinary (opcional)
 * 
 * @returns {Object} 200 - Array con URLs y cloudinary_ids
 * @returns {Object} 400 - No se proporcionaron imágenes
 * @returns {Object} 500 - Error al subir
 */
const subirImagenes = async (req, res) => {
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

    console.log(`✅ ${results.length} imágenes subidas`);

    res.json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error('❌ Error al subir imágenes:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al subir imágenes'
    });
  }
};

/**
 * @route   DELETE /api/upload/:cloudinary_id
 * @desc    Elimina una imagen de Cloudinary
 * @access  Private (requiere JWT)
 * 
 * @param {string} req.params.cloudinary_id - ID completo en Cloudinary (puede tener slashes)
 * 
 * @returns {Object} 200 - Imagen eliminada
 * @returns {Object} 400 - ID no proporcionado
 * @returns {Object} 500 - Error al eliminar
 */
const eliminarImagen = async (req, res) => {
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

    console.log(`✅ Imagen eliminada: ${cloudinary_id}`);

    res.json({
      success: true,
      data: {}
    });

  } catch (error) {
    console.error('❌ Error al eliminar imagen:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al eliminar imagen'
    });
  }
};

module.exports = {
  subirImagen,
  subirImagenes,
  eliminarImagen
};