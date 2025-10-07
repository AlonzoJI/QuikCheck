const pool = require('../config/database');

class VerificationModel {
  // Store verification result
  static async createVerificationCache(verificationData) {
    const { url, content_extracted, verification_result, truth_score, sources } = verificationData;
    
    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const query = `
      INSERT INTO verification_cache (url, content_extracted, verification_result, truth_score, sources, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (url) DO UPDATE SET
        content_extracted = EXCLUDED.content_extracted,
        verification_result = EXCLUDED.verification_result,
        truth_score = EXCLUDED.truth_score,
        sources = EXCLUDED.sources,
        expires_at = EXCLUDED.expires_at,
        created_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    
    const values = [url, content_extracted, JSON.stringify(verification_result), truth_score, JSON.stringify(sources), expiresAt];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get cached verification result
  static async getCachedVerification(url) {
    const query = `
      SELECT * FROM verification_cache 
      WHERE url = $1 AND expires_at > NOW();
    `;
    const result = await pool.query(query, [url]);
    
    if (result.rows.length > 0) {
      const cached = result.rows[0];
      return {
        ...cached,
        verification_result: JSON.parse(cached.verification_result),
        sources: JSON.parse(cached.sources)
      };
    }
    return null;
  }

  // Clean expired cache entries
  static async cleanExpiredCache() {
    const query = 'DELETE FROM verification_cache WHERE expires_at <= NOW();';
    const result = await pool.query(query);
    return result.rowCount;
  }
}

module.exports = VerificationModel;
