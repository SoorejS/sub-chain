const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');
const chainRoutes = require('./chainRoutes');
const messageRoutes = require('./messageRoutes');

// API version prefix
const apiVersion = '/api/v1';

// Auth routes (public)
router.use(`${apiVersion}/auth`, authRoutes);

// Protected routes
router.use(`${apiVersion}/subscriptions`, subscriptionRoutes);
router.use(`${apiVersion}/chains`, chainRoutes);
router.use(`${apiVersion}/messages`, messageRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

module.exports = router;
