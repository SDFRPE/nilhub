// backend/src/routes/productos.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const productosController = require('../controllers/productosController');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/productos/mis-productos
 * @desc    Obtener todos los productos del usuario autenticado
 * @access  Private
 */
router.get('/mis-productos', protect, productosController.obtenerMisProductos);

/**
 * @route   GET /api/productos/:id
 * @desc    Obtener un producto por ID
 * @access  Public
 */
router.get('/:id', productosController.obtenerProductoPorId);

/**
 * @route   POST /api/productos
 * @desc    Crear nuevo producto
 * @access  Private
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
    .withMessage('El precio debe ser mayor o igual a 0'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('El stock debe ser mayor o igual a 0'),
  body('imagenes')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos una imagen')
], productosController.crearProducto);

/**
 * @route   PUT /api/productos/:id
 * @desc    Actualizar producto
 * @access  Private
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
    .withMessage('El precio debe ser mayor o igual a 0'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock debe ser mayor o igual a 0')
], productosController.actualizarProducto);

/**
 * @route   PATCH /api/productos/:id/stock
 * @desc    Actualizar solo el stock del producto
 * @access  Private
 */
router.patch('/:id/stock', protect, [
  body('stock')
    .isInt({ min: 0 })
    .withMessage('El stock debe ser mayor o igual a 0')
], productosController.actualizarStock);

/**
 * @route   DELETE /api/productos/:id
 * @desc    Eliminar producto
 * @access  Private
 */
router.delete('/:id', protect, productosController.eliminarProducto);

/**
 * @route   POST /api/productos/:id/click-whatsapp
 * @desc    Registrar click en WhatsApp
 * @access  Public
 */
router.post('/:id/click-whatsapp', productosController.registrarClickWhatsApp);

module.exports = router;