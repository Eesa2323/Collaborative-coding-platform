// tests/challenges.integration.test.js

const request = require('supertest');
const app = require('../src/app');

describe('GET /api/v1/challenges', () => {

  /**
   * BEFORE FIX — no pagination caused slow response
   */
  test('BEFORE FIX: fails response time assertion', async () => {
    const start = Date.now();

    const res = await request(app)
      .get('/api/v1/challenges');

    const duration = Date.now() - start;

    expect(res.status).toBe(200);

    // ❌ would FAIL when dataset grows
    expect(duration).toBeLessThan(200); 
  });

  /**
   * AFTER FIX — pagination implemented
   */
  test('AFTER FIX: paginated response meets performance target', async () => {
    const res = await request(app)
      .get('/api/v1/challenges?page=1&limit=20');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(20);

    // ✅ stable response time
    const duration = res.headers['x-response-time'];
    expect(parseInt(duration)).toBeLessThan(200);
  });

});