// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

/**
 * @description Middleware para proteger rutas privadas con JWT
 * Verifica el token en el header Authorization, valida el usuario
 * y lo adjunta a req.usuario para uso en controllers
 * 
 * @middleware
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Next middleware
 * 
 * @returns {void} - Llama next() si todo es válido
 * @returns {Object} - JSON 401 si falla autenticación
 * 
 * @example
 * router.get('/ruta-privada', protect, controller);
 */
const protect = async (req, res, next) => {
  let token;

  // Verificar si el token existe en el header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraer token del header "Bearer TOKEN"
      token = req.headers.authorization.split(' ')[1];

      // Validar formato básico del token (debe tener 3 partes separadas por punto)
      if (!token || token.split('.').length !== 3) {
        return res.status(401).json({
          success: false,
          error: 'Token malformado'
        });
      }

      // Verificar token con JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener usuario del token (sin password)
      req.usuario = await Usuario.findById(decoded.id).select('-password');

      if (!req.usuario) {
        console.warn(`⚠️ Token válido pero usuario no existe: ${decoded.id}`);
        return res.status(401).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      // Verificar si el usuario está activo
      if (!req.usuario.activo) {
        console.warn(`⚠️ Usuario inactivo intentó acceder: ${req.usuario.email}`);
        return res.status(401).json({
          success: false,
          error: 'Usuario inactivo. Contacta al administrador.'
        });
      }

      // ✅ Usuario autenticado - continuar
      next();

    } catch (error) {
      // Manejo específico de errores JWT
      if (error.name === 'TokenExpiredError') {
        console.warn('⏰ Token expirado');
        return res.status(401).json({
          success: false,
          error: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
        });
      }

      if (error.name === 'JsonWebTokenError') {
        console.warn('🔐 Token inválido');
        return res.status(401).json({
          success: false,
          error: 'Token de autenticación inválido'
        });
      }

      // Error desconocido
      console.error('❌ Error en autenticación:', error.message);
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }
  } else {
    // No se proporcionó token
    console.warn('⚠️ Intento de acceso sin token a:', req.path);
    return res.status(401).json({
      success: false,
      error: 'No autorizado. Token no proporcionado.'
    });
  }
};

/**
 * @description Middleware para verificar que el usuario es administrador
 * Debe usarse DESPUÉS del middleware protect
 * 
 * @middleware
 * @param {Object} req - Request de Express (debe tener req.usuario del middleware protect)
 * @param {Object} res - Response de Express
 * @param {Function} next - Next middleware
 * 
 * @returns {void} - Llama next() si es admin
 * @returns {Object} - JSON 403 si no es admin
 * 
 * @example
 * router.delete('/usuarios/:id', protect, esAdmin, controller);
 */
const esAdmin = (req, res, next) => {
  // Verificar que req.usuario existe (debe pasar por protect primero)
  if (!req.usuario) {
    return res.status(401).json({
      success: false,
      error: 'No autenticado. Usa el middleware protect primero.'
    });
  }

  // Verificar si el usuario es admin
  if (req.usuario.role !== 'admin') {
    console.warn(`⚠️ Usuario ${req.usuario.email} intentó acceder a ruta de admin`);
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Solo administradores.'
    });
  }

  // ✅ Usuario es admin - continuar
  next();
};

/**
 * @description Middleware para verificar que el usuario es el dueño del recurso
 * Compara req.usuario._id con el campo usuario_id del recurso
 * 
 * @middleware
 * @param {string} campoUsuario - Nombre del campo que contiene el ID del usuario dueño
 * @returns {Function} Middleware configurado
 * 
 * @example
 * // En el controller, después de obtener el recurso:
 * if (producto.tienda_id.toString() !== tienda._id.toString()) {
 *   return res.status(403).json({ error: 'No autorizado' });
 * }
 * 
 * // O usar este middleware genérico (más complejo de implementar)
 */
const esPropietario = (recursoModel, campoUsuario = 'usuario_id') => {
  return async (req, res, next) => {
    try {
      const recursoId = req.params.id;
      const recurso = await recursoModel.findById(recursoId);

      if (!recurso) {
        return res.status(404).json({
          success: false,
          error: 'Recurso no encontrado'
        });
      }

      // Verificar propiedad
      if (recurso[campoUsuario].toString() !== req.usuario._id.toString()) {
        console.warn(`⚠️ Usuario ${req.usuario.email} intentó acceder a recurso ajeno`);
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para acceder a este recurso'
        });
      }

      // Adjuntar recurso al request para evitar otra query en el controller
      req.recurso = recurso;
      next();

    } catch (error) {
      console.error('❌ Error en verificación de propiedad:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al verificar permisos'
      });
    }
  };
};

/**
 * @description Genera un token JWT con el ID del usuario
 * 
 * @param {string|ObjectId} id - ID del usuario
 * @returns {string} Token JWT firmado
 * 
 * @example
 * const token = generarToken(usuario._id);
 */
const generarToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d' // 30 días por defecto
    }
  );
};

/**
 * @description Verifica un token JWT sin extraerlo del header
 * Útil para verificaciones manuales
 * 
 * @param {string} token - Token JWT
 * @returns {Object|null} Payload decodificado o null si es inválido
 * 
 * @example
 * const payload = verificarToken(token);
 * if (payload) {
 *   console.log('Usuario ID:', payload.id);
 * }
 */
const verificarToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Token inválido:', error.message);
    return null;
  }
};

module.exports = {
  protect,
  esAdmin,
  esPropietario,
  generarToken,
  verificarToken
};