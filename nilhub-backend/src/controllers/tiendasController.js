// backend/src/controllers/tiendasController.js
const Tienda = require('../models/Tienda');
const Producto = require('../models/Producto');

/**
 * @route   GET /api/tiendas/:slug
 * @desc    Obtiene tienda pública por slug (catálogo)
 * @access  Public
 */
const obtenerTiendaPorSlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const tienda = await Tienda.findOne({ slug, activa: true })
      .populate('usuario_id', 'nombre email')
      .lean();

    if (!tienda) {
      return res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
    }

    // ✅ FIX: Devolver tienda directamente
    res.status(200).json({
      success: true,
      data: tienda
    });

  } catch (error) {
    console.error('❌ Error en obtenerTiendaPorSlug:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener la tienda'
    });
  }
};

/**
 * @route   GET /api/tiendas/:slug/productos
 * @desc    Obtiene todos los productos de una tienda (catálogo público)
 * @access  Public
 */
const obtenerProductosDeTienda = async (req, res) => {
  try {
    const { slug } = req.params;
    const { categoria, buscar } = req.query;

    // Buscar tienda
    const tienda = await Tienda.findOne({ slug, activa: true }).lean();

    if (!tienda) {
      return res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
    }

    // Query base
    const query = {
      tienda_id: tienda._id,
      activo: true
    };

    // Filtrar por categoría
    if (categoria && categoria !== 'todas') {
      query.categoria = categoria;
    }

    // Buscar por texto
    if (buscar) {
      query.$or = [
        { nombre: { $regex: buscar, $options: 'i' } },
        { descripcion: { $regex: buscar, $options: 'i' } },
        { marca: { $regex: buscar, $options: 'i' } }
      ];
    }

    // Obtener productos
    const productos = await Producto.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // ✅ Mantener formato: devolver objeto con tienda y productos
    res.status(200).json({
      success: true,
      data: {
        tienda,
        productos,
        total: productos.length
      }
    });

  } catch (error) {
    console.error('❌ Error en obtenerProductosDeTienda:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos'
    });
  }
};

/**
 * @route   GET /api/tiendas/mi-tienda
 * @desc    Obtiene la tienda del usuario autenticado
 * @access  Private
 */
const obtenerMiTienda = async (req, res) => {
  try {
    const tienda = await Tienda.findOne({ usuario_id: req.usuario._id });

    if (!tienda) {
      return res.status(404).json({
        success: false,
        error: 'No tienes una tienda creada'
      });
    }

    // ✅ Devolver tienda directamente
    res.status(200).json({
      success: true,
      data: tienda
    });

  } catch (error) {
    console.error('❌ Error en obtenerMiTienda:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener la tienda'
    });
  }
};

/**
 * @route   POST /api/tiendas
 * @desc    Crea una nueva tienda
 * @access  Private
 */
const crearTienda = async (req, res) => {
  try {
    const { nombre, descripcion, whatsapp, instagram, facebook } = req.body;

    if (!nombre || !whatsapp) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y WhatsApp son obligatorios'
      });
    }

    const tiendaExistente = await Tienda.findOne({ usuario_id: req.usuario._id });

    if (tiendaExistente) {
      return res.status(400).json({
        success: false,
        error: 'Ya tienes una tienda creada'
      });
    }

    const tienda = new Tienda({
      usuario_id: req.usuario._id,
      nombre,
      descripcion,
      whatsapp,
      instagram,
      facebook,
      activa: true
    });

    await tienda.save();

    console.log(`✅ Tienda creada: ${tienda.nombre} (${tienda.slug})`);

    // ✅ Devolver tienda directamente
    res.status(201).json({
      success: true,
      data: tienda
    });

  } catch (error) {
    console.error('❌ Error en crearTienda:', error);
    
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errores[0] || 'Error de validación'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al crear la tienda'
    });
  }
};

/**
 * @route   PUT /api/tiendas/mi-tienda
 * @desc    Actualiza la tienda del usuario autenticado
 * @access  Private
 */
const actualizarTienda = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      whatsapp,
      instagram,
      facebook,
      logo_url,
      logo_cloudinary_id,
      banner_url,
      banner_cloudinary_id,
      color_tema
    } = req.body;

    const tienda = await Tienda.findOne({ usuario_id: req.usuario._id });

    if (!tienda) {
      return res.status(404).json({
        success: false,
        error: 'No tienes una tienda creada'
      });
    }

    // Actualizar solo campos que vienen en el request
    if (nombre !== undefined) tienda.nombre = nombre;
    if (descripcion !== undefined) tienda.descripcion = descripcion;
    if (whatsapp !== undefined) tienda.whatsapp = whatsapp;
    if (instagram !== undefined) tienda.instagram = instagram;
    if (facebook !== undefined) tienda.facebook = facebook;
    if (logo_url !== undefined) tienda.logo_url = logo_url;
    if (logo_cloudinary_id !== undefined) tienda.logo_cloudinary_id = logo_cloudinary_id;
    if (banner_url !== undefined) tienda.banner_url = banner_url;
    if (banner_cloudinary_id !== undefined) tienda.banner_cloudinary_id = banner_cloudinary_id;
    if (color_tema !== undefined) tienda.color_tema = color_tema;

    await tienda.save();

    console.log(`✅ Tienda actualizada: ${tienda.nombre}`);

    // ✅ Devolver tienda directamente
    res.status(200).json({
      success: true,
      data: tienda
    });

  } catch (error) {
    console.error('❌ Error en actualizarTienda:', error);
    
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errores[0] || 'Error de validación'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al actualizar la tienda'
    });
  }
};

module.exports = {
  obtenerTiendaPorSlug,
  obtenerProductosDeTienda,
  obtenerMiTienda,
  crearTienda,
  actualizarTienda
};