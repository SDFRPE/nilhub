// src/models/Producto.js
const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  tienda_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tienda',
    required: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  descripcion: {
    type: String,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: ['maquillaje', 'skincare', 'fragancias', 'cuidado-personal', 'accesorios', 'otros'],
    lowercase: true
  },
  marca: {
    type: String,
    trim: true,
    maxlength: [50, 'La marca no puede exceder 50 caracteres']
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  precio_oferta: {
    type: Number,
    min: [0, 'El precio de oferta no puede ser negativo'],
    validate: {
      validator: function(value) {
        // Si hay precio de oferta, debe ser menor al precio normal
        return !value || value < this.precio;
      },
      message: 'El precio de oferta debe ser menor al precio normal'
    }
  },
  stock: {
    type: Number,
    required: [true, 'El stock es obligatorio'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  hay_stock: {
    type: Boolean,
    default: true
  },
  imagenes: [{
    url: {
      type: String,
      required: true
    },
    cloudinary_id: {
      type: String,
      required: true
    }
  }],
  ingredientes: {
    type: String,
    maxlength: [500, 'Los ingredientes no pueden exceder 500 caracteres']
  },
  peso: {
    type: String,
    maxlength: [50, 'El peso no puede exceder 50 caracteres']
  },
  activo: {
    type: Boolean,
    default: true
  },
  // Estadísticas
  vistas: {
    type: Number,
    default: 0
  },
  clicks_whatsapp: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// ===================================
// MIDDLEWARE
// ===================================

// Actualizar hay_stock según el stock
productoSchema.pre('save', function(next) {
  this.hay_stock = this.stock > 0;
  next();
});

// ===================================
// MÉTODOS DE INSTANCIA
// ===================================

// Incrementar vistas
productoSchema.methods.incrementarVistas = async function() {
  this.vistas += 1;
  return await this.save();
};

// Incrementar clicks de WhatsApp
productoSchema.methods.incrementarClicksWhatsApp = async function() {
  this.clicks_whatsapp += 1;
  return await this.save();
};

// Actualizar stock
productoSchema.methods.actualizarStock = async function(nuevoStock) {
  this.stock = nuevoStock;
  this.hay_stock = nuevoStock > 0;
  return await this.save();
};

// ===================================
// MÉTODOS ESTÁTICOS
// ===================================

// Obtener productos por categoría
productoSchema.statics.porCategoria = function(tiendaId, categoria) {
  const query = { tienda_id: tiendaId, activo: true };
  if (categoria !== 'todas') {
    query.categoria = categoria;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Buscar productos
productoSchema.statics.buscar = function(tiendaId, terminoBusqueda) {
  return this.find({
    tienda_id: tiendaId,
    activo: true,
    $or: [
      { nombre: { $regex: terminoBusqueda, $options: 'i' } },
      { descripcion: { $regex: terminoBusqueda, $options: 'i' } },
      { marca: { $regex: terminoBusqueda, $options: 'i' } }
    ]
  }).sort({ createdAt: -1 });
};

// ===================================
// ÍNDICES
// ===================================
productoSchema.index({ tienda_id: 1 });
productoSchema.index({ categoria: 1 });
productoSchema.index({ activo: 1 });
productoSchema.index({ nombre: 'text', descripcion: 'text', marca: 'text' });

module.exports = mongoose.model('Producto', productoSchema);