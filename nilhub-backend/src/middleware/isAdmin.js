// backend/src/middleware/isAdmin.js
/**
 * Middleware para verificar si el usuario es admin
 */
const isAdmin = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado'
    });
  }

  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren privilegios de administrador.'
    });
  }

  next();
};

module.exports = { isAdmin };