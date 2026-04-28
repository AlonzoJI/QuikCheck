const { Pool } = require('pg');
require('dotenv').config();

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DB_USER || 'jaredalonzo',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'quikchek_dev',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 5432,
    });

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

module.exports = pool;
