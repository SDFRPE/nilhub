// backend/src/config/cloudinary.js
const cloudinary = require('cloudinary').v2;

/**
 * @description Configuración de Cloudinary para almacenamiento de imágenes
 * Lee credenciales de variables de entorno
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * @description Valida que las credenciales de Cloudinary estén configuradas
 * @throws {Error} Si faltan credenciales
 * @private
 */
const validarConfiguracion = () => {
  const requiredVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno de Cloudinary: ${missing.join(', ')}`
    );
  }
};

// Validar configuración al cargar el módulo
try {
  validarConfiguracion();
  console.log('✅ Cloudinary configurado correctamente');
} catch (error) {
  console.error('❌ Error en configuración de Cloudinary:', error.message);
}

/**
 * @description Sube una imagen a Cloudinary con optimizaciones
 * 
 * @async
 * @param {string} file - Data URI de la imagen (base64)
 * @param {string} [folder='nilhub'] - Carpeta en Cloudinary
 * @returns {Promise<Object>} Objeto con url y cloudinary_id
 * @returns {string} returns.url - URL segura de la imagen
 * @returns {string} returns.cloudinary_id - ID público en Cloudinary
 * 
 * @throws {Error} Si falla el upload
 * 
 * @example
 * const result = await uploadImage(dataURI, 'nilhub/productos');
 * console.log(result.url); // https://res.cloudinary.com/...
 */
const uploadImage = async (file, folder = 'nilhub') => {
  try {
    // Validar que el archivo existe
    if (!file) {
      throw new Error('No se proporcionó archivo para subir');
    }

    // Opciones de upload
    const options = {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { 
          width: 1200, 
          height: 1200, 
          crop: 'limit' 
        }, // Limitar tamaño máximo (mantiene aspect ratio)
        { 
          quality: 'auto:good' 
        }, // Optimizar calidad (reduce peso sin perder mucho)
        { 
          fetch_format: 'auto' 
        } // Formato automático (webp en navegadores compatibles)
      ],
      // Opciones adicionales
      overwrite: false,           // No sobrescribir si existe
      unique_filename: true,      // Generar nombre único
      invalidate: true           // Invalidar CDN cache si se actualiza
    };

    // Upload a Cloudinary
    const result = await cloudinary.uploader.upload(file, options);

    console.log(`✅ Imagen subida: ${result.public_id}`);

    return {
      url: result.secure_url,
      cloudinary_id: result.public_id,
      // Datos adicionales por si los necesitas
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };

  } catch (error) {
    console.error('❌ Error al subir imagen a Cloudinary:', error.message);
    throw new Error('Error al subir la imagen: ' + error.message);
  }
};

/**
 * @description Elimina una imagen de Cloudinary
 * 
 * @async
 * @param {string} cloudinary_id - ID público de la imagen en Cloudinary
 * @returns {Promise<boolean>} true si se eliminó correctamente
 * 
 * @throws {Error} Si falla la eliminación
 * 
 * @example
 * await deleteImage('nilhub/productos/abc123');
 */
const deleteImage = async (cloudinary_id) => {
  try {
    // Validar que el ID existe
    if (!cloudinary_id) {
      throw new Error('No se proporcionó cloudinary_id');
    }

    const result = await cloudinary.uploader.destroy(cloudinary_id);

    // Verificar resultado
    if (result.result === 'ok') {
      console.log(`✅ Imagen eliminada: ${cloudinary_id}`);
      return true;
    } else if (result.result === 'not found') {
      console.warn(`⚠️ Imagen no encontrada en Cloudinary: ${cloudinary_id}`);
      return true; // Consideramos éxito si ya no existe
    } else {
      throw new Error(`Respuesta inesperada de Cloudinary: ${result.result}`);
    }

  } catch (error) {
    console.error('❌ Error al eliminar imagen de Cloudinary:', error.message);
    throw new Error('Error al eliminar la imagen: ' + error.message);
  }
};

/**
 * @description Sube múltiples imágenes a Cloudinary en paralelo
 * 
 * @async
 * @param {Array<string>} files - Array de Data URIs (base64)
 * @param {string} [folder='nilhub'] - Carpeta en Cloudinary
 * @returns {Promise<Array<Object>>} Array de resultados con url y cloudinary_id
 * 
 * @throws {Error} Si falla el upload de alguna imagen
 * 
 * @example
 * const results = await uploadMultipleImages([dataURI1, dataURI2], 'nilhub/productos');
 * results.forEach(r => console.log(r.url));
 */
const uploadMultipleImages = async (files, folder = 'nilhub') => {
  try {
    // Validar que hay archivos
    if (!files || files.length === 0) {
      throw new Error('No se proporcionaron archivos para subir');
    }

    // Validar máximo de archivos
    if (files.length > 10) {
      throw new Error('Máximo 10 imágenes por operación');
    }

    console.log(`📤 Subiendo ${files.length} imágenes a Cloudinary...`);

    // Upload en paralelo
    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);

    console.log(`✅ ${results.length} imágenes subidas exitosamente`);

    return results;

  } catch (error) {
    console.error('❌ Error al subir imágenes:', error.message);
    throw new Error('Error al subir las imágenes: ' + error.message);
  }
};

/**
 * @description Elimina múltiples imágenes de Cloudinary en paralelo
 * 
 * @async
 * @param {Array<string>} cloudinary_ids - Array de IDs públicos en Cloudinary
 * @returns {Promise<boolean>} true si todas se eliminaron correctamente
 * 
 * @throws {Error} Si falla la eliminación de alguna imagen
 * 
 * @example
 * await deleteMultipleImages(['nilhub/productos/abc', 'nilhub/productos/xyz']);
 */
const deleteMultipleImages = async (cloudinary_ids) => {
  try {
    if (!cloudinary_ids || cloudinary_ids.length === 0) {
      return true; // No hay nada que eliminar
    }

    console.log(`🗑️ Eliminando ${cloudinary_ids.length} imágenes de Cloudinary...`);

    const deletePromises = cloudinary_ids.map(id => deleteImage(id));
    await Promise.all(deletePromises);

    console.log(`✅ ${cloudinary_ids.length} imágenes eliminadas`);

    return true;

  } catch (error) {
    console.error('❌ Error al eliminar imágenes:', error.message);
    throw new Error('Error al eliminar las imágenes: ' + error.message);
  }
};

/**
 * @description Obtiene información de una imagen en Cloudinary
 * Útil para debugging o validación
 * 
 * @async
 * @param {string} cloudinary_id - ID público de la imagen
 * @returns {Promise<Object>} Información de la imagen
 * 
 * @example
 * const info = await getImageInfo('nilhub/productos/abc123');
 * console.log(info.width, info.height, info.format);
 */
const getImageInfo = async (cloudinary_id) => {
  try {
    const result = await cloudinary.api.resource(cloudinary_id);
    return {
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      created_at: result.created_at
    };
  } catch (error) {
    console.error('❌ Error al obtener info de imagen:', error.message);
    throw new Error('Error al obtener información de la imagen');
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  uploadMultipleImages,
  deleteMultipleImages,
  getImageInfo
};