const request = require('supertest');
const app = require('../src');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Subscription = require('../src/models/Subscription');
const Chain = require('../src/models/Chain');
const Message = require('../src/models/Message');

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};

const testSubscription = {
  name: 'Test Subscription',
  price: 10.99,
  frequency: 'monthly',
  category: 'entertainment',
};

const testChain = {
  name: 'Test Chain',
  description: 'Test chain description',
};

describe('API Tests', () => {
  let token;
  let userId;
  let subscriptionId;
  let chainId;

  beforeAll(async () => {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Subscription.deleteMany({});
    await Chain.deleteMany({});
    await Message.deleteMany({});
    await mongoose.connection.close();
  });

  // Authentication Tests
  describe('Authentication', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);
      
      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe(testUser.email);
      token = res.body.token;
      userId = res.body.user.id;
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(testUser.email);
    });
  });

  // Subscription Tests
  describe('Subscriptions', () => {
    it('should create a new subscription', async () => {
      const res = await request(app)
        .post('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .send(testSubscription);
      
      expect(res.status).toBe(201);
      expect(res.body.name).toBe(testSubscription.name);
      subscriptionId = res.body._id;
    });

    it('should get all subscriptions', async () => {
      const res = await request(app)
        .get('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  // Chain Tests
  describe('Chains', () => {
    it('should create a new chain', async () => {
      const res = await request(app)
        .post('/api/v1/chains')
        .set('Authorization', `Bearer ${token}`)
        .send(testChain);
      
      expect(res.status).toBe(201);
      expect(res.body.name).toBe(testChain.name);
      chainId = res.body._id;
    });

    it('should add subscription to chain', async () => {
      const res = await request(app)
        .post(`/api/v1/chains/${chainId}/subscriptions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ subscriptionId });
      
      expect(res.status).toBe(200);
    });
  });

  // Message Tests
  describe('Messages', () => {
    it('should send a message', async () => {
      const res = await request(app)
        .post('/api/v1/messages')
        .set('Authorization', `Bearer ${token}`)
        .send({
          chainId,
          content: 'Test message',
          type: 'text',
        });
      
      expect(res.status).toBe(201);
    });

    it('should get messages for chain', async () => {
      const res = await request(app)
        .get(`/api/v1/messages/${chainId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    it('should handle invalid route', async () => {
      const res = await request(app)
        .get('/api/v1/nonexistent')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(404);
    });

    it('should handle unauthorized access', async () => {
      const res = await request(app)
        .get('/api/v1/subscriptions');
      
      expect(res.status).toBe(401);
    });
  });
});
