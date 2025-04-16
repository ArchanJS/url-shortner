const { nanoid } = require('nanoid');
const Url = require('../models/Url');
const { getRedisClient } = require('../config/redis');
const validateUrl = require('../utils/validateUrl');

class UrlService {
  async shortenUrl(originalUrl) {
    if (!validateUrl(originalUrl)) {
      throw new Error('Invalid URL');
    }

    const existingUrl = await Url.findOne({ originalUrl });
    if (existingUrl) {
      const redisClient = getRedisClient();
      await redisClient.set(`url:${existingUrl.shortId}`, originalUrl, {
        EX: 60 * 60 * 24,
      });
      
      return existingUrl;
    }

    const shortId = nanoid(8);

    const url = new Url({
      originalUrl,
      shortId,
    });

    await url.save();

    const redisClient = getRedisClient();
    await redisClient.set(`url:${shortId}`, originalUrl, {
      EX: 60 * 60 * 24,
    });

    return url;
  }

  async getUrlByShortId(shortId) {
    const redisClient = getRedisClient();
    const cachedUrl = await redisClient.get(`url:${shortId}`);
    
    if (cachedUrl) {
      await Url.findOneAndUpdate(
        { shortId },
        { $inc: { clicks: 1 } }
      );
      await redisClient.set(`url:${shortId}`, cachedUrl, {
        EX: 60 * 60 * 24,
      });
      
      return { originalUrl: cachedUrl };
    }

    const url = await Url.findOneAndUpdate(
      { shortId },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!url) {
      throw new Error('URL not found');
    }

    await redisClient.set(`url:${shortId}`, url.originalUrl, {
      EX: 60 * 60 * 24,
    });

    return url;
  }

  async getUrlStats(shortId) {
    const url = await Url.findOne({ shortId });
    
    if (!url) {
      throw new Error('URL not found');
    }

    return {
      shortId: url.shortId,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      createdAt: url.createdAt
    };
  }
  
  async deleteUrl(shortId) {
    const url = await Url.findOneAndDelete({ shortId });
    
    if (!url) {
      throw new Error('URL not found');
    }
    
    const redisClient = getRedisClient();
    await redisClient.del(`url:${shortId}`);
    
    return { message: 'URL deleted successfully' };
  }
}

module.exports = new UrlService();