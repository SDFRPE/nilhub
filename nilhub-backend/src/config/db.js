// src/config/db.js
const mongoose = require('mongoose');

// Configuración de conexión a MongoDB
const connectDB = async () => {
  try {
    // Opciones de conexión
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // Conectar a MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log('');
    console.log('✓ MongoDB conectado exitosamente');
    console.log(`  Host: ${conn.connection.host}`);
    console.log(`  Base de datos: ${conn.connection.name}`);
    console.log('');

    // Escuchar eventos de error después de la conexión inicial
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✓ MongoDB reconectado');
    });

  } catch (error) {
    console.error('');
    console.error('❌ Error al conectar a MongoDB:');
    console.error(`   ${error.message}`);
    console.error('');
    console.error('Verifica:');
    console.error('  1. Que MongoDB esté corriendo');
    console.error('  2. Que el URI en .env sea correcto');
    console.error('  3. Que el usuario/password sean correctos');
    console.error('');
    process.exit(1);
  }
};

module.exports = connectDB;