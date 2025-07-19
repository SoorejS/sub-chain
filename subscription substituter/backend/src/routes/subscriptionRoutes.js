const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken } = require('../middleware/auth');

// Protected routes
router.use(authenticateToken);

// Get all subscriptions
router.get('/', subscriptionController.getSubscriptions);

// Create new subscription
router.post('/', subscriptionController.addSubscription);

// Update subscription
router.put('/:id', subscriptionController.updateSubscription);

// Delete subscription
router.delete('/:id', subscriptionController.deleteSubscription);

// Get AI suggestions
router.post('/suggestions', subscriptionController.getSuggestions);

module.exports = router;
