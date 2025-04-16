const app = require('./app');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 8000;

connectDB();

connectRedis();

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = server;