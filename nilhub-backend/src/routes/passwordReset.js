// backend/src/routes/passwordReset.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const passwordResetController = require('../controllers/passwordResetController');

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar código de recuperación
 * @access  Public
 */
router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail()
      .withMessage('Email inválido'),
    body('metodo')
      .isIn(['email', 'whatsapp'])
      .withMessage('Método debe ser "email" o "whatsapp"')
  ],
  passwordResetController.solicitarRecuperacion
);

/**
 * @route   POST /api/auth/verify-reset-code
 * @desc    Verificar que el código es válido
 * @access  Public
 */
router.post(
  '/verify-reset-code',
  [
    body('email')
      .isEmail()
      .withMessage('Email inválido'),
    body('code')
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('Código debe tener 6 dígitos')
  ],
  passwordResetController.verificarCodigo
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Cambiar contraseña con código válido
 * @access  Public
 */
router.post(
  '/reset-password',
  [
    body('email')
      .isEmail()
      .withMessage('Email inválido'),
    body('code')
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('Código debe tener 6 dígitos'),
    body('nuevaPassword')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres')
  ],
  passwordResetController.resetPassword
);

module.exports = router;