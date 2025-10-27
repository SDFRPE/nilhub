// backend/src/routes/productos.js
/**
 * @fileoverview Rutas de Productos - API REST
 * 
 * Endpoints para gestión completa de productos:
 * - Crear, actualizar, eliminar productos
 * - Obtener productos propios y por ID
 * - Actualizar stock manual
 * - Registrar clicks en WhatsApp (analytics)
 * 
 * @module ProductosRoutes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const productosController = require('../controllers/productosController');
const { protect } = require('../middleware/auth');

// ===================================
// RUTAS PRIVADAS (requieren JWT)
// ===================================

/**
 * @route   GET /api/productos/mis-productos
 * @desc    Obtener todos los productos del usuario autenticado
 * @access  Private (requiere JWT)
 * 
 * @returns {Object[]} Array de productos de la tienda del usuario
 * 
 * @example
 * GET /api/productos/mis-productos
 * Headers: { Authorization: "Bearer <token>" }
 * 
 * Response: {
 *   success: true,
 *   data: [{ _id, nombre, precio, stock, ... }]
 * }
 */
router.get('/mis-productos', protect, productosController.obtenerMisProductos);

/**
 * @route   POST /api/productos
 * @desc    Crear nuevo producto
 * @access  Private (requiere JWT)
 * 
 * @body {string} nombre - Nombre del producto (obligatorio)
 * @body {string} categoria - Categoría del producto (obligatorio)
 * @body {number} precio - Precio del producto (obligatorio, >= 0)
 * @body {number} stock - Cantidad en stock (obligatorio, >= 0)
 * @body {boolean} hay_stock - Disponibilidad (obligatorio)
 * @body {Array} imagenes - Array de objetos con url y cloudinary_id (min: 1, max: 5)
 * @body {string} [descripcion] - Descripción del producto (opcional)
 * @body {string} [marca] - Marca del producto (opcional)
 * @body {number} [precio_oferta] - Precio en oferta (opcional)
 * @body {string} [ingredientes] - Ingredientes del producto (opcional)
 * @body {string} [peso] - Peso o tamaño (opcional)
 * 
 * @example
 * POST /api/productos
 * Headers: { Authorization: "Bearer <token>" }
 * Body: {
 *   nombre: "Labial Mate Rosa",
 *   categoria: "maquillaje",
 *   precio: 25.00,
 *   stock: 10,
 *   hay_stock: true,
 *   imagenes: [
 *     { url: "https://...", cloudinary_id: "..." }
 *   ]
 * }
 */
router.post('/', protect, [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio'),
  body('categoria')
    .isIn(['maquillaje', 'skincare', 'fragancias', 'cuidado-personal', 'accesorios', 'otros'])
    .withMessage('Categoría inválida'),
  body('precio')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser mayor o igual a 0')
    .toFloat(), // ✅ AGREGADO: Convertir a número
  // ✅ AGREGADO: Validación para precio_oferta
  body('precio_oferta')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('El precio de oferta debe ser un número mayor o igual a 0')
    .toFloat(), // Convertir a número
  body('stock')
    .isInt({ min: 0 })
    .withMessage('El stock debe ser mayor o igual a 0'),
  body('imagenes')
    .isArray({ min: 1, max: 5 })
    .withMessage('Debe incluir entre 1 y 5 imágenes')
], productosController.crearProducto);

/**
 * @route   PUT /api/productos/:id
 * @desc    Actualizar producto completo
 * @access  Private (requiere JWT)
 * 
 * @param {string} id - ID del producto a actualizar
 * 
 * @body {string} [nombre] - Nombre del producto
 * @body {string} [descripcion] - Descripción del producto
 * @body {string} [categoria] - Categoría del producto
 * @body {string} [marca] - Marca del producto
 * @body {number} [precio] - Precio del producto (>= 0)
 * @body {number} [precio_oferta] - Precio en oferta
 * @body {number} [stock] - Cantidad en stock (>= 0)
 * @body {boolean} [hay_stock] - Disponibilidad
 * @body {Array} [imagenes] - Array de objetos con url y cloudinary_id (max: 5)
 * @body {string} [ingredientes] - Ingredientes del producto
 * @body {string} [peso] - Peso o tamaño
 * @body {boolean} [activo] - Si el producto está activo
 * 
 * @returns {Object} Producto actualizado
 * 
 * @example
 * PUT /api/productos/507f1f77bcf86cd799439011
 * Headers: { Authorization: "Bearer <token>" }
 * Body: {
 *   nombre: "Labial Mate Rosa Intenso",
 *   precio: 28.00,
 *   stock: 15,
 *   imagenes: [
 *     { url: "https://...", cloudinary_id: "..." },
 *     { url: "https://...", cloudinary_id: "..." }
 *   ]
 * }
 */
