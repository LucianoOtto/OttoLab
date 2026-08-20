const pool = require('../config/db');

async function create({ name, email, phone, subject, message, product_id }) {
  const { rows } = await pool.query(
    `INSERT INTO contact_messages (name, email, phone, subject, message, product_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, email, phone || null, subject || null, message, product_id || null]
  );
  return rows[0];
}

async function findAll({ status } = {}) {
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT * FROM contact_messages ${whereClause} ORDER BY created_at DESC`,
    values
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM contact_messages WHERE id = $1', [id]);
  return rows[0] || null;
}

async function updateStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return rows[0] || null;
}

module.exports = { create, findAll, findById, updateStatus };