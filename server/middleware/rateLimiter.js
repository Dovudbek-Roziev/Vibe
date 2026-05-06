const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 10,
  message: { message: 'Ko\'p urinish. 15 daqiqadan so\'ng qayta urining.' },
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 daqiqa
  max: 100,
  message: { message: 'Juda ko\'p so\'rov. Biroz kuting.' },
});

module.exports = { authLimiter, apiLimiter };