// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Usuario = require('../models/Usuario');
const Tienda = require('../models/Tienda');
const { generarToken, protect } = require('../middleware/auth');

/**
 * Función helper para normalizar emails consistentemente
 * Solo lowercase + trim (respeta puntos y símbolos)
 */
const normalizarEmail = (email) => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

// ===================================
// POST /api/auth/registro
// Registrar nuevo usuario + crear tienda
// ===================================
router.post('/registro', [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').isEmail().withMessage('Ingresa un email válido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('nombreTienda').trim().notEmpty().withMessage('El nombre de la tienda es obligatorio'),
  body('whatsapp').matches(/^[0-9]{8,15}$/).withMessage('Ingresa un número de WhatsApp válido (solo números, 8-15 dígitos)')
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

    // Generar token
    const token = generarToken(usuario._id);

    res.status(201).json({
      success: true,
      data: {
        usuario: {
          _id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email
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
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      error: 'Error al registrar usuario'
    });
  }
});

// ===================================
// POST /api/auth/login
// Iniciar sesión
// ===================================
router.post('/login', [
  body('email').isEmail().withMessage('Ingresa un email válido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria')
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
        error: 'Usuario inactivo'
      });
    }

    // Obtener tienda del usuario
    const tienda = await Tienda.findOne({ usuario_id: usuario._id });

    // Generar token
    const token = generarToken(usuario._id);

    res.json({
      success: true,
      data: {
        usuario: {
          _id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email
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
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error al iniciar sesión'
    });
  }
});

// ===================================
// GET /api/auth/me
// Obtener usuario actual (protegida)
// ===================================
router.get('/me', protect, async (req, res) => {
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
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuario'
    });
  }
});

module.exports = router;