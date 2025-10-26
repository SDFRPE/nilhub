// backend/src/routes/tiendas.js
const express = require('express');
const router = express.Router();
const tiendasController = require('../controllers/tiendasController');
const { protect } = require('../middleware/auth');

/**
 * ⚠️ ORDEN IMPORTANTE: Rutas específicas ANTES de rutas con parámetros
 */

/**
 * @route   GET /api/tiendas/mi-tienda
 * @desc    Obtener tienda del usuario autenticado
 * @access  Private
 */
router.get('/mi-tienda', protect, tiendasController.obtenerMiTienda);

/**
 * @route   PUT /api/tiendas/mi-tienda
 * @desc    Actualizar tienda del usuario autenticado
 * @access  Private
 */
router.put('/mi-tienda', protect, tiendasController.actualizarTienda);

/**
 * @route   POST /api/tiendas
 * @desc    Crear nueva tienda
 * @access  Private
 */
router.post('/', protect, tiendasController.crearTienda);

/**
 * ⭐ NUEVA RUTA - Actualizar tienda por ID
 * @route   PUT /api/tiendas/:id
 * @desc    Actualizar tienda por ID (verifica que sea del usuario)
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const Tienda = require('../models/Tienda');
    const { id } = req.params;

    // Buscar tienda
    const tienda = await Tienda.findById(id);

    if (!tienda) {
      return res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
    }

    // Verificar propiedad
    if (tienda.usuario_id.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para editar esta tienda'
      });
    }

    // Campos permitidos
    const camposPermitidos = [
      'nombre',
      'descripcion',
      'whatsapp',
      'instagram',
      'facebook',
      'logo_url',
      'logo_cloudinary_id',
      'banner_url',
      'banner_cloudinary_id',
      'color_tema'
    ];

    // Filtrar campos
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (camposPermitidos.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Actualizar
    const tiendaActualizada = await Tienda.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    console.log(`✅ Tienda actualizada: ${tiendaActualizada.nombre} (ID: ${id})`);

    res.json({
      success: true,
      data: tiendaActualizada
    });

  } catch (error) {
    console.error('❌ Error al actualizar tienda:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar tienda'
    });
  }
});

/**
 * @route   GET /api/tiendas/:slug
 * @desc    Obtener tienda por slug (pública)
 * @access  Public
 */
router.get('/:slug', tiendasController.obtenerTiendaPorSlug);

/**
 * @route   GET /api/tiendas/:slug/productos
 * @desc    Obtener productos de una tienda (pública)
 * @access  Public
 */
router.get('/:slug/productos', tiendasController.obtenerProductosDeTienda);

module.exports = router;