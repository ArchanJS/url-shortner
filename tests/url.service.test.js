const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const urlService = require('../services/urlService');
const Url = require('../models/Url');

let mongoServer;

jest.mock('../config/redis', () => {
  const { createClient } = require('redis-mock');
  const client = createClient();
  return {
    getRedisClient: jest.fn(() => client),
  };
});

jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test123'),
}));

describe('URL Service Test', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Url.deleteMany({});
  });

  describe('shortenUrl', () => {
    it('should create a new shortened URL', async () => {
      const originalUrl = 'https://www.example.com';
      const result = await urlService.shortenUrl(originalUrl);
      
      expect(result.originalUrl).toBe(originalUrl);
      expect(result.shortId).toBe('test123');
      expect(result.clicks).toBe(0);
    });

    it('should return existing URL if already shortened', async () => {
      const originalUrl = 'https://www.example.com';
      const existingUrl = new Url({
        originalUrl,
        shortId: 'existing',
      });
      await existingUrl.save();
      
      const result = await urlService.shortenUrl(originalUrl);
      
      expect(result.originalUrl).toBe(originalUrl);
      expect(result.shortId).toBe('existing');
    });

    it('should throw error for invalid URL', async () => {
      const invalidUrl = 'not-a-url';
      
      await expect(urlService.shortenUrl(invalidUrl)).rejects.toThrow('Invalid URL');
    });
  });

  describe('getUrlByShortId', () => {
    it('should retrieve URL and increment click count', async () => {
      const url = new Url({
        originalUrl: 'https://www.example.com',
        shortId: 'test123',
        clicks: 0,
      });
      await url.save();
      
      const result = await urlService.getUrlByShortId('test123');
      
      expect(result.originalUrl).toBe('https://www.example.com');
      
      const updatedUrl = await Url.findOne({ shortId: 'test123' });
      expect(updatedUrl.clicks).toBe(1);
    });

    it('should throw error for non-existent URL', async () => {
      await expect(urlService.getUrlByShortId('nonexistent')).rejects.toThrow('URL not found');
    });
  });

  describe('getUrlStats', () => {
    it('should return URL statistics', async () => {
      const url = new Url({
        originalUrl: 'https://www.example.com',
        shortId: 'test123',
        clicks: 5,
      });
      await url.save();
      
      const stats = await urlService.getUrlStats('test123');
      
      expect(stats.originalUrl).toBe('https://www.example.com');
      expect(stats.shortId).toBe('test123');
      expect(stats.clicks).toBe(5);
      expect(stats.createdAt).toBeDefined();
    });

    it('should throw error for non-existent URL', async () => {
      await expect(urlService.getUrlStats('nonexistent')).rejects.toThrow('URL not found');
    });
  });
  
  describe('deleteUrl', () => {
    it('should delete a URL successfully', async () => {
      const url = new Url({
        originalUrl: 'https://www.example.com',
        shortId: 'test123',
      });
      await url.save();
      
      const result = await urlService.deleteUrl('test123');
      expect(result.message).toBe('URL deleted successfully');
      
      const deletedUrl = await Url.findOne({ shortId: 'test123' });
      expect(deletedUrl).toBeNull();
    });
    
    it('should throw error for non-existent URL', async () => {
      await expect(urlService.deleteUrl('nonexistent')).rejects.toThrow('URL not found');
    });
  });
});
