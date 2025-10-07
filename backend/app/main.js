const express = require('express');
const cors = require('cors');
const pool = require('../config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'QuikChek Backend is running!' });
});

// Database test route
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      success: true, 
      timestamp: result.rows[0].now,
      message: 'Database connected successfully!' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});


app.use('/api/news', require('../routes/news'));
app.use('/api/verify', require('../routes/verify'));
app.use(require('../routes/tiktokCheck.js')); 

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


module.exports = app;
