// backend/src/services/whatsappService.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

/**
 * SERVICIO DE WHATSAPP CON WHATSAPP-WEB.JS
 * 
 * Características:
 * - 100% gratis
 * - Escaneo QR la primera vez
 * - Sesión persistente con LocalAuth
 * - Reconexión automática
 * 
 * IMPORTANTE:
 * - La primera vez pedirá escanear QR
 * - Mantén el servidor corriendo
 * - No cierres WhatsApp Web en otros dispositivos
 * - Para producción, considera Twilio después
 */

// Cliente global de WhatsApp
let whatsappClient = null;
let isClientReady = false;
let isInitializing = false;

/**
 * Inicializar cliente de WhatsApp
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
  }

  // Configurar cliente
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
    }
  });

  // Evento: QR Code generado
  whatsappClient.on('qr', (qr) => {
    console.log('\n🔐 ESCANEA ESTE QR CON WHATSAPP:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n📱 Abre WhatsApp → Dispositivos vinculados → Vincular dispositivo\n');
  });

  // Evento: Autenticación exitosa
  whatsappClient.on('authenticated', () => {
    console.log('✅ WhatsApp autenticado correctamente');
  });

  // Evento: Cliente listo
  whatsappClient.on('ready', () => {
    isClientReady = true;
    isInitializing = false;
    console.log('✅ Cliente de WhatsApp listo para enviar mensajes');
  });

  // Evento: Desconexión
  whatsappClient.on('disconnected', (reason) => {
    console.log('⚠️ WhatsApp desconectado:', reason);
    isClientReady = false;
    whatsappClient = null;
    
    // Reintentar conexión después de 30 segundos
    setTimeout(() => {
      console.log('🔄 Reintentando conexión...');
      inicializarCliente();
    }, 30000);
  });

  // Evento: Error
  whatsappClient.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación WhatsApp:', msg);
    isClientReady = false;
    isInitializing = false;
  });

  // Inicializar
  whatsappClient.initialize();

  return whatsappClient;
};

/**
 * Verificar si el cliente está listo
 */
const estaListo = () => {
  return isClientReady && whatsappClient;
};

/**
 * Formatear número de teléfono para WhatsApp
 * Debe estar en formato: 51987654321@c.us
 */
const formatearNumero = (telefono) => {
  // Remover caracteres no numéricos
  let numero = telefono.replace(/\D/g, '');
  
  // Si no tiene código de país, asumir Perú (+51)
  if (!numero.startsWith('51') && numero.length === 9) {
    numero = '51' + numero;
  }
  
  return numero + '@c.us';
};

/**
 * Enviar código de recuperación por WhatsApp
 */
const enviarCodigoRecuperacion = async (nombre, telefono, code) => {
  try {
    // Verificar que el cliente esté listo
    if (!estaListo()) {
      throw new Error('Cliente de WhatsApp no está listo. Escanea el QR primero.');
    }

    // Formatear número
    const numeroFormateado = formatearNumero(telefono);
    
    // Generar mensaje
    const mensaje = generarMensajeWhatsApp(nombre, code);

    // Verificar que el número existe en WhatsApp
    const isRegistered = await whatsappClient.isRegisteredUser(numeroFormateado);
    if (!isRegistered) {
      throw new Error('El número no está registrado en WhatsApp');
    }

    // Enviar mensaje
    await whatsappClient.sendMessage(numeroFormateado, mensaje);

    console.log(`✅ Código enviado por WhatsApp a: ${telefono}`);
    return {
      success: true,
      metodo: 'whatsapp',
      mensaje: 'Código enviado por WhatsApp'
    };

  } catch (error) {
    console.error('❌ Error al enviar WhatsApp:', error);
    
    // Si el error es que no está listo, dar instrucciones
    if (!estaListo()) {
      throw new Error('WhatsApp no está conectado. Escanea el QR en la consola del servidor.');
    }
    
    throw new Error('Error al enviar mensaje por WhatsApp');
  }
};

/**
 * Generar mensaje formateado para WhatsApp
 */
const generarMensajeWhatsApp = (nombre, code) => {
  return `🔐 *NilHub - Recuperación de Contraseña*

Hola *${nombre}*,

Tu código de recuperación es:

*${code}*

Este código es válido por *1 hora* y solo puedes usarlo *3 veces*.

Si no solicitaste este código, ignora este mensaje.

_Equipo NilHub_`;
};

/**
 * Obtener estado del cliente
 */
const obtenerEstado = async () => {
  if (!whatsappClient) {
    return {
      estado: 'desconectado',
      listo: false,
      mensaje: 'Cliente no inicializado'
    };
  }

  const state = await whatsappClient.getState();
  
  return {
    estado: state,
    listo: isClientReady,
    mensaje: isClientReady 
      ? 'WhatsApp conectado y listo' 
      : 'WhatsApp inicializando o desconectado'
  };
};

/**
 * Cerrar cliente (para cuando se apaga el servidor)
 */
const cerrarCliente = async () => {
  if (whatsappClient) {
    console.log('🔌 Cerrando cliente de WhatsApp...');
    await whatsappClient.destroy();
    whatsappClient = null;
    isClientReady = false;
  }
};

// Inicializar automáticamente cuando se carga el módulo
// Solo si NODE_ENV no es 'test'
if (process.env.NODE_ENV !== 'test') {
  inicializarCliente();
}

// Cerrar cliente al apagar el servidor
process.on('SIGINT', async () => {
  await cerrarCliente();
  process.exit(0);
});

process.on('SIGTERM', async () => {
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