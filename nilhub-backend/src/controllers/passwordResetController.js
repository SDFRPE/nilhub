// backend/src/controllers/passwordResetController.js
const Usuario = require('../models/Usuario');
const PasswordReset = require('../models/PasswordReset');
const bcrypt = require('bcryptjs');
const { enviarCodigoRecuperacion, enviarConfirmacionCambio } = require('../services/emailService');

/**
 * @description Normaliza emails de forma consistente (lowercase + trim)
 * Respeta puntos y caracteres especiales (importante para Gmail)
 * @param {string} email - Email a normalizar
 * @returns {string} Email normalizado
 * @private
 */
const normalizarEmail = (email) => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

/**
 * @description Genera un código aleatorio de 6 dígitos
 * @returns {string} Código de 6 dígitos
 * @private
 */
const generarCodigo = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicita un código de recuperación de contraseña
 * @access  Public
 * 
 * @param {Object} req.body
 * @param {string} req.body.email - Email del usuario
 * @param {string} req.body.metodo - Método de envío: 'email' o 'whatsapp'
 * 
 * @returns {Object} 200 - Código enviado (no revela si el email existe)
 * @returns {Object} 400 - Validación fallida
 * @returns {Object} 429 - Rate limit (ya solicitó hace menos de 5 min)
 * @returns {Object} 500 - Error del servidor
 */
const solicitarRecuperacion = async (req, res) => {
  try {
    const { email, metodo } = req.body;

    // Validaciones
    if (!email || !metodo) {
      return res.status(400).json({
        success: false,
        error: 'Email y método son requeridos'
      });
    }

    if (!['email', 'whatsapp'].includes(metodo)) {
      return res.status(400).json({
        success: false,
        error: 'Método inválido. Usa "email" o "whatsapp"'
      });
    }

    // Normalizar email
    const emailNormalizado = normalizarEmail(email);

    // Buscar usuario
    const usuario = await Usuario.findOne({ email: emailNormalizado });

    if (!usuario) {
      // 🔒 SEGURIDAD: No revelar si el email existe
      console.log(`⚠️ EMAIL NO ENCONTRADO: ${email} (normalizado: ${emailNormalizado})`);
      return res.status(200).json({
        success: true,
        message: 'Si el email existe, recibirás un código de recuperación'
      });
    }

    // Verificar rate limit (últimos 5 minutos)
    const solicitudReciente = await PasswordReset.findOne({
      email: emailNormalizado,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

    if (solicitudReciente) {
      return res.status(429).json({
        success: false,
        error: 'Ya solicitaste un código recientemente. Espera 5 minutos.'
      });
    }

    // Generar código de 6 dígitos
    const code = generarCodigo();

    // Crear registro de reset
    const passwordReset = new PasswordReset({
      usuario_id: usuario._id,
      email: usuario.email,
      code: code,
      metodo: metodo,
      expira: new Date(Date.now() + 60 * 60 * 1000) // 1 hora
    });

    await passwordReset.save();

    // 🖥️ MOSTRAR CÓDIGO EN CONSOLA (útil para desarrollo)
    console.log('');
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║     🔐 CÓDIGO DE RECUPERACIÓN            ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log(`  📧 Email: ${usuario.email}`);
    console.log(`  👤 Usuario: ${usuario.nombre}`);
    console.log(`  🔢 Código: ${code}`);
    console.log(`  📱 Método: ${metodo}`);
    console.log(`  ⏰ Expira: ${passwordReset.expira.toLocaleString('es-PE')}`);
    console.log('');

    // 📧 ENVIAR EMAIL
    if (metodo === 'email') {
      try {
        await enviarCodigoRecuperacion(usuario.email, usuario.nombre, code);
        console.log('✅ Email enviado exitosamente a:', usuario.email);
      } catch (emailError) {
        console.error('❌ Error al enviar email:', emailError.message);
        // No fallar - el código ya está guardado y en consola
      }
    }

    // 📲 ENVIAR WHATSAPP (futuro)
    if (metodo === 'whatsapp') {
      console.log('📲 WhatsApp: Integración pendiente (Twilio API)');
      // TODO: Implementar con Twilio
    }

    return res.status(200).json({
      success: true,
      message: metodo === 'email' 
        ? `Código enviado a ${email}. Revisa tu bandeja de entrada.` 
        : 'Código generado. Revisa la consola del servidor.',
      // ⚠️ SOLO EN DESARROLLO
      ...(process.env.NODE_ENV === 'development' && { code })
    });

  } catch (error) {
    console.error('❌ Error en solicitarRecuperacion:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud'
    });
  }
};

/**
 * @route   POST /api/auth/verify-reset-code
 * @desc    Verifica que un código de recuperación sea válido
 * @access  Public
 * 
 * @param {Object} req.body
 * @param {string} req.body.email - Email del usuario
 * @param {string} req.body.code - Código de 6 dígitos
 * 
 * @returns {Object} 200 - Código válido
 * @returns {Object} 400 - Código inválido, usado, expirado o sin intentos
 * @returns {Object} 500 - Error del servidor
 */
const verificarCodigo = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Validaciones
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email y código son requeridos'
      });
    }

    // Normalizar email
    const emailNormalizado = normalizarEmail(email);

    // Buscar reset activo
    const passwordReset = await PasswordReset.findOne({
      email: emailNormalizado,
      code: code.trim()
    });

    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        error: 'Código inválido'
      });
    }

    // Verificar validez (no usado, < 3 intentos, no expirado)
    if (!passwordReset.esValido()) {
      let mensaje = 'Código inválido o expirado';
      
      if (passwordReset.usado) {
        mensaje = 'Este código ya fue usado';
      } else if (passwordReset.intentos >= 3) {
        mensaje = 'Has superado el número máximo de intentos';
      } else if (passwordReset.expira < new Date()) {
        mensaje = 'El código ha expirado';
      }

      return res.status(400).json({
        success: false,
        error: mensaje
      });
    }

    // Incrementar contador de intentos
    await passwordReset.incrementarIntentos();

    return res.status(200).json({
      success: true,
      message: 'Código válido'
    });

  } catch (error) {
    console.error('❌ Error en verificarCodigo:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al verificar el código'
    });
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Cambia la contraseña usando un código válido
 * @access  Public
 * 
 * @param {Object} req.body
 * @param {string} req.body.email - Email del usuario
 * @param {string} req.body.code - Código de 6 dígitos
 * @param {string} req.body.nuevaPassword - Nueva contraseña (min 6 caracteres)
 * 
 * @returns {Object} 200 - Contraseña actualizada
 * @returns {Object} 400 - Validación fallida o código inválido
 * @returns {Object} 404 - Usuario no encontrado
 * @returns {Object} 500 - Error del servidor
 */
