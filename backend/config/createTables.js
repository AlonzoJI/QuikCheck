const pool = require('./database');

const createTables = async () => {
  try {
    // News articles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news_articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        summary TEXT,
        original_content TEXT,
        source VARCHAR(100),
        url VARCHAR(500),
        published_at TIMESTAMP,
        readability_score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Verification cache table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS verification_cache (
        id SERIAL PRIMARY KEY,
        url VARCHAR(500) UNIQUE NOT NULL,
        content_extracted TEXT,
        verification_result JSONB,
        truth_score INTEGER,
        sources JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      );
    `);

    console.log('Database tables created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
};

createTables();
