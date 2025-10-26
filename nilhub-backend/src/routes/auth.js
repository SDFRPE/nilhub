// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/auth/registro
 * @desc    Registrar nuevo usuario y crear tienda
 * @access  Public
 */
router.post('/registro', [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio'),
  body('email')
    .isEmail()
    .withMessage('Ingresa un email válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('nombreTienda')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la tienda es obligatorio'),
  body('whatsapp')
    .matches(/^[0-9]{8,15}$/)
    .withMessage('Ingresa un número de WhatsApp válido (solo números, 8-15 dígitos)')
], authController.registro);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Ingresa un email válido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
], authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener usuario actual
 * @access  Private
 */
router.get('/me', protect, authController.obtenerUsuarioActual);

module.exports = router;