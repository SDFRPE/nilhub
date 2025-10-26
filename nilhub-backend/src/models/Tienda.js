// src/models/Tienda.js
const mongoose = require('mongoose');

const tiendaSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
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
    match: [/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones']
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
    default: true
  },
  total_productos: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// ===================================
// MÉTODOS ESTÁTICOS
// ===================================

// Generar slug único
tiendaSchema.statics.generarSlugUnico = async function(nombre) {
  // Convertir nombre a slug
  let slug = nombre
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-'); // Múltiples guiones a uno solo

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
// MIDDLEWARE
// ===================================

// Generar slug automáticamente antes de guardar
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