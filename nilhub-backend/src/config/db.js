// backend/src/config/db.js
const mongoose = require('mongoose');

/**
 * @description Conecta a MongoDB usando Mongoose
 * Incluye manejo de errores, reconexión automática y logging
 * 
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 * @throws {Error} Si falla la conexión a MongoDB
 * 
 * @example
 * const connectDB = require('./config/db');
 * await connectDB();
 */
const connectDB = async () => {
  try {
    // Validar que existe MONGODB_URI
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está definido en .env');
    }

    // Opciones de conexión
    const options = {
      // ⚠️ NOTA: useNewUrlParser y useUnifiedTopology están deprecadas
      // desde Mongoose 6.x, pero no causan problemas si las dejas
      // Las comento para seguir best practices actuales
      
      // useNewUrlParser: true,     // Deprecado desde v6
      // useUnifiedTopology: true,  // Deprecado desde v6
      
      // Opciones recomendadas para producción:
      maxPoolSize: 10,              // Máximo 10 conexiones en el pool
      serverSelectionTimeoutMS: 5000, // Timeout de 5s para seleccionar servidor
      socketTimeoutMS: 45000,       // Timeout de 45s para operaciones
    };

    // Conectar a MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log('');
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║     ✅ MongoDB Conectado Exitosamente    ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log(`  📡 Host: ${conn.connection.host}`);
    console.log(`  💾 Base de datos: ${conn.connection.name}`);
    console.log(`  🌐 Puerto: ${conn.connection.port || 27017}`);
    console.log('');

    // ===================================
    // EVENT LISTENERS
    // ===================================

    /**
     * Escucha errores después de la conexión inicial
     */
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de MongoDB:', err.message);
    });

    /**
     * Escucha desconexiones
     */
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB desconectado. Intentando reconectar...');
    });

    /**
     * Escucha reconexiones exitosas
     */
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconectado exitosamente');
    });

    /**
     * Manejo de cierre graceful de la aplicación
     */
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('');
        console.log('📴 MongoDB desconectado debido al cierre de la aplicación');
        process.exit(0);
      } catch (err) {
        console.error('Error al cerrar MongoDB:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('');
    console.error('╔═══════════════════════════════════════════╗');
    console.error('║     ❌ ERROR AL CONECTAR A MONGODB       ║');
    console.error('╚═══════════════════════════════════════════╝');
    console.error(`  Mensaje: ${error.message}`);
    console.error('');
    console.error('🔍 Verifica:');
    console.error('  1. ✓ Que MongoDB esté corriendo');
    console.error('  2. ✓ Que el MONGODB_URI en .env sea correcto');
    console.error('  3. ✓ Que el usuario/password sean correctos');
    console.error('  4. ✓ Que el puerto 27017 no esté bloqueado');
    console.error('');
    
    // En desarrollo, mostrar el URI (sin password)
    if (process.env.NODE_ENV === 'development' && process.env.MONGODB_URI) {
      const uriSinPassword = process.env.MONGODB_URI.replace(
        /\/\/([^:]+):([^@]+)@/,
        '//$1:****@'
      );
      console.error('  URI (sin password):', uriSinPassword);
      console.error('');
    }
    
    process.exit(1);
  }
};

/**
 * @description Cierra la conexión a MongoDB de forma segura
 * Útil para tests o cierre manual
 * 
 * @async
 * @function disconnectDB
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB desconectado correctamente');
  } catch (error) {
    console.error('Error al desconectar MongoDB:', error);
    throw error;
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;