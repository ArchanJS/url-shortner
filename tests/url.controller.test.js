const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const urlService = require('../services/urlService');

jest.mock('../services/urlService');
jest.mock('../config/redis', () => ({
  getRedisClient: jest.fn(() => ({ 
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn()
  })),
  connectRedis: jest.fn().mockResolvedValue(true)
}));
jest.mock('../config/db', () => jest.fn());

describe('URL Controller Test', () => {
  beforeAll(async () => {
    process.env.BASE_URL = 'http://test.com';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/url/shorten', () => {
    it('should shorten a valid URL', async () => {
      urlService.shortenUrl.mockResolvedValue({
        shortId: 'abc123',
        originalUrl: 'https://www.example.com',
      });

      const response = await request(app)
        .post('/api/url/shorten')
        .send({ url: 'https://www.example.com' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.shortUrl).toBe('http://test.com/abc123');
      expect(response.body.originalUrl).toBe('https://www.example.com');
    });

    it('should return 400 for missing URL', async () => {
      const response = await request(app)
        .post('/api/url/shorten')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('URL is required');
    });

    it('should return 400 for invalid URL', async () => {
      urlService.shortenUrl.mockRejectedValue(new Error('Invalid URL'));

      const response = await request(app)
        .post('/api/url/shorten')
        .send({ url: 'invalid-url' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid URL provided');
    });
  });

  describe('GET /:shortId', () => {
    it('should redirect to original URL', async () => {
      urlService.getUrlByShortId.mockResolvedValue({
        originalUrl: 'https://www.example.com',
      });

      const response = await request(app).get('/abc123');

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('https://www.example.com');
    });

    it('should return 404 for non-existent URL', async () => {
      urlService.getUrlByShortId.mockRejectedValue(new Error('URL not found'));

      const response = await request(app).get('/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('URL not found');
    });
  });

  describe('GET /api/url/stats/:shortId', () => {
    it('should return URL statistics', async () => {
      const stats = {
        shortId: 'abc123',
        originalUrl: 'https://www.example.com',
        clicks: 5,
        createdAt: new Date(),
      };
      
      urlService.getUrlStats.mockResolvedValue(stats);

      const response = await request(app).get('/api/url/stats/abc123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats).toEqual(expect.objectContaining({
        shortId: 'abc123',
        originalUrl: 'https://www.example.com',
        clicks: 5,
      }));
    });

    it('should return 404 for non-existent URL', async () => {
      urlService.getUrlStats.mockRejectedValue(new Error('URL not found'));

      const response = await request(app).get('/api/url/stats/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('URL not found');
    });
  });
  
  describe('DELETE /api/url/:shortId', () => {
    it('should delete a URL successfully', async () => {
      urlService.deleteUrl.mockResolvedValue({ message: 'URL deleted successfully' });
      
      const response = await request(app).delete('/api/url/abc123');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('URL deleted successfully');
    });
    
    it('should return 404 for non-existent URL', async () => {
      urlService.deleteUrl.mockRejectedValue(new Error('URL not found'));
      
      const response = await request(app).delete('/api/url/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('URL not found');
    });
  });
});