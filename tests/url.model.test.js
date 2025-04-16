const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Url = require('../models/Url');

let mongoServer;

describe('Url Model Test', () => {
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

  it('should create & save a URL successfully', async () => {
    const validUrl = new Url({
      originalUrl: 'https://www.example.com',
      shortId: 'abc123',
    });
    
    const savedUrl = await validUrl.save();

    expect(savedUrl._id).toBeDefined();
    expect(savedUrl.originalUrl).toBe('https://www.example.com');
    expect(savedUrl.shortId).toBe('abc123');
    expect(savedUrl.clicks).toBe(0);
    expect(savedUrl.createdAt).toBeDefined();
  });

  it('should fail when required fields are missing', async () => {
    const urlWithoutOriginalUrl = new Url({
      shortId: 'abc123',
    });

    let err;
    try {
      await urlWithoutOriginalUrl.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.originalUrl).toBeDefined();
  });

  it('should fail when shortId is not unique', async () => {
    const firstUrl = new Url({
      originalUrl: 'https://www.example.com',
      shortId: 'duplicateId',
    });
    await firstUrl.save();
    
    const secondUrl = new Url({
      originalUrl: 'https://www.example2.com',
      shortId: 'duplicateId',
    });
    
    let err;
    try {
      await secondUrl.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.code).toBe(11000);
  });
});