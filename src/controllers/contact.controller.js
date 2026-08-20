const messageModel = require('../models/message.model');
const productModel = require('../models/product.model');
const { sendContactNotification, sendContactConfirmation } = require('../utils/email');

// Público: cualquiera completa el formulario (producto existente o pedido personalizado)
async function submit(req, res, next) {
  try {
    const { name, email, phone, subject, message, product_id } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nombre, email y mensaje son obligatorios.' });
    }

    let product = null;
    if (product_id) {
      product = await productModel.findById(product_id);
    }

    const saved = await messageModel.create({ name, email, phone, subject, message, product_id });

    // El envío de email no debería tumbar la respuesta si falla (ej: Brevo caído).
    try {
      await sendContactNotification({ name, email, phone, subject, message, product });
      await sendContactConfirmation({ name, email });
    } catch (emailErr) {
      console.error('Error enviando email de contacto:', emailErr.message);
    }

    res.status(201).json({ ok: true, message: saved });
  } catch (err) {
    next(err);
  }
}

// Admin: ver mensajes recibidos
async function getAll(req, res, next) {
  try {
    const { status } = req.query;
    const messages = await messageModel.findAll({ status });
    res.json(messages);
  } catch (err) {
    next(err);
  }
}

// Admin: marcar como leído/respondido
async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ['nuevo', 'leido', 'respondido'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Estado inválido. Usá uno de: ${allowed.join(', ')}` });
    }

    const updated = await messageModel.updateStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Mensaje no encontrado.' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { submit, getAll, updateStatus };