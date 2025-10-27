// backend/src/models/Producto.js
const mongoose = require('mongoose');

/**
 * @description Esquema de Producto para catálogos de NilHub
 * Maneja inventario, precios, imágenes y estadísticas
 * 
 * @typedef {Object} Producto
 * @property {ObjectId} tienda_id - ID de la tienda dueña
 * @property {string} nombre - Nombre del producto
 * @property {string} descripcion - Descripción detallada
 * @property {string} categoria - Categoría del producto
 * @property {string} marca - Marca del producto
 * @property {number} precio - Precio regular
 * @property {number} precio_oferta - Precio en oferta (opcional)
 * @property {number} stock - Cantidad en inventario (manual)
 * @property {boolean} hay_stock - Si hay stock disponible
 * @property {Array<Object>} imagenes - URLs de Cloudinary
 * @property {string} ingredientes - Lista de ingredientes
 * @property {string} peso - Peso o tamaño del producto
 * @property {boolean} activo - Si el producto está visible
 * @property {number} vistas - Contador de vistas
 * @property {number} clicks_whatsapp - Clicks en botón WhatsApp
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de última actualización
 */
const productoSchema = new mongoose.Schema({
  tienda_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tienda',
    required: true,
    index: true
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
    lowercase: true,
    index: true
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
  // ✅ CORREGIDO: Eliminado el validador que causaba problemas con findByIdAndUpdate
  // La validación se hace en el controller con parseFloat() correcto
  precio_oferta: {
    type: Number,
    min: [0, 'El precio de oferta no puede ser negativo']
    // ❌ REMOVIDO: validate (causaba conflicto con findByIdAndUpdate)
    // ✅ La validación precio_oferta < precio se hace en el controller
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
    default: true,
    index: true
  },
  // Estadísticas
  vistas: {
    type: Number,
    default: 0,
    min: 0
  },
  clicks_whatsapp: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// ===================================
// MIDDLEWARE
// ===================================

/**
 * @description Actualiza hay_stock automáticamente según el stock
 * Se ejecuta antes de guardar con .save()
 * ⚠️ NO se ejecuta con .updateOne(), .findOneAndUpdate(), etc
 * @middleware
 */
productoSchema.pre('save', function(next) {
  this.hay_stock = this.stock > 0;
  next();
});

// ===================================
// MÉTODOS DE INSTANCIA
// ===================================

/**
 * @description Incrementa el contador de vistas del producto
 * @returns {Promise<Producto>} Producto actualizado
 * @example
 * await producto.incrementarVistas();
 */
productoSchema.methods.incrementarVistas = async function() {
  this.vistas += 1;
  return await this.save();
};

/**
 * @description Incrementa el contador de clicks en WhatsApp
 * @returns {Promise<Producto>} Producto actualizado
 * @example
 * await producto.incrementarClicksWhatsApp();
 */
productoSchema.methods.incrementarClicksWhatsApp = async function() {
  this.clicks_whatsapp += 1;
  return await this.save();
};

/**
 * @description Actualiza el stock del producto y recalcula hay_stock
 * ⚠️ USAR ESTE MÉTODO en lugar de updateOne para que funcione el middleware
 * @param {number} nuevoStock - Nueva cantidad de stock
 * @returns {Promise<Producto>} Producto actualizado
 * @example
 * await producto.actualizarStock(15);
 */
productoSchema.methods.actualizarStock = async function(nuevoStock) {
  this.stock = nuevoStock;
  this.hay_stock = nuevoStock > 0;
  return await this.save();
};

// ===================================
// MÉTODOS ESTÁTICOS
// ===================================

/**
 * @description Obtiene productos de una tienda filtrados por categoría
 * @static
 * @param {string|ObjectId} tiendaId - ID de la tienda
 * @param {string} categoria - Categoría a filtrar ('todas' para todas)
 * @returns {Promise<Array<Producto>>} Lista de productos
 * @example
 * const productos = await Producto.porCategoria(tiendaId, 'maquillaje');
 */
productoSchema.statics.porCategoria = function(tiendaId, categoria) {
  const query = { tienda_id: tiendaId, activo: true };
  if (categoria && categoria !== 'todas') {
    query.categoria = categoria;
  }
  return this.find(query).sort({ createdAt: -1 });
};

/**
 * @description Busca productos por texto en nombre, descripción o marca
 * @static
 * @param {string|ObjectId} tiendaId - ID de la tienda
 * @param {string} terminoBusqueda - Término a buscar
 * @returns {Promise<Array<Producto>>} Lista de productos encontrados
 * @example
 * const resultados = await Producto.buscar(tiendaId, 'labial');
 */
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

/**
 * @description Obtiene productos relacionados por categoría
 * Excluye el producto actual
 * @static
 * @param {string|ObjectId} tiendaId - ID de la tienda
 * @param {string} categoria - Categoría del producto
 * @param {string|ObjectId} excluirId - ID del producto a excluir
 * @param {number} limite - Cantidad máxima de resultados
 * @returns {Promise<Array<Producto>>} Lista de productos relacionados
 * @example
 * const relacionados = await Producto.relacionados(tiendaId, 'maquillaje', productoId, 4);
 */
productoSchema.statics.relacionados = function(tiendaId, categoria, excluirId, limite = 4) {
  return this.find({
    tienda_id: tiendaId,
    categoria: categoria,
    activo: true,
    _id: { $ne: excluirId }
  })
  .limit(limite)
  .sort({ createdAt: -1 });
};

// ===================================
// ÍNDICES
// ===================================
productoSchema.index({ tienda_id: 1, activo: 1 }); // Compuesto para queries frecuentes
productoSchema.index({ categoria: 1 });
productoSchema.index({ nombre: 'text', descripcion: 'text', marca: 'text' }); // Text search

module.exports = mongoose.model('Producto', productoSchema);