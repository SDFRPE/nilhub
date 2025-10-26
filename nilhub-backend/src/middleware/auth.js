// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// ===================================
// MIDDLEWARE: Proteger Rutas con JWT
// ===================================
const protect = async (req, res, next) => {
  let token;

  // Verificar si el token existe en el header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraer token del header "Bearer TOKEN"
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener usuario del token (sin password)
      req.usuario = await Usuario.findById(decoded.id).select('-password');

      if (!req.usuario) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      // Verificar si el usuario está activo
      if (!req.usuario.activo) {
        return res.status(401).json({
          success: false,
          error: 'Usuario inactivo'
        });
      }

      next();
    } catch (error) {
      console.error('Error en autenticación:', error.message);
      return res.status(401).json({
        success: false,
        error: 'No autorizado, token inválido'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado, token no proporcionado'
    });
  }
};

// ===================================
// FUNCIÓN: Generar JWT
// ===================================
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = { protect, generarToken };