const sectionModel = require('../models/section.model');

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
    const sections = await sectionModel.findAll();
    res.json(sections);
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

    const section = await sectionModel.create({ name, slug: slugify(name) });
    res.status(201).json(section);
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

    const section = await sectionModel.update(req.params.id, { name, slug: slugify(name) });
    if (!section) {
      return res.status(404).json({ error: 'Sección no encontrada.' });
    }
    res.json(section);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await sectionModel.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Sección no encontrada.' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, update, remove };