router.put('/:id', protect, [
  body('nombre')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío'),
  body('categoria')
    .optional()
    .isIn(['maquillaje', 'skincare', 'fragancias', 'cuidado-personal', 'accesorios', 'otros'])
    .withMessage('Categoría inválida'),
  body('precio')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser mayor o igual a 0')
    .toFloat(), // ✅ AGREGADO: Convertir a número
  // ✅ AGREGADO: Validación para precio_oferta
  body('precio_oferta')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('El precio de oferta debe ser un número mayor o igual a 0')
    .toFloat(), // Convertir a número
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock debe ser mayor o igual a 0'),
  body('imagenes')
    .optional()
    .isArray({ min: 1, max: 5 })
    .withMessage('Debe incluir entre 1 y 5 imágenes')
], productosController.actualizarProducto);

/**
 * @route   PATCH /api/productos/:id/stock
 * @desc    Actualizar solo el stock del producto (rápido)
 * @access  Private (requiere JWT)
 * 
 * @param {string} id - ID del producto
 * 
 * @body {number} stock - Nueva cantidad en stock (>= 0)
 * @body {boolean} [hay_stock] - Disponibilidad (opcional)
 * 
 * @returns {Object} Mensaje de éxito con nuevo stock
 * 
 * @example
 * PATCH /api/productos/507f1f77bcf86cd799439011/stock
 * Headers: { Authorization: "Bearer <token>" }
 * Body: {
 *   stock: 5,
 *   hay_stock: true
 * }
 * 
 * Response: {
 *   success: true,
 *   mensaje: "Stock actualizado",
 *   stock: 5,
 *   hay_stock: true
 * }
 */
router.patch('/:id/stock', protect, [
  body('stock')
    .isInt({ min: 0 })
    .withMessage('El stock debe ser mayor o igual a 0')
], productosController.actualizarStock);

/**
 * @route   DELETE /api/productos/:id
 * @desc    Eliminar producto (soft delete - marca como inactivo)
 * @access  Private (requiere JWT)
 * 
 * @param {string} id - ID del producto a eliminar
 * 
 * @returns {Object} Mensaje de confirmación
 * 
 * @example
 * DELETE /api/productos/507f1f77bcf86cd799439011
 * Headers: { Authorization: "Bearer <token>" }
 * 
 * Response: {
 *   success: true,
 *   mensaje: "Producto eliminado exitosamente"
 * }
 */
router.delete('/:id', protect, productosController.eliminarProducto);

// ===================================
// RUTAS PÚBLICAS (sin JWT)
// ===================================

/**
 * @route   GET /api/productos/:id
 * @desc    Obtener un producto por ID (público)
 * @access  Public
 * 
 * @param {string} id - ID del producto
 * 
 * @returns {Object} Datos completos del producto
 * 
 * @example
 * GET /api/productos/507f1f77bcf86cd799439011
 * 
 * Response: {
 *   success: true,
 *   data: {
 *     _id: "507f1f77bcf86cd799439011",
 *     nombre: "Labial Mate Rosa",
 *     precio: 25.00,
 *     imagenes: [...],
 *     ...
 *   }
 * }
 */
router.get('/:id', productosController.obtenerProductoPorId);

/**
 * @route   POST /api/productos/:id/click-whatsapp
 * @desc    Registrar click en botón de WhatsApp (analytics)
 * @access  Public
 * 
 * @param {string} id - ID del producto
 * 
 * @returns {Object} Mensaje de confirmación
 * 
 * @example
 * POST /api/productos/507f1f77bcf86cd799439011/click-whatsapp
 * 
 * Response: {
 *   success: true,
 *   mensaje: "Click registrado"
 * }
 * 
 * @note Este endpoint es público para facilitar el tracking.
 *       Se incrementa el contador `clicks_whatsapp` del producto.
 */
router.post('/:id/click-whatsapp', productosController.registrarClickWhatsApp);

module.exports = router;