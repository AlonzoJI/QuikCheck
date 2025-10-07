const pool = require('../config/database');

class NewsModel {
  // Insert a new article
  static async createArticle(articleData) {
    const { title, summary, original_content, source, url, published_at, readability_score } = articleData;
    
    const query = `
      INSERT INTO news_articles (title, summary, original_content, source, url, published_at, readability_score)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    
    const values = [title, summary, original_content, source, url, published_at, readability_score];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get all articles
  static async getAllArticles(limit = 10) {
    const query = `
      SELECT * FROM news_articles 
      ORDER BY created_at DESC 
      LIMIT $1;
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  // Get article by ID
  static async getArticleById(id) {
    const query = 'SELECT * FROM news_articles WHERE id = $1;';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = NewsModel;
