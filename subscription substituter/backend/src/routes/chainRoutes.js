const express = require('express');
const router = express.Router();
const chainController = require('../controllers/chainController');
const { authenticateToken } = require('../middleware/auth');

// Protected routes
router.use(authenticateToken);

// Get all chains
router.get('/', chainController.getChains);

// Create new chain
router.post('/', chainController.createChain);

// Invite users to chain
router.post('/:chainId/invite', chainController.inviteUsers);

// Accept chain invitation
router.post('/:chainId/accept', chainController.acceptInvitation);

// Add subscription to chain
router.post('/:chainId/subscriptions', chainController.addSubscriptionToChain);

// Get chain details
router.get('/:chainId', chainController.getChainDetails);

// Update chain
router.put('/:chainId', chainController.updateChain);

// Delete chain
router.delete('/:chainId', chainController.deleteChain);

module.exports = router;
