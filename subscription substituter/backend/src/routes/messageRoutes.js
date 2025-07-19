const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');

// Protected routes
router.use(authenticateToken);

// Get messages
router.get('/:chatId', messageController.getMessages);

// Send message
router.post('/', messageController.sendMessage);

// Mark message as read
router.put('/:messageId/read', messageController.markAsRead);

// Get unread message count
router.get('/unread', messageController.getUnreadCount);

module.exports = router;
