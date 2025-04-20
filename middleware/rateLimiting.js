const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10, 
  message: 'Terlalu banyak permintaan, coba lagi setelah 1 jam.'
});

module.exports = rateLimiter;
