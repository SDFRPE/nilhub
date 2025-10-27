// backend/src/controllers/productosController.js
const Producto = require('../models/Producto');
const Tienda = require('../models/Tienda');

/**
 * @route   GET /api/productos/mis-productos
 * @desc    Obtiene todos los productos del usuario autenticado
 * @access  Private (requiere JWT)
 * 
 * @param {Object} req.usuario - Usuario del JWT
 * @returns {Object} 200 - Lista de productos
 * @returns {Object} 404 - Tienda no encontrada
 * @returns {Object} 500 - Error del servidor
 */
const obtenerMisProductos = async (req, res) => {
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
    console.error('❌ Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos'
    });
  }
};

/**
 * @route   GET /api/productos/:id
 * @desc    Obtiene un producto por ID e incrementa el contador de vistas
 * @access  Public
 * 
 * @param {string} req.params.id - ID del producto
 * @returns {Object} 200 - Producto encontrado
 * @returns {Object} 404 - Producto no encontrado
 * @returns {Object} 500 - Error del servidor
 */
const obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Incrementar vistas (async, no esperar respuesta)
    producto.incrementarVistas().catch(err => 
      console.error('Error al incrementar vistas:', err)
    );

    res.json({
      success: true,
      data: producto
    });

  } catch (error) {
    console.error('❌ Error al obtener producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener producto'
    });
  }
};

/**
 * @route   POST /api/productos
 * @desc    Crea un nuevo producto
 * @access  Private (requiere JWT)
 * 
 * @param {Object} req.body - Datos del producto
 * @param {Object} req.usuario - Usuario del JWT
 * 
 * @returns {Object} 201 - Producto creado
 * @returns {Object} 400 - Validación fallida
 * @returns {Object} 404 - Tienda no encontrada
 * @returns {Object} 500 - Error del servidor
 */
const crearProducto = async (req, res) => {
  try {
    // Obtener tienda del usuario
    const tienda = await Tienda.findOne({ usuario_id: req.usuario._id });

    if (!tienda) {
      return res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
    }

    // ✅ CORREGIDO: Validar precio de oferta (convertir a números)
    if (req.body.precio_oferta) {
      const precioNormal = parseFloat(req.body.precio);
      const precioOferta = parseFloat(req.body.precio_oferta);

      if (isNaN(precioNormal) || isNaN(precioOferta)) {
        return res.status(400).json({
          success: false,
          error: 'Los precios deben ser valores numéricos válidos'
        });
      }

      if (precioOferta >= precioNormal) {
        return res.status(400).json({
          success: false,
          error: 'El precio de oferta debe ser menor al precio normal'
        });
      }
    }

    // Crear producto
    const producto = await Producto.create({
      ...req.body,
      tienda_id: tienda._id
    });

    // Incrementar contador de productos en la tienda
    await tienda.incrementarProductos();

    console.log(`✅ Producto creado: ${producto.nombre} (Tienda: ${tienda.nombre})`);

    res.status(201).json({
      success: true,
      data: producto
    });

  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    
    // Manejar errores de validación
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errores[0] || 'Error de validación'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al crear producto'
    });
  }
};

/**
 * @route   PUT /api/productos/:id
 * @desc    Actualiza un producto existente
 * @access  Private (requiere JWT)
 * 
 * @param {string} req.params.id - ID del producto
 * @param {Object} req.body - Datos a actualizar
 * @param {Object} req.usuario - Usuario del JWT
 * 
 * @returns {Object} 200 - Producto actualizado
 * @returns {Object} 400 - Validación fallida
 * @returns {Object} 403 - No autorizado
 * @returns {Object} 404 - Producto no encontrado
 * @returns {Object} 500 - Error del servidor
 */
