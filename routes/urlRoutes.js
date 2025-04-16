const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const { shortenLimiter } = require('../middleware/rateLimiter');

router.post('/shorten', shortenLimiter, urlController.shortenUrl);
router.get('/stats/:shortId', urlController.getUrlStats);
router.delete('/:shortId', urlController.deleteUrl);

module.exports = router;
