// backend/src/middleware/errorHandler.js

/**
 * @description Middleware global para manejo centralizado de errores
 * Captura todos los errores de la aplicación y responde con formato consistente
 * 
 * @param {Error} err - Error capturado
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Next middleware
 * 
 * @returns {Object} JSON con error formateado
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // 🖥️ Log detallado en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('');
    console.error('╔═══════════════════════════════════════════╗');
    console.error('║          ❌ ERROR CAPTURADO               ║');
    console.error('╚═══════════════════════════════════════════╝');
    console.error('Nombre:', err.name);
    console.error('Mensaje:', err.message);
    console.error('Código:', err.code);
    console.error('Path:', req.path);
    console.error('Método:', req.method);
    if (err.stack) {
      console.error('Stack:', err.stack);
    }
    console.error('');
  } else {
    // En producción, log simplificado
    console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`);
  }

  // ===================================
  // MONGOOSE ERRORS
  // ===================================

  /**
   * Error de validación de Mongoose
   * Ejemplo: Campo requerido faltante, tipo incorrecto
   */
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error.message = messages.join(', '); // ⚠️ FIX: Join array a string
    error.statusCode = 400;
  }

  /**
   * Error de casting de Mongoose
   * Ejemplo: ID de MongoDB inválido
   */
  if (err.name === 'CastError') {
    error.message = `Recurso no encontrado. ID inválido: ${err.value}`;
    error.statusCode = 404;
  }

  /**
   * Error de clave duplicada (unique constraint)
   * Ejemplo: Email ya existe
   */
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error.message = `El ${field} '${value}' ya existe`;
    error.statusCode = 400;
  }

  // ===================================
  // JWT ERRORS
  // ===================================

  /**
   * Token JWT expirado
   */
  if (err.name === 'TokenExpiredError') {
    error.message = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    error.statusCode = 401;
  }

  /**
   * Token JWT inválido o malformado
   */
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Token de autenticación inválido';
    error.statusCode = 401;
  }

  // ===================================
  // MULTER ERRORS (Upload)
  // ===================================

  /**
   * Error de Multer - Archivo muy grande
   */
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'El archivo es demasiado grande. Máximo 5MB.';
    error.statusCode = 400;
  }

  /**
   * Error de Multer - Tipo de archivo no permitido
   */
  if (err.message === 'Solo se permiten imágenes') {
    error.statusCode = 400;
  }

  /**
   * Error de Multer - Demasiados archivos
   */
  if (err.code === 'LIMIT_FILE_COUNT') {
    error.message = 'Demasiados archivos. Máximo 5 imágenes.';
    error.statusCode = 400;
  }

  /**
   * Error de Multer - Campo inesperado
   */
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.message = 'Campo de archivo inesperado';
    error.statusCode = 400;
  }

  // ===================================
  // EXPRESS-VALIDATOR ERRORS
  // ===================================

  /**
   * Errores de validación de express-validator
   * (generalmente manejados en routes, pero por si acaso)
   */
  if (err.errors && Array.isArray(err.errors)) {
    const messages = err.errors.map(e => e.msg);
    error.message = messages.join(', ');
    error.statusCode = 400;
  }

  // ===================================
  // CLOUDINARY ERRORS
  // ===================================

  /**
   * Error al subir a Cloudinary
   */
  if (err.message && err.message.includes('cloudinary')) {
    error.message = 'Error al subir imagen al servidor';
    error.statusCode = 500;
  }

  // ===================================
  // RESPONSE
  // ===================================

  res.status(error.statusCode).json({
    success: false,
    error: error.message || 'Error del servidor',
    // Solo en desarrollo: incluir stack trace
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      originalError: err.name
    })
  });
};

module.exports = errorHandler;