const actualizarProducto = async (req, res) => {
  try {
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

    // ✅ CORREGIDO: Validar precio de oferta si se está actualizando
    if (req.body.precio_oferta !== undefined && req.body.precio_oferta !== null && req.body.precio_oferta !== '') {
      // Determinar el precio final (el que viene en el body o el actual del producto)
      const precioFinal = req.body.precio !== undefined 
        ? parseFloat(req.body.precio) 
        : parseFloat(producto.precio);
      
      const precioOferta = parseFloat(req.body.precio_oferta);

      // Validar que sean números válidos
      if (isNaN(precioFinal) || isNaN(precioOferta)) {
        return res.status(400).json({
          success: false,
          error: 'Los precios deben ser valores numéricos válidos'
        });
      }

      // Comparar valores numéricos
      if (precioOferta >= precioFinal) {
        return res.status(400).json({
          success: false,
          error: `El precio de oferta (${precioOferta}) debe ser menor al precio normal (${precioFinal})`
        });
      }
    }

    // Actualizar producto
    producto = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    console.log(`✅ Producto actualizado: ${producto.nombre}`);

    res.json({
      success: true,
      data: producto
    });

  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errores[0] || 'Error de validación'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al actualizar producto'
    });
  }
};

/**
 * @route   PATCH /api/productos/:id/stock
 * @desc    Actualiza solo el stock de un producto (método manual)
 * @access  Private (requiere JWT)
 * 
 * @param {string} req.params.id - ID del producto
 * @param {Object} req.body
 * @param {number} req.body.stock - Nueva cantidad de stock
 * @param {Object} req.usuario - Usuario del JWT
 * 
 * @returns {Object} 200 - Stock actualizado
 * @returns {Object} 403 - No autorizado
 * @returns {Object} 404 - Producto no encontrado
 * @returns {Object} 500 - Error del servidor
 */
const actualizarStock = async (req, res) => {
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
        error: 'No autorizado para editar este producto'
      });
    }

    // Actualizar stock usando el método del modelo
    // ⚠️ IMPORTANTE: Usar .actualizarStock() para que funcione el middleware
    await producto.actualizarStock(req.body.stock);

    console.log(`✅ Stock actualizado: ${producto.nombre} → ${req.body.stock} unidades`);

    res.json({
      success: true,
      data: producto
    });

  } catch (error) {
    console.error('❌ Error al actualizar stock:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar stock'
    });
  }
};

/**
 * @route   DELETE /api/productos/:id
 * @desc    Elimina un producto
 * @access  Private (requiere JWT)
 * 
 * @param {string} req.params.id - ID del producto
 * @param {Object} req.usuario - Usuario del JWT
 * 
 * @returns {Object} 200 - Producto eliminado
 * @returns {Object} 403 - No autorizado
 * @returns {Object} 404 - Producto no encontrado
 * @returns {Object} 500 - Error del servidor
 */
const eliminarProducto = async (req, res) => {
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
    await tienda.decrementarProductos();

    console.log(`✅ Producto eliminado: ${producto.nombre}`);

    res.json({
      success: true,
      data: {}
    });

  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar producto'
    });
  }
};

/**
 * @route   POST /api/productos/:id/click-whatsapp
 * @desc    Registra un click en el botón de WhatsApp
 * @access  Public
 * 
 * @param {string} req.params.id - ID del producto
 * @returns {Object} 200 - Click registrado
 * @returns {Object} 404 - Producto no encontrado
 * @returns {Object} 500 - Error del servidor
 */
const registrarClickWhatsApp = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Incrementar contador (async, no esperar)
    producto.incrementarClicksWhatsApp().catch(err =>
      console.error('Error al incrementar clicks WhatsApp:', err)
    );

    res.json({
      success: true,
      data: { clicks_whatsapp: producto.clicks_whatsapp + 1 }
    });

  } catch (error) {
    console.error('❌ Error al registrar click:', error);
    res.status(500).json({
      success: false,
      error: 'Error al registrar click'
    });
  }
};

module.exports = {
  obtenerMisProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  actualizarStock,
  eliminarProducto,
  registrarClickWhatsApp
};