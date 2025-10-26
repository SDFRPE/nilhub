// backend/src/server.js

/**
 * @fileoverview Punto de entrada de la API REST de NilHub
 * Configura Express, middleware, rutas y manejo de errores
 * 
 * @requires express
 * @requires cors
 * @requires dotenv
 * @requires helmet
 * @requires compression
 * @requires express-rate-limit
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ===================================
// CONFIGURACIÓN INICIAL
// ===================================

/**
 * Cargar variables de entorno desde .env
 */
dotenv.config();

/**
 * Validar variables de entorno críticas
 */
const validarVariablesEntorno = () => {
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ Faltan variables de entorno críticas:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nConfigura estas variables en el archivo .env');
    process.exit(1);
  }
};

// Validar antes de continuar
validarVariablesEntorno();

/**
 * Conectar a MongoDB
 */
connectDB();

/**
 * Crear app de Express
 */
const app = express();

// ===================================
// MIDDLEWARES DE SEGURIDAD
// ===================================

/**
 * Helmet - Protección de headers HTTP
 * Configura varios headers de seguridad
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Para Tailwind/CSS-in-JS
    }
  },
  crossOriginEmbedderPolicy: false, // Para permitir Cloudinary
}));

/**
 * CORS - Permitir peticiones desde el frontend
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Lista de orígenes permitidos
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://nilhub.vercel.app', // Si tienes dominio en Vercel
      'http://localhost:3000',
      'http://localhost:3001'
    ];

    // Permitir requests sin origin (Postman, Mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Origen bloqueado por CORS: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true, // Permitir cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

/**
 * Rate Limiting - Prevenir abuso de la API
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requests por IP en 15 minutos
  message: {
    success: false,
    error: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true, // Retornar info de rate limit en headers
  legacyHeaders: false,
  // Excluir health check del rate limit
  skip: (req) => req.path === '/api/health'
});

app.use('/api/', limiter);

/**
 * Rate Limiting estricto para rutas de autenticación
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos de login/registro en 15 minutos
  message: {
    success: false,
    error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.'
  },
  skipSuccessfulRequests: true // No contar requests exitosos
});

// Aplicar a rutas de auth
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/registro', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

// ===================================
// MIDDLEWARES DE PARSEO Y LOGGING
// ===================================

/**
 * Compression - Comprimir respuestas HTTP
 */
app.use(compression());

/**
 * Body parser - Leer JSON y URL-encoded en el body
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Morgan - Logging de requests HTTP
 * Solo en desarrollo
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ===================================
// RUTAS
// ===================================

/**
 * Importar rutas
 */
const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');
const tiendasRoutes = require('./routes/tiendas');
const uploadRoutes = require('./routes/upload');
const passwordResetRoutes = require('./routes/passwordReset');

/**
 * Ruta raíz - Información de la API
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 NilHub API funcionando correctamente',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth',
      passwordReset: '/api/auth/forgot-password',
      productos: '/api/productos',
      tiendas: '/api/tiendas',
      upload: '/api/upload',
      health: '/api/health'
    },
    documentation: 'https://github.com/tu-usuario/nilhub-api',
    timestamp: new Date().toISOString()
  });
});

/**
 * Ruta de health check
 * Útil para monitoreo y load balancers
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: Math.floor(process.uptime()),
    mongodb: 'connected',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Ruta de debug - Solo en desarrollo
 * Lista todos los usuarios (sin passwords)
 */
if (process.env.NODE_ENV === 'development') {
  app.get('/api/debug/usuarios', async (req, res) => {
    try {
      const Usuario = require('./models/Usuario');
      const usuarios = await Usuario.find({}, 'email nombre role createdAt activo');
      res.json({
        success: true,
        total: usuarios.length,
        usuarios
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  app.get('/api/debug/tiendas', async (req, res) => {
    try {
      const Tienda = require('./models/Tienda');
      const tiendas = await Tienda.find({}, 'nombre slug usuario_id total_productos activa');
      res.json({
        success: true,
        total: tiendas.length,
        tiendas
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}

/**
 * Montar rutas de la API
 */
app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordResetRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/tiendas', tiendasRoutes);
app.use('/api/upload', uploadRoutes);

// ===================================
// MANEJO DE ERRORES
// ===================================

/**
 * Ruta no encontrada (404)
 * Debe ir DESPUÉS de todas las rutas válidas
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.path}`,
    suggestion: 'Verifica la documentación de la API'
  });
});

/**
 * Middleware de manejo de errores global
 * Debe ir al FINAL de todos los middlewares
 */
app.use(errorHandler);

// ===================================
// INICIAR SERVIDOR
// ===================================

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║                                        ║');
  console.log('║        🚀 NilHub API Server           ║');
  console.log('║                                        ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`✓ Servidor corriendo en puerto ${PORT}`);
  console.log(`✓ Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ URL: http://localhost:${PORT}`);
  console.log(`✓ Health: http://localhost:${PORT}/api/health`);
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
  console.log('   🔑 PASSWORD RESET:');
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
  console.log(`   GET    /api/tiendas/mi-tienda             → Mi tienda (🔒)`);
  console.log(`   PUT    /api/tiendas/mi-tienda             → Actualizar mi tienda (🔒)`);
  console.log('');
  console.log('   📸 UPLOAD:');
  console.log(`   POST   /api/upload/imagen                 → Subir imagen (🔒)`);
  console.log(`   POST   /api/upload/imagenes               → Subir múltiples (🔒)`);
  console.log(`   DELETE /api/upload/:cloudinary_id         → Eliminar imagen (🔒)`);
  console.log('');
  console.log('🔒 = Requiere autenticación (JWT)');
  console.log('');
  console.log('Presiona Ctrl+C para detener el servidor');
  console.log('');
});

// ===================================
// GRACEFUL SHUTDOWN
// ===================================

/**
 * Maneja el cierre graceful del servidor
 * Cierra conexiones activas y libera recursos
 */
const gracefulShutdown = async (signal) => {
  console.log('');
  console.log(`⚠️  ${signal} recibido. Cerrando servidor...`);
  
  // Cerrar servidor HTTP (deja de aceptar nuevas conexiones)
  server.close(async () => {
    console.log('✓ Servidor HTTP cerrado');
    
    try {
      // Cerrar conexión a MongoDB
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      console.log('✓ MongoDB desconectado');
      
      // Cerrar otros servicios si existen
      try {
        const { cerrarCliente } = require('./services/whatsappService');
        await cerrarCliente();
        console.log('✓ WhatsApp cerrado');
      } catch (error) {
        // WhatsApp service puede no estar activo
      }
      
      try {
        const { cerrarTransporter } = require('./services/emailService');
        await cerrarTransporter();
        console.log('✓ Email service cerrado');
      } catch (error) {
        // Email service puede no estar activo
      }
      
      console.log('✓ Cierre completo');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error durante el cierre:', error);
      process.exit(1);
    }
  });
  
  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    console.error('⏰ Timeout: Forzando cierre del servidor');
    process.exit(1);
  }, 10000);
};

/**
 * Listeners de señales del sistema
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Manejo de errores no capturados
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection en:', promise);
  console.error('   Razón:', reason);
  // En producción, considera reiniciar el servidor
  if (process.env.NODE_ENV === 'production') {
    gracefulShutdown('unhandledRejection');
  }
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Siempre salir en uncaughtException
  gracefulShutdown('uncaughtException');
});

/**
 * Exportar app para testing
 */
module.exports = app;