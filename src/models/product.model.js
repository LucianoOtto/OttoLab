const pool = require('../config/db');

// filters: { category, section, search, onlyActive }
async function findAll(filters = {}) {
  const { category, section, search, onlyActive } = filters;
  const conditions = [];
  const values = [];

  if (onlyActive) {
    conditions.push('p.active = true');
  }

  if (category) {
    values.push(category);
    conditions.push(`c.slug = $${values.length}`);
  }

  if (section) {
    values.push(section);
    conditions.push(`s.slug = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(p.name ILIKE $${values.length} OR p.designer_name ILIKE $${values.length})`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT p.*, 
            c.name AS category_name, c.slug AS category_slug,
            s.name AS section_name, s.slug AS section_slug
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN sections s ON p.section_id = s.id
     ${whereClause}
     ORDER BY p.created_at DESC`,
    values
  );

  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT p.*, 
            c.name AS category_name, c.slug AS category_slug,
            s.name AS section_name, s.slug AS section_slug
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN sections s ON p.section_id = s.id
     WHERE p.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const {
    name,
    description,
    price,
    image_url,
    category_id,
    section_id,
    material,
    estimated_print_time,
    makerworld_url,
    designer_name,
    print_profiles,
    active = true,
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO products
      (name, description, price, image_url, category_id, section_id, material, 
       estimated_print_time, makerworld_url, designer_name, print_profiles, active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      name,
      description,
      price,
      image_url,
      category_id || null,
      section_id || null,
      material,
      estimated_print_time,
      makerworld_url || null,
      designer_name || null,
      JSON.stringify(print_profiles || []),
      active,
    ]
  );

  return rows[0];
}

async function update(id, data) {
  const {
    name,
    description,
    price,
    image_url,
    category_id,
    section_id,
    material,
    estimated_print_time,
    makerworld_url,
    designer_name,
    print_profiles,
    active,
  } = data;

  const { rows } = await pool.query(
    `UPDATE products SET
      name = $1,
      description = $2,
      price = $3,
      image_url = $4,
      category_id = $5,
      section_id = $6,
      material = $7,
      estimated_print_time = $8,
      makerworld_url = $9,
      designer_name = $10,
      print_profiles = $11,
      active = $12,
      updated_at = NOW()
     WHERE id = $13
     RETURNING *`,
    [
      name,
      description,
      price,
      image_url,
      category_id || null,
      section_id || null,
      material,
      estimated_print_time,
      makerworld_url || null,
      designer_name || null,
      JSON.stringify(print_profiles || []),
      active,
      id,
    ]
  );

  return rows[0] || null;
}

async function remove(id) {
  const { rows } = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
}

module.exports = { findAll, findById, create, update, remove };