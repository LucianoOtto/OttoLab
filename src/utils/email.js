const brevo = require('@getbrevo/brevo');
const apiInstance = require('../config/brevo');

const FROM = {
  email: process.env.EMAIL_FROM,
  name: process.env.EMAIL_FROM_NAME || 'Catálogo 3D',
};

/**
 * Notifica al dueño del negocio que llegó un nuevo mensaje de contacto.
 */
async function sendContactNotification({ name, email, phone, subject, message, product }) {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.sender = FROM;
  sendSmtpEmail.to = [{ email: process.env.CONTACT_RECEIVER_EMAIL }];
  sendSmtpEmail.subject = `Nueva consulta: ${subject || 'Sin asunto'}`;
  sendSmtpEmail.htmlContent = `
    <h2>Nuevo mensaje desde el catálogo</h2>
    <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Teléfono:</strong> ${escapeHtml(phone || '-')}</p>
    ${product ? `<p><strong>Producto relacionado:</strong> ${escapeHtml(product.name)}</p>` : ''}
    <p><strong>Mensaje:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
  `;
  sendSmtpEmail.replyTo = { email, name };

  return apiInstance.sendTransacEmail(sendSmtpEmail);
}

/**
 * Manda una confirmación automática a quien completó el formulario.
 */
async function sendContactConfirmation({ name, email }) {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.sender = FROM;
  sendSmtpEmail.to = [{ email, name }];
  sendSmtpEmail.subject = 'Recibimos tu mensaje';
  sendSmtpEmail.htmlContent = `
    <p>Hola ${escapeHtml(name)},</p>
    <p>Recibimos tu consulta y te vamos a responder a la brevedad.</p>
    <p>¡Gracias por escribirnos!</p>
  `;

  return apiInstance.sendTransacEmail(sendSmtpEmail);
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = { sendContactNotification, sendContactConfirmation };