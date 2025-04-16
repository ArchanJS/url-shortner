const { createClient } = require('redis');

let client;

const connectRedis = async () => {
  try {
    client = createClient({ url: process.env.REDIS_URL });
    
    client.on('error', (err) => {
      console.error(`Redis Error: ${err}`);
    });
    
    await client.connect();
    console.log('Redis Connected');
    return client;
  } catch (error) {
    console.error(`Redis Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const getRedisClient = () => {
  if (!client) {
    throw new Error('Redis client not initialized');
  }
  return client;
};

module.exports = { connectRedis, getRedisClient };