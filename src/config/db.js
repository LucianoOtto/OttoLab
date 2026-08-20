const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // 👈 Desactiva la verificación estricta de certificado para Render
  },
});

module.exports = pool;