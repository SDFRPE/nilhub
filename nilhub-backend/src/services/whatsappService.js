// backend/src/services/whatsappService.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

/**
 * @fileoverview Servicio de WhatsApp con whatsapp-web.js
 * 
 * @description
 * Características:
 * - 100% gratis (no requiere API de Twilio)
 * - Escaneo QR la primera vez
 * - Sesión persistente con LocalAuth
 * - Reconexión automática
 * 
 * IMPORTANTE:
 * - La primera vez pedirá escanear QR en la consola
 * - Mantén el servidor corriendo para mantener la sesión
 * - No cierres WhatsApp Web en otros dispositivos
 * - Para producción masiva, considera Twilio Business API
 * 
 * LIMITACIONES:
 * - Requiere número de teléfono personal
 * - Límite de ~256 mensajes/día (política de WhatsApp)
 * - No apto para envíos masivos (>100 msg/día)
 * 
 * @requires whatsapp-web.js
 * @requires qrcode-terminal
 */

// Cliente global de WhatsApp
let whatsappClient = null;
let isClientReady = false;
let isInitializing = false;

/**
 * @description Inicializa el cliente de WhatsApp Web
 * Crea sesión persistente y maneja reconexión automática
 * 
 * @returns {Client|null} Cliente de WhatsApp o null si ya está inicializando
 * 
 * @example
 * const client = inicializarCliente();
 */
const inicializarCliente = () => {
  if (whatsappClient || isInitializing) {
    console.log('⏳ Cliente de WhatsApp ya está inicializándose o activo');
    return whatsappClient;
  }

  isInitializing = true;

  console.log('🚀 Inicializando cliente de WhatsApp...');

  // Crear directorio para sesiones si no existe
  const sessionPath = path.join(__dirname, '../../.wwebjs_auth');
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
    console.log(`📁 Directorio de sesiones creado: ${sessionPath}`);
  }

  // Configurar cliente con LocalAuth
  whatsappClient = new Client({
    authStrategy: new LocalAuth({
      dataPath: sessionPath
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    },
    // Opciones adicionales
    webVersionCache: {
      type: 'remote',
      remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
    }
  });

  // ===================================
  // EVENT LISTENERS
  // ===================================

  /**
   * Evento: QR Code generado
   * El usuario debe escanearlo con WhatsApp
   */
  whatsappClient.on('qr', (qr) => {
    console.log('\n╔═══════════════════════════════════════════╗');
    console.log('║   🔐 ESCANEA ESTE QR CON WHATSAPP        ║');
    console.log('╚═══════════════════════════════════════════╝\n');
    qrcode.generate(qr, { small: true });
    console.log('\n📱 Pasos:');
    console.log('  1. Abre WhatsApp en tu teléfono');
    console.log('  2. Ve a Dispositivos vinculados');
    console.log('  3. Toca "Vincular un dispositivo"');
    console.log('  4. Escanea el QR de arriba\n');
  });

  /**
   * Evento: Autenticación exitosa
   */
  whatsappClient.on('authenticated', () => {
    console.log('✅ WhatsApp autenticado correctamente');
  });

  /**
   * Evento: Cliente listo
   */
  whatsappClient.on('ready', () => {
    isClientReady = true;
    isInitializing = false;
    console.log('✅ Cliente de WhatsApp listo para enviar mensajes');
  });

  /**
   * Evento: Mensaje recibido (opcional - para auto-respuestas)
   */
  whatsappClient.on('message', async (msg) => {
    // Puedes implementar auto-respuestas aquí
    // Por ahora, solo loggeamos
    if (!msg.fromMe) {
      console.log(`📩 Mensaje recibido de ${msg.from}: ${msg.body}`);
    }
  });

  /**
   * Evento: Desconexión
   */
  whatsappClient.on('disconnected', (reason) => {
    console.log('⚠️ WhatsApp desconectado:', reason);
    isClientReady = false;
    isInitializing = false;
    whatsappClient = null;
    
    // Reintentar conexión después de 30 segundos
    setTimeout(() => {
      console.log('🔄 Reintentando conexión a WhatsApp...');
      inicializarCliente();
    }, 30000);
  });

  /**
   * Evento: Error de autenticación
   */
  whatsappClient.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación WhatsApp:', msg);
    console.error('   Posibles causas:');
    console.error('   1. Sesión expirada (escanea QR nuevamente)');
    console.error('   2. WhatsApp cerrado en el teléfono');
    console.error('   3. Cambio de número');
    isClientReady = false;
    isInitializing = false;
    
    // Borrar sesión corrupta
    try {
      const sessionPath = path.join(__dirname, '../../.wwebjs_auth');
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        console.log('🗑️ Sesión corrupta eliminada. Reinicia el servidor.');
      }
    } catch (error) {
      console.error('Error al eliminar sesión:', error);
    }
  });

  /**
   * Evento: Cargando (muestra progreso)
   */
  whatsappClient.on('loading_screen', (percent, message) => {
    console.log(`⏳ Cargando WhatsApp: ${percent}% - ${message}`);
  });

  // Inicializar cliente
  whatsappClient.initialize().catch((err) => {
    console.error('❌ Error al inicializar WhatsApp:', err);
    isInitializing = false;
  });

  return whatsappClient;
};

