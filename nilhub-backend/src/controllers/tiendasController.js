// backend/src/controllers/tiendasController.js
const Tienda = require('../models/Tienda');
const Usuario = require('../models/Usuario');

/**
 * GET /api/tiendas/:slug
 * Obtener tienda pública por slug
 */
const obtenerTiendaPorSlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const tienda = await Tienda.findOne({ slug, activa: true })
      .populate('usuario_id', 'nombre email');

    if (!tienda) {
      return res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
    }

    // Incrementar visitas
    tienda.total_visitas = (tienda.total_visitas || 0) + 1;
    await tienda.save();

    res.status(200).json({
      success: true,
      tienda
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
 * GET /api/tiendas/mi-tienda
 * Obtener MI tienda (usuario autenticado)
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

    res.status(200).json({
      success: true,
      tienda
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
 * POST /api/tiendas
 * Crear nueva tienda
 */
const crearTienda = async (req, res) => {
  try {
    const { nombre, descripcion, whatsapp, instagram, facebook } = req.body;

    // Verificar que el usuario no tenga ya una tienda
    const tiendaExistente = await Tienda.findOne({ usuario_id: req.usuario._id });

    if (tiendaExistente) {
      return res.status(400).json({
        success: false,
        error: 'Ya tienes una tienda creada'
      });
    }

    // Generar slug único
    let slug = nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Verificar que el slug sea único
    let slugExiste = await Tienda.findOne({ slug });
    let contador = 1;
    
    while (slugExiste) {
      slug = `${slug}-${contador}`;
      slugExiste = await Tienda.findOne({ slug });
      contador++;
    }

    // Crear tienda
    const tienda = new Tienda({
      usuario_id: req.usuario._id,
      nombre,
      slug,
      descripcion,
      whatsapp,
      instagram,
      facebook,
      activa: true
    });

    await tienda.save();

    res.status(201).json({
      success: true,
      tienda
    });

  } catch (error) {
    console.error('❌ Error en crearTienda:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear la tienda'
    });
  }
};

/**
 * PUT /api/tiendas/:id
 * Actualizar tienda (logo, banner, nombre, datos, etc.)
 */
const actualizarTienda = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      whatsapp,
      instagram,
      facebook,
      logo_url,
      banner_url,
      color_tema
    } = req.body;

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

    // Actualizar campos (solo los que vienen en el request)
    if (nombre !== undefined) tienda.nombre = nombre;
    if (descripcion !== undefined) tienda.descripcion = descripcion;
    if (whatsapp !== undefined) tienda.whatsapp = whatsapp;
    if (instagram !== undefined) tienda.instagram = instagram;
    if (facebook !== undefined) tienda.facebook = facebook;
    if (logo_url !== undefined) tienda.logo_url = logo_url;
    if (banner_url !== undefined) tienda.banner_url = banner_url;
    if (color_tema !== undefined) tienda.color_tema = color_tema;

    tienda.updatedAt = Date.now();

    await tienda.save();

    console.log(`✅ Tienda actualizada: ${tienda.nombre}`);

    res.status(200).json({
      success: true,
      tienda
    });

  } catch (error) {
    console.error('❌ Error en actualizarTienda:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar la tienda'
    });
  }
};

module.exports = {
  obtenerTiendaPorSlug,
  obtenerMiTienda,
  crearTienda,
  actualizarTienda
};