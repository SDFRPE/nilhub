// backend/src/controllers/authController.js
const Usuario = require('../models/Usuario');
const Tienda = require('../models/Tienda');
const { generarToken } = require('../middleware/auth');

/**
 * @description Normaliza emails de forma consistente (lowercase + trim)
 * @param {string} email - Email a normalizar
 * @returns {string} Email normalizado
 * @private
 */
const normalizarEmail = (email) => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

/**
 * @route   POST /api/auth/registro
 * @desc    Registra un nuevo usuario y crea su tienda
 * @access  Public
 */
const registro = async (req, res) => {
  try {
    const { nombre, email, password, nombreTienda, whatsapp, instagram, facebook } = req.body;

    // Normalizar email
    const emailNormalizado = normalizarEmail(email);

    // Verificar si el usuario ya existe
    const usuarioExiste = await Usuario.findOne({ email: emailNormalizado });
    if (usuarioExiste) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    // Crear usuario con email normalizado
    const usuario = await Usuario.create({
      nombre,
      email: emailNormalizado,
      password // Se hasheará automáticamente por el middleware del modelo
    });

    // Generar slug único para la tienda
    const slug = await Tienda.generarSlugUnico(nombreTienda);

    // Crear tienda del usuario
    const tienda = await Tienda.create({
      usuario_id: usuario._id,
      nombre: nombreTienda,
      slug,
      whatsapp,
      instagram,
      facebook
    });

    // Generar token JWT
    const token = generarToken(usuario._id);

    console.log(`✅ Usuario registrado: ${usuario.email} | Tienda: ${tienda.slug}`);

    res.status(201).json({
      success: true,
      data: {
        usuario: {
          _id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol  // ✅ CORREGIDO: role → rol
        },
        tienda: {
          _id: tienda._id,
          nombre: tienda.nombre,
          slug: tienda.slug
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errores[0] || 'Error de validación'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al registrar usuario'
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Inicia sesión con email y contraseña
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Normalizar email
    const emailNormalizado = normalizarEmail(email);

    // Buscar usuario (incluir password para comparar)
    const usuario = await Usuario.findOne({ email: emailNormalizado }).select('+password');

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar password
    const passwordCorrecto = await usuario.compararPassword(password);

    if (!passwordCorrecto) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        error: 'Usuario inactivo. Contacta al administrador.'
      });
    }

    // Obtener tienda del usuario (puede ser null si es admin)
    const tienda = await Tienda.findOne({ usuario_id: usuario._id });

    // Generar token JWT
    const token = generarToken(usuario._id);

    console.log(`✅ Login exitoso: ${usuario.email} | Rol: ${usuario.rol}`);

    res.json({
      success: true,
      data: {
        usuario: {
          _id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol  // ✅ CORREGIDO: role → rol
        },
        tienda: tienda ? {
          _id: tienda._id,
          nombre: tienda.nombre,
          slug: tienda.slug
        } : null,
        token
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error al iniciar sesión'
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Obtiene el usuario actual autenticado
 * @access  Private (requiere JWT)
 */
const obtenerUsuarioActual = async (req, res) => {
  try {
    // req.usuario ya está disponible gracias al middleware protect
    const tienda = await Tienda.findOne({ usuario_id: req.usuario._id });

    res.json({
      success: true,
      data: {
        usuario: req.usuario,
        tienda
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuario'
    });
  }
};

module.exports = {
  registro,
  login,
  obtenerUsuarioActual
};