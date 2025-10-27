// backend/src/routes/admin.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');

// Todas las rutas requieren ser admin
router.use(protect);
router.use(isAdmin);

/**
 * @route   GET /api/admin/stats
 * @desc    Estadísticas generales del sistema
 * @access  Admin
 */
router.get('/stats', async (req, res) => {
  try {
    const Usuario = require('../models/Usuario');
    const Tienda = require('../models/Tienda');
    const Producto = require('../models/Producto');

    const stats = {
      usuarios: await Usuario.countDocuments(),
      vendedores: await Usuario.countDocuments({ rol: 'vendedor' }),
      tiendas: await Tienda.countDocuments(),
      tiendas_activas: await Tienda.countDocuments({ activa: true }),
      productos: await Producto.countDocuments(),
      productos_activos: await Producto.countDocuments({ activo: true })
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

/**
 * @route   GET /api/admin/usuarios
 * @desc    Listar todos los usuarios
 * @access  Admin
 */
router.get('/usuarios', async (req, res) => {
  try {
    const Usuario = require('../models/Usuario');
    
    const usuarios = await Usuario.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: usuarios.length,
      data: usuarios
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuarios'
    });
  }
});

/**
 * @route   GET /api/admin/tiendas
 * @desc    Listar todas las tiendas
 * @access  Admin
 */
router.get('/tiendas', async (req, res) => {
  try {
    const Tienda = require('../models/Tienda');
    
    const tiendas = await Tienda.find()
      .populate('usuario_id', 'nombre email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tiendas.length,
      data: tiendas
    });
  } catch (error) {
    console.error('Error al obtener tiendas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener tiendas'
    });
  }
});

/**
 * @route   PUT /api/admin/tiendas/:id/toggle
 * @desc    Activar/Desactivar tienda
 * @access  Admin
 */
router.put('/tiendas/:id/toggle', async (req, res) => {
  try {
    const Tienda = require('../models/Tienda');
    
    const tienda = await Tienda.findById(req.params.id);
    
    if (!tienda) {
      return res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
    }

    tienda.activa = !tienda.activa;
    await tienda.save();

    res.json({
      success: true,
      data: tienda
    });
  } catch (error) {
    console.error('Error al cambiar estado de tienda:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cambiar estado de tienda'
    });
  }
});

/**
 * @route   DELETE /api/admin/usuarios/:id
 * @desc    Eliminar usuario
 * @access  Admin
 */
router.delete('/usuarios/:id', async (req, res) => {
  try {
    const Usuario = require('../models/Usuario');
    const Tienda = require('../models/Tienda');
    
    const usuario = await Usuario.findById(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Eliminar tienda asociada si existe
    await Tienda.deleteMany({ usuario_id: usuario._id });

    // Eliminar usuario
    await usuario.deleteOne();

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar usuario'
    });
  }
});

module.exports = router;