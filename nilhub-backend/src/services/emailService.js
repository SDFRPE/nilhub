// backend/src/services/emailService.js
const nodemailer = require('nodemailer');

/**
 * @fileoverview Servicio de Email con Gmail para envío de notificaciones
 * Usa Gmail SMTP con contraseña de aplicación
 * 
 * @requires nodemailer
 * 
 * @description
 * Configuración:
 * - GMAIL_USER: Email de Gmail (rs.daysuu@gmail.com)
 * - GMAIL_APP_PASSWORD: Contraseña de app de Gmail
 * 
 * Cómo obtener contraseña de app:
 * 1. Cuenta Google → Seguridad
 * 2. Verificación en 2 pasos (activar)
 * 3. Contraseñas de aplicación → Generar
 */

/**
 * @description Validar configuración de Gmail
 * @throws {Error} Si faltan variables de entorno
 * @private
 */
const validarConfiguracion = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error(
      'Faltan credenciales de Gmail. Configura GMAIL_USER y GMAIL_APP_PASSWORD en .env'
    );
  }
};

// Validar antes de crear transporter
try {
  validarConfiguracion();
} catch (error) {
  console.error('❌', error.message);
}

/**
 * @description Crear transporter de Gmail
 * Usa Gmail SMTP con autenticación de contraseña de aplicación
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  // Opciones adicionales
  pool: true,           // Usar pool de conexiones
  maxConnections: 5,    // Máximo 5 conexiones concurrentes
  maxMessages: 100,     // Máximo 100 mensajes por conexión
  rateDelta: 1000,      // Limitar a 1 mensaje por segundo
  rateLimit: 1
});

/**
 * @description Verificar conexión con Gmail al iniciar
 * Valida credenciales y conectividad
 */
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error al conectar con Gmail:', error.message);
    console.error('   Verifica:');
    console.error('   1. Que GMAIL_USER y GMAIL_APP_PASSWORD estén en .env');
    console.error('   2. Que la verificación en 2 pasos esté activa');
    console.error('   3. Que la contraseña de app sea correcta');
  } else {
    console.log('✅ Gmail configurado y listo para enviar emails');
  }
});

/**
 * @description Envía código de recuperación de contraseña por email
 * 
 * @async
 * @param {string} email - Email del destinatario
 * @param {string} nombre - Nombre del destinatario
 * @param {string} code - Código de 6 dígitos
 * @returns {Promise<Object>} Resultado del envío
 * @returns {boolean} returns.success - Si el envío fue exitoso
 * @returns {string} returns.messageId - ID del mensaje enviado
 * 
 * @throws {Error} Si falla el envío del email
 * 
 * @example
 * await enviarCodigoRecuperacion('usuario@email.com', 'Juan', '123456');
 */
const enviarCodigoRecuperacion = async (email, nombre, code) => {
  try {
    // Validar parámetros
    if (!email || !nombre || !code) {
      throw new Error('Faltan parámetros requeridos: email, nombre, code');
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Formato de email inválido');
    }

    // Validar código (6 dígitos)
    if (!/^\d{6}$/.test(code)) {
      throw new Error('El código debe tener 6 dígitos');
    }

    const mailOptions = {
      from: `"NilHub - Catálogos Virtuales" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '🔐 Código de recuperación de contraseña - NilHub',
      html: generarHTMLEmail(nombre, code),
      // Opciones adicionales
      priority: 'high',
      headers: {
        'X-Mailer': 'NilHub Password Reset Service'
      }
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email enviado a ${email} (ID: ${info.messageId})`);
    
    return { 
      success: true, 
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    };

  } catch (error) {
    console.error('❌ Error al enviar email:', error.message);
    
    // Errores específicos de Gmail
    if (error.code === 'EAUTH') {
      throw new Error('Error de autenticación con Gmail. Verifica credenciales.');
    }
    if (error.code === 'ECONNECTION') {
      throw new Error('No se pudo conectar con Gmail. Verifica tu conexión a internet.');
    }
    
    throw new Error('Error al enviar el email: ' + error.message);
  }
};

