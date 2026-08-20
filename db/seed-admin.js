
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

async function main() {
  const [name, email, password] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.log('Uso: node db/seed-admin.js "Tu Nombre" tu@email.com tuContraseña');
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
       RETURNING id, name, email, role`,
      [name, email, hashed]
    );
    console.log('Admin creado/actualizado:', result.rows[0]);
  } catch (err) {
    console.error('Error creando admin:', err.message);
  } finally {
    await pool.end();
  }
}

main();