/**
 * @description Verifica si el cliente de WhatsApp está listo
 * 
 * @returns {boolean} true si el cliente está listo para enviar mensajes
 * 
 * @example
 * if (estaListo()) {
 *   await enviarMensaje(...);
 * }
 */
const estaListo = () => {
  return isClientReady && whatsappClient !== null;
};

/**
 * @description Formatea un número de teléfono para WhatsApp
 * Debe estar en formato internacional: 51987654321@c.us
 * 
 * @param {string} telefono - Número de teléfono
 * @returns {string} Número formateado para WhatsApp
 * 
 * @example
 * formatearNumero('987654321') // → '51987654321@c.us'
 * formatearNumero('51987654321') // → '51987654321@c.us'
 */
const formatearNumero = (telefono) => {
  // Remover caracteres no numéricos
  let numero = telefono.replace(/\D/g, '');
  
  // Si no tiene código de país, asumir Perú (+51)
  if (!numero.startsWith('51') && numero.length === 9) {
    numero = '51' + numero;
  }
  
  // Validar longitud (Perú: 11 dígitos con código)
  if (numero.length < 11 || numero.length > 15) {
    throw new Error('Número de teléfono inválido');
  }
  
  return numero + '@c.us';
};

/**
 * @description Envía código de recuperación por WhatsApp
 * 
 * @async
 * @param {string} nombre - Nombre del destinatario
 * @param {string} telefono - Número de teléfono (9 dígitos o con código)
 * @param {string} code - Código de 6 dígitos
 * @returns {Promise<Object>} Resultado del envío
 * @returns {boolean} returns.success - Si el envío fue exitoso
 * @returns {string} returns.metodo - Método usado ('whatsapp')
 * @returns {string} returns.mensaje - Mensaje de confirmación
 * 
 * @throws {Error} Si el cliente no está listo o falla el envío
 * 
 * @example
 * await enviarCodigoRecuperacion('Juan', '987654321', '123456');
 */
const enviarCodigoRecuperacion = async (nombre, telefono, code) => {
  try {
    // Validar parámetros
    if (!nombre || !telefono || !code) {
      throw new Error('Faltan parámetros: nombre, telefono, code');
    }

    // Validar código (6 dígitos)
    if (!/^\d{6}$/.test(code)) {
      throw new Error('El código debe tener 6 dígitos');
    }

    // Verificar que el cliente esté listo
    if (!estaListo()) {
      throw new Error(
        'Cliente de WhatsApp no está listo. ' +
        'Escanea el QR en la consola del servidor o espera a que se conecte.'
      );
    }

    // Formatear número
    const numeroFormateado = formatearNumero(telefono);
    
    // Generar mensaje
    const mensaje = generarMensajeWhatsApp(nombre, code);

    // Verificar que el número existe en WhatsApp
    const isRegistered = await whatsappClient.isRegisteredUser(numeroFormateado);
    if (!isRegistered) {
      throw new Error(`El número ${telefono} no está registrado en WhatsApp`);
    }

    // Enviar mensaje
    await whatsappClient.sendMessage(numeroFormateado, mensaje);

    console.log(`✅ Código enviado por WhatsApp a: ${telefono}`);
    
    return {
      success: true,
      metodo: 'whatsapp',
      mensaje: 'Código enviado por WhatsApp exitosamente'
    };

  } catch (error) {
    console.error('❌ Error al enviar WhatsApp:', error.message);
    
    // Mensajes de error específicos
    if (!estaListo()) {
      throw new Error(
        'WhatsApp no está conectado. Escanea el QR en la consola del servidor.'
      );
    }
    
    throw new Error('Error al enviar mensaje por WhatsApp: ' + error.message);
  }
};

