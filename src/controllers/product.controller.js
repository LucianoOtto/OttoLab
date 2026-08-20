// src/controllers/product.controller.js

const productModel = require('../models/product.model');
const { scrapeMakerworld } = require('../utils/makerworld');
const { downloadImage } = require('../utils/imageDownload');


async function getAll(req, res, next) {
  try {
    const { category, section, search } = req.query;
    const onlyActive = !req.user; // el admin logueado ve todo, incluidos inactivos

    const products = await productModel.findAll({ category, section, search, onlyActive });
    res.json(products);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const product = await productModel.findById(req.params.id);

    if (!product || (!product.active && !req.user)) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Nombre y precio son obligatorios.' });
    }

    const product = await productModel.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

// Endpoint para la vista previa de MakerWorld
async function previewMakerworld(req, res, next) {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'La URL es obligatoria' });

    const extractedData = await scrapeMakerworld(url);
    res.json(extractedData);
  } catch (err) {
    next(err);
  }
}

// Baja una imagen externa (ej: la que trae el bookmarklet de MakerWorld) y
// la guarda en este servidor, para no depender de que ese link externo
// siga vivo. Devuelve la nueva URL local.
async function downloadProductImage(req, res, next) {
  try {
    const { image_url } = req.body;
    if (!image_url) {
      return res.status(400).json({ error: 'La URL de la imagen es obligatoria' });
    }

    const publicBaseUrl = process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}`;
    const localUrl = await downloadImage(image_url, publicBaseUrl);
    res.json({ image_url: localUrl });
  } catch (err) {
    console.error('[downloadProductImage] Error:', err.message);
    res.status(502).json({ error: 'No se pudo descargar la imagen.' });
  }
}

async function update(req, res, next) {
  try {
    const existing = await productModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    const merged = { ...existing, ...req.body };
    const product = await productModel.update(req.params.id, merged);
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await productModel.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  previewMakerworld,
  downloadProductImage,
  update,
  remove,
};