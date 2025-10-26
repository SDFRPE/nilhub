// backend/src/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Cargar variables de entorno
dotenv.config();

// Conectar a MongoDB
connectDB();

// Crear app de Express
const app = express();

// ===================================
// MIDDLEWARES
// ===================================

// CORS - Permitir peticiones desde el frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser - Leer JSON en el body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===================================
// RUTAS
// ===================================

// Importar rutas
const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');
const tiendasRoutes = require('./routes/tiendas');
const uploadRoutes = require('./routes/upload');
const passwordResetRoutes = require('./routes/passwordReset'); // ⭐ LÍNEA AGREGADA

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 NilHub API funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      productos: '/api/productos',
      tiendas: '/api/tiendas',
      upload: '/api/upload'
    },
    timestamp: new Date().toISOString()
  });
});

// Ruta de salud (health check)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    mongodb: 'connected',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/debug/usuarios', async (req, res) => {
  try {
    const Usuario = require('./models/Usuario');
    const usuarios = await Usuario.find({}, 'email nombre createdAt');
    res.json({ 
      total: usuarios.length,
      usuarios 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Montar rutas
app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordResetRoutes); // ⭐ LÍNEA AGREGADA
app.use('/api/productos', productosRoutes);
app.use('/api/tiendas', tiendasRoutes);
app.use('/api/upload', uploadRoutes);

// ===================================
// MANEJO DE ERRORES
// ===================================

// Ruta no encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  });
});

// Middleware de manejo de errores global
app.use(errorHandler);

// ===================================
// INICIAR SERVIDOR
// ===================================

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║                                        ║');
  console.log('║        🚀 NilHub API Server           ║');
  console.log('║                                        ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`✓ Servidor corriendo en puerto ${PORT}`);
  console.log(`✓ Entorno: ${process.env.NODE_ENV}`);
  console.log(`✓ URL: http://localhost:${PORT}`);
  console.log('');
  console.log('📝 Rutas disponibles:');
  console.log(`   GET    /                       → Info de la API`);
  console.log(`   GET    /api/health             → Health check`);
  console.log('');
  console.log('   🔐 AUTH:');
  console.log(`   POST   /api/auth/registro      → Registrar usuario`);
  console.log(`   POST   /api/auth/login         → Iniciar sesión`);
  console.log(`   GET    /api/auth/me            → Usuario actual (🔒)`);
  console.log('');
  console.log('   🔑 PASSWORD RESET:'); // ⭐ OPCIONAL: Agregar al log
  console.log(`   POST   /api/auth/forgot-password    → Solicitar código`);
  console.log(`   POST   /api/auth/verify-reset-code  → Verificar código`);
  console.log(`   POST   /api/auth/reset-password     → Cambiar contraseña`);
  console.log('');
  console.log('   📦 PRODUCTOS:');
  console.log(`   GET    /api/productos/mis-productos       → Mis productos (🔒)`);
  console.log(`   GET    /api/productos/:id                 → Obtener producto`);
  console.log(`   POST   /api/productos                     → Crear producto (🔒)`);
  console.log(`   PUT    /api/productos/:id                 → Actualizar producto (🔒)`);
  console.log(`   PATCH  /api/productos/:id/stock           → Actualizar stock (🔒)`);
  console.log(`   DELETE /api/productos/:id                 → Eliminar producto (🔒)`);
  console.log(`   POST   /api/productos/:id/click-whatsapp  → Registrar click`);
  console.log('');
  console.log('   🏪 TIENDAS:');
  console.log(`   GET    /api/tiendas/:slug                 → Obtener tienda`);
  console.log(`   GET    /api/tiendas/:slug/productos       → Productos de tienda`);
  console.log(`   PUT    /api/tiendas/mi-tienda             → Actualizar mi tienda (🔒)`);
  console.log('');
  console.log('   📸 UPLOAD:');
  console.log(`   POST   /api/upload/imagen                 → Subir imagen (🔒)`);
  console.log(`   POST   /api/upload/imagenes               → Subir múltiples (🔒)`);
  console.log(`   DELETE /api/upload/:cloudinary_id         → Eliminar imagen (🔒)`);
  console.log('');
  console.log('Presiona Ctrl+C para detener el servidor');
  console.log('');
});

// Manejar shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT recibido, cerrando servidor...');
  process.exit(0);
});