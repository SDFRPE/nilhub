// backend/src/models/Tienda.js
const mongoose = require('mongoose');

/**
 * @description Esquema de Tienda virtual en NilHub
 * Cada vendedor tiene una tienda con catálogo personalizado
 * 
 * @typedef {Object} Tienda
 * @property {ObjectId} usuario_id - ID del dueño de la tienda
 * @property {string} nombre - Nombre de la tienda
 * @property {string} slug - URL amigable única (nilhub.xyz/slug)
 * @property {string} descripcion - Descripción opcional
 * @property {string} whatsapp - Número de WhatsApp (8-15 dígitos)
 * @property {string} instagram - Usuario de Instagram
 * @property {string} facebook - URL de Facebook
 * @property {string} logo_url - URL del logo en Cloudinary
 * @property {string} logo_cloudinary_id - ID en Cloudinary del logo
 * @property {string} banner_url - URL del banner en Cloudinary
 * @property {string} banner_cloudinary_id - ID en Cloudinary del banner
 * @property {string} color_tema - Color hexadecimal del tema
 * @property {boolean} activa - Si la tienda está activa
 * @property {number} total_productos - Contador de productos (manual)
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de última actualización
 */
const tiendaSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    index: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre de la tienda es obligatorio'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'],
    index: true
  },
  descripcion: {
    type: String,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  whatsapp: {
    type: String,
    required: [true, 'El número de WhatsApp es obligatorio'],
    match: [/^[0-9]{8,15}$/, 'Ingresa un número de WhatsApp válido (solo números, 8-15 dígitos)']
  },
  instagram: {
    type: String,
    trim: true
  },
  facebook: {
    type: String,
    trim: true
  },
  logo_url: {
    type: String
  },
  logo_cloudinary_id: {
    type: String
  },
  banner_url: {
    type: String
  },
  banner_cloudinary_id: {
    type: String
  },
  color_tema: {
    type: String,
    default: '#EC4899', // Rosa por defecto
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Ingresa un color hexadecimal válido']
  },
  activa: {
    type: Boolean,
    default: true,
    index: true
  },
  total_productos: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// ===================================
// MÉTODOS ESTÁTICOS
// ===================================

/**
 * @description Genera un slug único a partir del nombre de la tienda
 * Si el slug ya existe, agrega un número al final (-1, -2, etc)
 * @static
 * @param {string} nombre - Nombre de la tienda
 * @returns {Promise<string>} Slug único generado
 * @example
 * const slug = await Tienda.generarSlugUnico('Cosméticos Mary');
 * // Retorna: 'cosmeticos-mary' o 'cosmeticos-mary-2' si ya existe
 */
tiendaSchema.statics.generarSlugUnico = async function(nombre) {
  // Convertir nombre a slug
  let slug = nombre
    .toLowerCase()
    .trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno solo
    .replace(/^-|-$/g, ''); // Quitar guiones al inicio/fin

  // Verificar si el slug ya existe
  let slugUnico = slug;
  let contador = 1;

  while (await this.findOne({ slug: slugUnico })) {
    slugUnico = `${slug}-${contador}`;
    contador++;
  }

  return slugUnico;
};

// ===================================
// MÉTODOS DE INSTANCIA
// ===================================

/**
 * @description Incrementa el contador de productos de la tienda
 * @returns {Promise<Tienda>} Tienda actualizada
 * @example
 * await tienda.incrementarProductos();
 */
tiendaSchema.methods.incrementarProductos = async function() {
  this.total_productos += 1;
  return await this.save();
};

/**
 * @description Decrementa el contador de productos de la tienda
 * @returns {Promise<Tienda>} Tienda actualizada
 * @example
 * await tienda.decrementarProductos();
 */
tiendaSchema.methods.decrementarProductos = async function() {
  if (this.total_productos > 0) {
    this.total_productos -= 1;
  }
  return await this.save();
};

/**
 * @description Recalcula el total de productos desde la BD
 * Útil para sincronizar en caso de desajuste
 * @returns {Promise<number>} Nuevo total de productos
 * @example
 * const total = await tienda.recalcularTotalProductos();
 */
tiendaSchema.methods.recalcularTotalProductos = async function() {
  const Producto = mongoose.model('Producto');
  const total = await Producto.countDocuments({ 
    tienda_id: this._id, 
    activo: true 
  });
  this.total_productos = total;
  await this.save();
  return total;
};

// ===================================
// MIDDLEWARE
// ===================================

/**
 * @description Genera slug automáticamente antes de guardar (solo en creación)
 * @middleware
 */
tiendaSchema.pre('save', async function(next) {
  if (this.isNew && !this.slug) {
    this.slug = await this.constructor.generarSlugUnico(this.nombre);
  }
  next();
});

// ===================================
// ÍNDICES
// ===================================
tiendaSchema.index({ usuario_id: 1 });
tiendaSchema.index({ slug: 1 });
tiendaSchema.index({ activa: 1 });

module.exports = mongoose.model('Tienda', tiendaSchema);