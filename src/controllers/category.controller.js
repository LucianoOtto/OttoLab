const categoryModel = require('../models/category.model');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // saca acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function getAll(req, res, next) {
  try {
    const categories = await categoryModel.findAll();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio.' });
    }

    const category = await categoryModel.create({ name, slug: slugify(name) });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio.' });
    }

    const category = await categoryModel.update(req.params.id, { name, slug: slugify(name) });
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }
    res.json(category);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await categoryModel.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, update, remove };