/**
 * @description Genera HTML del email con el código de recuperación
 * 
 * @param {string} nombre - Nombre del destinatario
 * @param {string} code - Código de 6 dígitos
 * @returns {string} HTML del email
 * @private
 */
const generarHTMLEmail = (nombre, code) => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperación de Contraseña</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header con gradiente -->
          <tr>
            <td style="background: linear-gradient(135deg, #EC4899 0%, #A855F7 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🔐 Recuperación de Contraseña
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                NilHub - Catálogos Virtuales
              </p>
            </td>
          </tr>

          <!-- Contenido principal -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Hola <strong>${nombre}</strong>,
              </p>
              
              <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en NilHub. 
                Usa el siguiente código para continuar:
              </p>

              <!-- Código destacado -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #EC4899 0%, #A855F7 100%); padding: 30px; border-radius: 12px;">
                    <div style="font-size: 42px; font-weight: bold; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                      ${code}
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                Este código es válido por <strong>1 hora</strong> y solo puedes intentar usarlo <strong>3 veces</strong>.
              </p>

              <!-- Nota de seguridad -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                      <strong>⚠️ Importante:</strong> Si no solicitaste este código, ignora este mensaje. 
                      Tu contraseña permanecerá sin cambios.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Saludos,<br>
                <strong>El equipo de NilHub</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 13px;">
                © ${new Date().getFullYear()} NilHub. Todos los derechos reservados.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Este es un email automático, por favor no responder.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * @description Envía email de confirmación de cambio de contraseña
 * 
 * @async
 * @param {string} email - Email del destinatario
 * @param {string} nombre - Nombre del destinatario
 * @returns {Promise<Object>} Resultado del envío
 * @returns {boolean} returns.success - Si el envío fue exitoso
 * 
 * @example
 * await enviarConfirmacionCambio('usuario@email.com', 'Juan');
 */
const enviarConfirmacionCambio = async (email, nombre) => {
  try {
    // Validar parámetros
    if (!email || !nombre) {
      throw new Error('Faltan parámetros requeridos: email, nombre');
    }

    const mailOptions = {
      from: `"NilHub - Catálogos Virtuales" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '✅ Contraseña actualizada exitosamente - NilHub',
      html: generarHTMLConfirmacion(nombre)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de confirmación enviado a ${email} (ID: ${info.messageId})`);
    
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error al enviar confirmación:', error.message);
    // No lanzar error - la contraseña ya se cambió exitosamente
    // Solo registrar el fallo en el log
    return { success: false, error: error.message };
  }
};

/**
 * @description Genera HTML del email de confirmación
 * 
 * @param {string} nombre - Nombre del destinatario
 * @returns {string} HTML del email
 * @private
 */
const generarHTMLConfirmacion = (nombre) => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ✅ Contraseña Actualizada
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px;">
                Hola <strong>${nombre}</strong>,
              </p>
              
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                Te confirmamos que tu contraseña ha sido actualizada exitosamente en <strong>NilHub</strong>.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.5;">
                      <strong>🔒 Consejo de seguridad:</strong> Usa una contraseña única y segura. 
                      No la compartas con nadie.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; color: #ef4444; font-size: 14px; line-height: 1.6;">
                Si <strong>no</strong> realizaste este cambio, contacta inmediatamente con soporte.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                © ${new Date().getFullYear()} NilHub - Catálogos Virtuales
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * @description Cierra el transporter de Gmail
 * Útil para testing o cierre graceful
 * 
 * @async
 * @returns {Promise<void>}
 */
const cerrarTransporter = async () => {
  try {
    transporter.close();
    console.log('📧 Transporter de Gmail cerrado');
  } catch (error) {
    console.error('Error al cerrar transporter:', error);
  }
};

module.exports = {
  enviarCodigoRecuperacion,
  enviarConfirmacionCambio,
  cerrarTransporter
};