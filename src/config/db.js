const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // 👈 Necesario para PostgreSQL en Render
  }
});

module.exports = pool;