// src/config/cloudinary.js
const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ===================================
// FUNCIÓN: Upload de Imagen
// ===================================
const uploadImage = async (file, folder = 'nilhub') => {
  try {
    // Opciones de upload
    const options = {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Limitar tamaño máximo
        { quality: 'auto:good' }, // Optimizar calidad
        { fetch_format: 'auto' } // Formato automático (webp si el navegador soporta)
      ]
    };

    // Upload a Cloudinary
    const result = await cloudinary.uploader.upload(file, options);

    return {
      url: result.secure_url,
      cloudinary_id: result.public_id
    };
  } catch (error) {
    console.error('Error al subir imagen a Cloudinary:', error);
    throw new Error('Error al subir la imagen');
  }
};

// ===================================
// FUNCIÓN: Eliminar Imagen
// ===================================
const deleteImage = async (cloudinary_id) => {
  try {
    await cloudinary.uploader.destroy(cloudinary_id);
    return true;
  } catch (error) {
    console.error('Error al eliminar imagen de Cloudinary:', error);
    throw new Error('Error al eliminar la imagen');
  }
};

// ===================================
// FUNCIÓN: Upload Múltiple
// ===================================
const uploadMultipleImages = async (files, folder = 'nilhub') => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error al subir imágenes:', error);
    throw new Error('Error al subir las imágenes');
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  uploadMultipleImages
};