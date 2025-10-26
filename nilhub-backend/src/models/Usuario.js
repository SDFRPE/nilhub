// backend/src/models/Usuario.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @description Esquema de Usuario para la plataforma NilHub
 * Gestiona autenticación, roles y datos personales de vendedores
 * 
 * @typedef {Object} Usuario
 * @property {string} nombre - Nombre completo del usuario
 * @property {string} email - Email único (usado para login)
 * @property {string} password - Contraseña hasheada con bcrypt
 * @property {string} telefono - Teléfono opcional
 * @property {string} role - Rol del usuario: 'vendedor' o 'admin'
 * @property {boolean} activo - Si el usuario está activo
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de última actualización
 */
const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No incluir password en queries por defecto
  },
  telefono: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['vendedor', 'admin'], // ⚠️ CAMBIO: Consistente con el resto del sistema
    default: 'vendedor'
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // createdAt, updatedAt
});

// ===================================
// MIDDLEWARE: Hashear password antes de guardar
// ===================================

/**
 * @description Middleware pre-save que hashea el password automáticamente
 * Solo hashea si el password fue modificado (evita doble hashing)
 * @middleware
 */
usuarioSchema.pre('save', async function(next) {
  // Solo hashear si el password fue modificado
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generar salt y hashear password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ===================================
// MÉTODOS DE INSTANCIA
// ===================================

/**
 * @description Compara una contraseña ingresada con la hasheada
 * @param {string} passwordIngresado - Contraseña en texto plano
 * @returns {Promise<boolean>} True si coincide, false si no
 * @example
 * const esCorrecta = await usuario.compararPassword('mipassword123');
 */
usuarioSchema.methods.compararPassword = async function(passwordIngresado) {
  return await bcrypt.compare(passwordIngresado, this.password);
};

/**
 * @description Verifica si el usuario es administrador
 * @returns {boolean} True si es admin, false si no
 * @example
 * if (usuario.esAdmin()) { // Lógica de admin }
 */
usuarioSchema.methods.esAdmin = function() {
  return this.role === 'admin';
};

/**
 * @description Obtener objeto público (sin password ni campos internos)
 * Se ejecuta automáticamente al convertir a JSON
 * @returns {Object} Usuario sin datos sensibles
 */
usuarioSchema.methods.toJSON = function() {
  const usuario = this.toObject();
  delete usuario.password;
  delete usuario.__v;
  return usuario;
};

// ===================================
// ÍNDICES
// ===================================
usuarioSchema.index({ email: 1 }); // Búsqueda rápida por email
usuarioSchema.index({ activo: 1 }); // Filtrar usuarios activos
usuarioSchema.index({ role: 1 }); // Filtrar por rol

module.exports = mongoose.model('Usuario', usuarioSchema);