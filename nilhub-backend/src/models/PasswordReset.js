// backend/src/models/PasswordReset.js
const mongoose = require('mongoose');

/**
 * @description Esquema para recuperación de contraseñas
 * Almacena códigos temporales de 6 dígitos con expiración
 * 
 * @typedef {Object} PasswordReset
 * @property {ObjectId} usuario_id - ID del usuario
 * @property {string} email - Email del usuario (normalizado)
 * @property {string} code - Código de 6 dígitos
 * @property {string} metodo - Método de envío: 'email' o 'whatsapp'
 * @property {Date} expira - Fecha de expiración (1 hora)
 * @property {number} intentos - Intentos de uso (máx 3)
 * @property {boolean} usado - Si ya fue usado
 * @property {Date} createdAt - Fecha de creación
 */
const passwordResetSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  code: {
    type: String,
    required: true,
    minlength: [6, 'El código debe tener 6 dígitos'], // ⚠️ FIX: Validación correcta
    maxlength: [6, 'El código debe tener 6 dígitos']
  },
  metodo: {
    type: String,
    enum: ['email', 'whatsapp'],
    required: true
  },
  expira: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hora
    index: true
  },
  intentos: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  usado: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// ===================================
// ÍNDICES
// ===================================

/**
 * Índice TTL para expiración automática de documentos
 * MongoDB elimina documentos cuando pasa la fecha de 'expira'
 */
passwordResetSchema.index({ expira: 1 }, { expireAfterSeconds: 0 });

/**
 * Índice compuesto para búsquedas rápidas por email + código
 */
passwordResetSchema.index({ email: 1, code: 1 });

// ===================================
// MÉTODOS DE INSTANCIA
// ===================================

/**
 * @description Verifica si el código de recuperación es válido
 * Chequea: no usado, intentos < 3, no expirado
 * @returns {boolean} True si es válido, false si no
 * @example
 * if (passwordReset.esValido()) {
 *   // Permitir cambio de contraseña
 * }
 */
passwordResetSchema.methods.esValido = function() {
  return (
    !this.usado &&
    this.intentos < 3 &&
    this.expira > new Date()
  );
};

/**
 * @description Incrementa el contador de intentos
 * Se llama cada vez que se verifica el código
 * @returns {Promise<void>}
 * @example
 * await passwordReset.incrementarIntentos();
 */
passwordResetSchema.methods.incrementarIntentos = async function() {
  this.intentos += 1;
  await this.save();
};

/**
 * @description Marca el código como usado (no puede reutilizarse)
 * Se llama después de cambiar la contraseña exitosamente
 * @returns {Promise<void>}
 * @example
 * await passwordReset.marcarComoUsado();
 */
passwordResetSchema.methods.marcarComoUsado = async function() {
  this.usado = true;
  await this.save();
};

// ===================================
// MÉTODOS ESTÁTICOS
// ===================================

/**
 * @description Limpia códigos expirados o usados manualmente
 * Útil para limpieza programada más allá del TTL
 * @static
 * @returns {Promise<number>} Cantidad de documentos eliminados
 * @example
 * const eliminados = await PasswordReset.limpiarExpirados();
 * console.log(`Se eliminaron ${eliminados} códigos`);
 */
passwordResetSchema.statics.limpiarExpirados = async function() {
  const resultado = await this.deleteMany({
    $or: [
      { expira: { $lt: new Date() } },
      { usado: true },
      { intentos: { $gte: 3 } }
    ]
  });
  return resultado.deletedCount;
};

/**
 * @description Obtiene estadísticas de códigos de recuperación
 * @static
 * @returns {Promise<Object>} Estadísticas
 * @example
 * const stats = await PasswordReset.obtenerEstadisticas();
 * // { activos: 5, expirados: 2, usados: 10 }
 */
passwordResetSchema.statics.obtenerEstadisticas = async function() {
  const ahora = new Date();
  
  const [activos, expirados, usados] = await Promise.all([
    this.countDocuments({ expira: { $gt: ahora }, usado: false }),
    this.countDocuments({ expira: { $lte: ahora }, usado: false }),
    this.countDocuments({ usado: true })
  ]);

  return { activos, expirados, usados };
};

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;