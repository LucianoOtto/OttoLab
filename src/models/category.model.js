const pool = require('../config/db');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
  return rows[0] || null;
}

async function create({ name, slug }) {
  const { rows } = await pool.query(
    `INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *`,
    [name, slug]
  );
  return rows[0];
}

async function update(id, { name, slug }) {
  const { rows } = await pool.query(
    `UPDATE categories SET name = $1, slug = $2 WHERE id = $3 RETURNING *`,
    [name, slug, id]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rows } = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
}

module.exports = { findAll, findById, create, update, remove };