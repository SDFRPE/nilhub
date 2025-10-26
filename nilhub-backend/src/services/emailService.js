// backend/src/services/emailService.js
const nodemailer = require('nodemailer');

/**
 * SERVICIO DE EMAIL CON GMAIL
 * 
 * Configuración con contraseña de aplicación de Gmail
 * Email: rs.daysuu@gmail.com
 * Contraseña de app: tyqd hjge oxto xbyz
 */

// Crear transporter de Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,           // rs.daysuu@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD    // tyqd hjge oxto xbyz
  }
});

// Verificar conexión al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error al conectar con Gmail:', error);
  } else {
    console.log('✅ Gmail listo para enviar emails');
  }
});

/**
 * Enviar código de recuperación por email
 */
const enviarCodigoRecuperacion = async (email, nombre, code) => {
  try {
    const mailOptions = {
      from: `"NilHub" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Código de recuperación de contraseña - NilHub',
      html: generarHTMLEmail(nombre, code)
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email enviado correctamente:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    throw new Error('Error al enviar el email');
  }
};

/**
 * Generar HTML del email con el código
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
 * Enviar notificación de cambio de contraseña exitoso
 */
const enviarConfirmacionCambio = async (email, nombre) => {
  try {
    const mailOptions = {
      from: `"NilHub" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Contraseña actualizada exitosamente - NilHub',
      html: `
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
                Te confirmamos que tu contraseña ha sido actualizada exitosamente.
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
                © ${new Date().getFullYear()} NilHub
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de confirmación enviado:', info.messageId);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error al enviar confirmación:', error);
    // No lanzar error, solo log (la contraseña ya se cambió)
    return { success: false };
  }
};

module.exports = {
  enviarCodigoRecuperacion,
  enviarConfirmacionCambio
};