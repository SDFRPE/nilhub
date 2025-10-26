// backend/src/models/PasswordReset.js
const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    length: 6
  },
  metodo: {
    type: String,
    enum: ['email', 'whatsapp'],
    required: true
  },
  expira: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 60 * 60 * 1000) // 1 hora
  },
  intentos: {
    type: Number,
    default: 0,
    max: 3
  },
  usado: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índice para expiración automática (TTL)
passwordResetSchema.index({ expira: 1 }, { expireAfterSeconds: 0 });

// Índice compuesto para búsquedas rápidas
passwordResetSchema.index({ email: 1, code: 1 });

// Método para verificar si el código es válido
passwordResetSchema.methods.esValido = function() {
  return (
    !this.usado &&
    this.intentos < 3 &&
    this.expira > new Date()
  );
};

// Método para incrementar intentos
passwordResetSchema.methods.incrementarIntentos = async function() {
  this.intentos += 1;
  await this.save();
};

// Método para marcar como usado
passwordResetSchema.methods.marcarComoUsado = async function() {
  this.usado = true;
  await this.save();
};

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;