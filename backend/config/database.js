const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'jaredalonzo',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'quikchek_dev',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

module.exports = pool;
