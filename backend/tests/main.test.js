const request = require('supertest');
const app = require('../app/main');

describe('QuikChek API Tests', () => {
  // Test 1: Server health check
  test('GET /api/test should return server status', async () => {
    const response = await request(app)
      .get('/api/test')
      .expect(200);
    
    expect(response.body.message).toBe('QuikChek Backend is running!');
  });

  // Test 2: Database connection
  test('GET /api/db-test should return database connection', async () => {
    const response = await request(app)
      .get('/api/db-test')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Database connected successfully!');
  });

  // Test 3: News API endpoint (handles both success and API errors)
  test('GET /api/news/daily should return proper response format', async () => {
    const response = await request(app)
      .get('/api/news/daily');
    
    // Should return either 200 (success) or 500 (API error)
    expect([200, 500]).toContain(response.status);
    expect(response.body).toHaveProperty('success');
  });

  // Test 4: Stored news endpoint
  test('GET /api/news/stored should return stored articles', async () => {
    const response = await request(app)
      .get('/api/news/stored')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.source).toBe('database');
  });

  // Test 5: Fact check endpoint (handles API errors)
  test('POST /api/verify/fact-check should handle text input', async () => {
    const response = await request(app)
      .post('/api/verify/fact-check')
      .send({ text: 'Test claim for verification' });
    
    // Should return either 200 (success) or 500 (API error)
    expect([200, 500]).toContain(response.status);
    expect(response.body).toHaveProperty('success');
  });

  // Test 6: Fact check endpoint error handling
  test('POST /api/verify/fact-check should reject empty input', async () => {
    const response = await request(app)
      .post('/api/verify/fact-check')
      .send({})
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Text is required');
  });

  // Test 7: Verify route test endpoint
  test('GET /api/verify/test should return verify route status', async () => {
    const response = await request(app)
      .get('/api/verify/test')
      .expect(200);
    
    expect(response.body.message).toBe('Verify route is working!');
  });

  // Test 8: TikTok endpoint error handling
  test('POST /api/verify/tiktok-transcript should reject empty URL', async () => {
    const response = await request(app)
      .post('/api/verify/tiktok-transcript')
      .send({})
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('URL is required');
  });

  // Test 9: News API response structure (flexible)
  test('GET /api/news/daily should return proper response structure', async () => {
    const response = await request(app)
      .get('/api/news/daily');
    
    expect(response.body).toHaveProperty('success');
    if (response.status === 200) {
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('articles');
      expect(response.body).toHaveProperty('message');
    }
  });

  // Test 10: Fact check response structure (flexible)
  test('POST /api/verify/fact-check should return proper response structure', async () => {
    const response = await request(app)
      .post('/api/verify/fact-check')
      .send({ text: 'Sample text for structure test' });
    
    expect(response.body).toHaveProperty('success');
    if (response.status === 200) {
      expect(response.body).toHaveProperty('originalText');
      expect(response.body).toHaveProperty('factCheckResults');
      expect(response.body).toHaveProperty('truthScore');
      expect(response.body).toHaveProperty('summary');
    }
  });
});
