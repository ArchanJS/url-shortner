const urlService = require('../services/urlService');

const shortenUrl = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const result = await urlService.shortenUrl(url);
    
    return res.status(201).json({
      success: true,
      shortUrl: `${process.env.BASE_URL}/${result.shortId}`,
      shortId: result.shortId,
      originalUrl: result.originalUrl,
    });
  } catch (error) {
    if (error.message === 'Invalid URL') {
      return res.status(400).json({ error: 'Invalid URL provided' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const redirectToUrl = async (req, res) => {
  try {
    const { shortId } = req.params;
    const url = await urlService.getUrlByShortId(shortId);
    
    return res.redirect(url.originalUrl);
  } catch (error) {
    if (error.message === 'URL not found') {
      return res.status(404).json({ error: 'URL not found' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getUrlStats = async (req, res) => {
  try {
    const { shortId } = req.params;
    const stats = await urlService.getUrlStats(shortId);
    
    return res.json({
      success: true,
      stats,
    });
  } catch (error) {
    if (error.message === 'URL not found') {
      return res.status(404).json({ error: 'URL not found' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const deleteUrl = async (req, res) => {
  try {
    const { shortId } = req.params;
    const result = await urlService.deleteUrl(shortId);
    
    return res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error.message === 'URL not found') {
      return res.status(404).json({ error: 'URL not found' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  shortenUrl,
  redirectToUrl,
  getUrlStats,
  deleteUrl
};