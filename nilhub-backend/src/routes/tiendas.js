// backend/src/routes/tiendas.js
const express = require('express');
const router = express.Router();
const Tienda = require('../models/Tienda');
const Producto = require('../models/Producto');
const { protect } = require('../middleware/auth');

// ===================================
// GET /api/tiendas/:slug
// Obtener tienda por slug (pública)
// ===================================
router.get('/:slug', async (req, res) => {
  try {
    const tienda = await Tienda.findOne({ 
      slug: req.params.slug,
      activa: true 
    });

    if (!tienda) {
      return res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
    }

    res.json({
      success: true,
      data: tienda
    });

  } catch (error) {
    console.error('Error al obtener tienda:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener tienda'
    });
  }
});

// ===================================
// GET /api/tiendas/:slug/productos
// Obtener productos de una tienda (pública)
// ===================================
router.get('/:slug/productos', async (req, res) => {
  try {
    // Buscar tienda
    const tienda = await Tienda.findOne({ 
      slug: req.params.slug,
      activa: true 
    });

    if (!tienda) {
      return res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
    }

    // Filtros opcionales
    const { categoria, busqueda } = req.query;
    
    let query = { 
      tienda_id: tienda._id,
      activo: true 
    };

    // Filtro por categoría
    if (categoria && categoria !== 'todas') {
      query.categoria = categoria;
    }

    // Filtro por búsqueda
    if (busqueda) {
      query.$or = [
        { nombre: { $regex: busqueda, $options: 'i' } },
        { descripcion: { $regex: busqueda, $options: 'i' } },
        { marca: { $regex: busqueda, $options: 'i' } }
      ];
    }

    // Obtener productos
    const productos = await Producto.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: productos.length,
      data: productos
    });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos'
    });
  }
});

// ===================================
// PUT /api/tiendas/mi-tienda
// Actualizar tienda del usuario (protegida)
// ===================================
router.put('/mi-tienda', protect, async (req, res) => {
  try {
    // Buscar tienda del usuario
    const tienda = await Tienda.findOne({ usuario_id: req.usuario._id });

    if (!tienda) {
      return res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
    }

    // Campos permitidos para actualizar
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

    // Filtrar solo campos permitidos
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (camposPermitidos.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Actualizar tienda
    const tiendaActualizada = await Tienda.findByIdAndUpdate(
      tienda._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: tiendaActualizada
    });

  } catch (error) {
    console.error('Error al actualizar tienda:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar tienda'
    });
  }
});

// ===================================
// ⭐ NUEVO: PUT /api/tiendas/:id
// Actualizar tienda por ID (protegida)
// ===================================
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar tienda
    const tienda = await Tienda.findById(id);

    if (!tienda) {
      return res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
    }

    // Verificar que la tienda pertenezca al usuario autenticado
    if (tienda.usuario_id.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para editar esta tienda'
      });
    }

    // Campos permitidos para actualizar
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

    // Filtrar solo campos permitidos
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (camposPermitidos.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Actualizar tienda
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

module.exports = router;