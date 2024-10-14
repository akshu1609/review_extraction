const request = require('supertest');
const app = require('../server');

describe('GET /api/reviews', () => {
  it('should return reviews data', async () => {
    const res = await request(app)
      .get('/api/reviews?page=https://example.com/product-page');
      
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('reviews_count');
    expect(res.body).toHaveProperty('reviews');
  });

  it('should return 400 if page is not provided', async () => {
    const res = await request(app).get('/api/reviews');
    expect(res.statusCode).toEqual(400);
  });
});