const resetPassword = async (req, res) => {
  try {
    const { email, code, nuevaPassword } = req.body;

    // Validaciones
    if (!email || !code || !nuevaPassword) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos'
      });
    }

    if (nuevaPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Normalizar email
    const emailNormalizado = normalizarEmail(email);

    // Buscar reset
    const passwordReset = await PasswordReset.findOne({
      email: emailNormalizado,
      code: code.trim()
    });

    if (!passwordReset || !passwordReset.esValido()) {
      return res.status(400).json({
        success: false,
        error: 'Código inválido o expirado'
      });
    }

    // Buscar usuario
    const usuario = await Usuario.findById(passwordReset.usuario_id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Hashear nueva contraseña manualmente
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(nuevaPassword, salt);

    // ⚠️ IMPORTANTE: Usar updateOne para BYPASS del middleware pre-save
    // Esto evita doble hashing
    await Usuario.updateOne(
      { _id: usuario._id },
      { $set: { password: passwordHash } }
    );

    // Marcar código como usado
    await passwordReset.marcarComoUsado();

    console.log(`✅ Contraseña actualizada para: ${usuario.email}`);

    // 📧 Enviar email de confirmación
    try {
      await enviarConfirmacionCambio(usuario.email, usuario.nombre);
      console.log('✅ Email de confirmación enviado');
    } catch (emailError) {
      console.error('⚠️ No se pudo enviar email de confirmación:', emailError.message);
      // No fallar - la contraseña ya se cambió
    }

    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en resetPassword:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al actualizar la contraseña'
    });
  }
};

module.exports = {
  solicitarRecuperacion,
  verificarCodigo,
  resetPassword
};