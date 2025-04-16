# URL Shortener Service

A high-performance URL shortening service built with Node.js, Express, MongoDB, and Redis. This service allows you to create shortened URLs that redirect to their original destinations, track click statistics, and manage your shortened links.

## Features

- Create shortened URLs with custom or auto-generated IDs
- Redirect from short URLs to original destinations
- Track click statistics for each shortened URL
- Redis caching for improved performance
- MongoDB for persistent storage
- RESTful API for easy integration

## Tech Stack

- **Node.js & Express**: Backend API framework
- **MongoDB**: Primary database for URL storage
- **Redis**: Cache layer for frequently accessed URLs
- **Jest**: Testing framework
- **Mongoose**: MongoDB object modeling
- **nanoid**: Generation of unique short IDs

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB
- Redis

### Setup

1. Clone the repository
```bash
git clone https://github.com/ArchanJS/url-shortner
cd url-shortener
```

2. Install dependencies
```bash
npm install
```

PORT=8000
MONGODB_URI=mongodb://localhost:27017/urlshortener
REDIS_URI=redis://localhost:6379
BASE_URL=http://localhost:8000
```

4. Start the server
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Usage

### Shorten a URL

```bash
curl -X POST \
  http://localhost:8000/api/url/shorten \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://www.example.com"}'
```

Response:
```json
{
  "success": true,
  "shortUrl": "http://localhost:8000/abc123",
  "originalUrl": "https://www.example.com"
}
```

### Get URL Statistics

```bash
curl -X GET http://localhost:8000/api/url/stats/abc123
```

Response:
```json
{
  "success": true,
  "stats": {
    "shortId": "abc123",
    "originalUrl": "https://www.example.com",
    "clicks": 5,
    "createdAt": "2025-04-15T12:30:45.123Z"
  }
}
```

### Delete a URL

```bash
curl -X DELETE http://localhost:8000/api/url/abc123
```

Response:
```json
{
  "success": true,
  "message": "URL deleted successfully"
}
```

### Use a Short URL

Simply visit the short URL in a browser or use:

```bash
curl -I http://localhost:8000/abc123
```

The server will respond with a 302 redirect to the original URL.

## Optimizations Over Traditional URL Shorteners

1. **Caching Strategy**:
   - Redis is used as a fast in-memory cache for frequently accessed URLs
   - Reduces database load and improves response times

2. **MongoDB Indexing**:
   - Optimized indexes on shortId and originalUrl fields
   - Fast lookups for both redirect and shortening operations

3. **Efficient ID Generation**:
   - Using nanoid for collision-resistant, URL-friendly unique identifiers
   - Configurable ID length to balance between URL size and uniqueness

4. **Asynchronous Click Tracking**:
   - Click statistics are updated asynchronously
   - User redirects aren't delayed by tracking operations

5. **Performance Monitoring**:
   - Built-in statistics tracking for system performance analysis
   - Easy to integrate with monitoring tools

## Running Tests

Run the test suite with:

```bash
npm test
```

## Project Structure

```
url-shortener/
├── config/
│   ├── db.js            # MongoDB connection
│   └── redis.js         # Redis connection
├── controllers/
│   └── urlController.js # API endpoints
├── models/
│   └── Url.js           # MongoDB schema
├── services/
│   └── urlService.js    # Business logic
├── tests/
│   ├── url.controller.test.js
│   ├── url.model.test.js
│   └── url.service.test.js
├── app.js               # Express app
├── server.js            # Entry point
└── package.json         # Dependencies
```