/**
 * @description Genera mensaje formateado para WhatsApp
 * 
 * @param {string} nombre - Nombre del destinatario
 * @param {string} code - Código de 6 dígitos
 * @returns {string} Mensaje formateado con markdown de WhatsApp
 * @private
 */
const generarMensajeWhatsApp = (nombre, code) => {
  return `🔐 *NilHub - Recuperación de Contraseña*

Hola *${nombre}*,

Tu código de recuperación es:

*${code}*

Este código es válido por *1 hora* y solo puedes usarlo *3 veces*.

Si no solicitaste este código, ignora este mensaje.

_Equipo NilHub - Catálogos Virtuales_`;
};

/**
 * @description Obtiene el estado actual del cliente de WhatsApp
 * 
 * @async
 * @returns {Promise<Object>} Estado del cliente
 * @returns {string} returns.estado - Estado actual ('connected', 'disconnected', etc)
 * @returns {boolean} returns.listo - Si está listo para enviar
 * @returns {string} returns.mensaje - Descripción del estado
 * 
 * @example
 * const status = await obtenerEstado();
 * console.log(status.mensaje);
 */
const obtenerEstado = async () => {
  if (!whatsappClient) {
    return {
      estado: 'desconectado',
      listo: false,
      mensaje: 'Cliente no inicializado. Llama a inicializarCliente() primero.'
    };
  }

  try {
    const state = await whatsappClient.getState();
    
    return {
      estado: state,
      listo: isClientReady,
      mensaje: isClientReady 
        ? 'WhatsApp conectado y listo para enviar mensajes' 
        : `WhatsApp en estado: ${state}. Esperando conexión...`
    };
  } catch (error) {
    return {
      estado: 'error',
      listo: false,
      mensaje: 'Error al obtener estado: ' + error.message
    };
  }
};

/**
 * @description Cierra el cliente de WhatsApp de forma segura
 * Útil para apagar el servidor o testing
 * 
 * @async
 * @returns {Promise<void>}
 */
const cerrarCliente = async () => {
  if (whatsappClient) {
    try {
      console.log('🔌 Cerrando cliente de WhatsApp...');
      await whatsappClient.destroy();
      whatsappClient = null;
      isClientReady = false;
      console.log('✅ Cliente de WhatsApp cerrado correctamente');
    } catch (error) {
      console.error('Error al cerrar WhatsApp:', error);
    }
  }
};

// ===================================
// AUTO-INICIALIZACIÓN
// ===================================

/**
 * Inicializar automáticamente cuando se carga el módulo
 * Solo si NODE_ENV no es 'test' (para evitar problemas en testing)
 */
if (process.env.NODE_ENV !== 'test') {
  console.log('📲 Inicializando servicio de WhatsApp...');
  inicializarCliente();
}

// ===================================
// GRACEFUL SHUTDOWN
// ===================================

/**
 * Cerrar cliente al apagar el servidor
 */
process.on('SIGINT', async () => {
  console.log('\n⚠️  SIGINT recibido');
  await cerrarCliente();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  SIGTERM recibido');
  await cerrarCliente();
  process.exit(0);
});

module.exports = {
  inicializarCliente,
  enviarCodigoRecuperacion,
  generarMensajeWhatsApp,
  estaListo,
  obtenerEstado,
  cerrarCliente
};