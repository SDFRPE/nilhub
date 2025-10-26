// src/routes/productos.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Producto = require('../models/Producto');
const Tienda = require('../models/Tienda');
const { protect } = require('../middleware/auth');

// ===================================
// GET /api/productos/mis-productos
// Obtener todos los productos del usuario (protegida)
// ===================================
router.get('/mis-productos', protect, async (req, res) => {
  try {
    // Obtener tienda del usuario
    const tienda = await Tienda.findOne({ usuario_id: req.usuario._id });

    if (!tienda) {
      return res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
    }

    // Obtener productos de la tienda
    const productos = await Producto.find({ tienda_id: tienda._id })
      .sort({ createdAt: -1 });

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
// GET /api/productos/:id
// Obtener un producto por ID
// ===================================
router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Incrementar vistas
    await producto.incrementarVistas();

    res.json({
      success: true,
      data: producto
    });

  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener producto'
    });
  }
});

// ===================================
// POST /api/productos
// Crear nuevo producto (protegida)
// ===================================
router.post('/', protect, [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('categoria').isIn(['maquillaje', 'skincare', 'fragancias', 'cuidado-personal', 'accesorios', 'otros']).withMessage('Categoría inválida'),
  body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser mayor o igual a 0'),
  body('stock').isInt({ min: 0 }).withMessage('El stock debe ser mayor o igual a 0'),
  body('imagenes').isArray({ min: 1 }).withMessage('Debe incluir al menos una imagen')
], async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Obtener tienda del usuario
    const tienda = await Tienda.findOne({ usuario_id: req.usuario._id });

    if (!tienda) {
      return res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
    }

    // Validar precio de oferta
    if (req.body.precio_oferta && req.body.precio_oferta >= req.body.precio) {
      return res.status(400).json({
        success: false,
        error: 'El precio de oferta debe ser menor al precio normal'
      });
    }

    // Crear producto
    const producto = await Producto.create({
      ...req.body,
      tienda_id: tienda._id
    });

    // Incrementar contador de productos en la tienda
    tienda.total_productos += 1;
    await tienda.save();

    res.status(201).json({
      success: true,
      data: producto
    });

  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear producto'
    });
  }
});

// ===================================
// PUT /api/productos/:id
// Actualizar producto (protegida)
// ===================================
router.put('/:id', protect, [
  body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
  body('categoria').optional().isIn(['maquillaje', 'skincare', 'fragancias', 'cuidado-personal', 'accesorios', 'otros']).withMessage('Categoría inválida'),
  body('precio').optional().isFloat({ min: 0 }).withMessage('El precio debe ser mayor o igual a 0'),
  body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser mayor o igual a 0')
], async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Buscar producto
    let producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Verificar que el producto pertenezca a la tienda del usuario
    const tienda = await Tienda.findOne({ usuario_id: req.usuario._id });

    if (!tienda || producto.tienda_id.toString() !== tienda._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para editar este producto'
      });
    }

    // Validar precio de oferta si se está actualizando
    if (req.body.precio_oferta) {
      const precioFinal = req.body.precio || producto.precio;
      if (req.body.precio_oferta >= precioFinal) {
        return res.status(400).json({
          success: false,
          error: 'El precio de oferta debe ser menor al precio normal'
        });
      }
    }

    // Actualizar producto
    producto = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: producto
    });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar producto'
    });
  }
});

// ===================================
// PATCH /api/productos/:id/stock
// Actualizar solo el stock (protegida)
// ===================================
router.patch('/:id/stock', protect, [
  body('stock').isInt({ min: 0 }).withMessage('El stock debe ser mayor o igual a 0')
], async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Buscar producto
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Verificar que el producto pertenezca a la tienda del usuario
    const tienda = await Tienda.findOne({ usuario_id: req.usuario._id });

    if (!tienda || producto.tienda_id.toString() !== tienda._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para editar este producto'
      });
    }

    // Actualizar stock
    await producto.actualizarStock(req.body.stock);

    res.json({
      success: true,
      data: producto
    });

  } catch (error) {
    console.error('Error al actualizar stock:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar stock'
    });
  }
});

// ===================================
// DELETE /api/productos/:id
// Eliminar producto (protegida)
// ===================================
router.delete('/:id', protect, async (req, res) => {
  try {
    // Buscar producto
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Verificar que el producto pertenezca a la tienda del usuario
    const tienda = await Tienda.findOne({ usuario_id: req.usuario._id });

    if (!tienda || producto.tienda_id.toString() !== tienda._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para eliminar este producto'
      });
    }

    // Eliminar producto
    await producto.deleteOne();

    // Decrementar contador de productos en la tienda
    tienda.total_productos = Math.max(0, tienda.total_productos - 1);
    await tienda.save();

    res.json({
      success: true,
      data: {}
    });

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar producto'
    });
  }
});

// ===================================
// POST /api/productos/:id/click-whatsapp
// Registrar click en WhatsApp (pública)
// ===================================
router.post('/:id/click-whatsapp', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Incrementar contador
    await producto.incrementarClicksWhatsApp();

    res.json({
      success: true,
      data: { clicks_whatsapp: producto.clicks_whatsapp }
    });

  } catch (error) {
    console.error('Error al registrar click:', error);
    res.status(500).json({
      success: false,
      error: 'Error al registrar click'
    });
  }
});

module.exports = router;