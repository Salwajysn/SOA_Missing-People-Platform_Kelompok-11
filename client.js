const redis = require('redis');

const redisClient = redis.createClient();

redisClient.connect().then(() => {
    console.log('Connected to Redis');
}).catch(err => {
    console.error('Redis connection error:', err);
});

module.exports = redisClient;