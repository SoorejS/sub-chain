const Message = require('../models/Message');
const User = require('../models/User');
const io = require('../socket');

// Get messages for a chat
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({
      $or: [
        { receiverId: chatId },
        { chainId: chatId }
      ]
    })
    .populate('senderId', 'name email')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, chainId, content, type } = req.body;
    const senderId = req.user.id;

    // Validate message content
    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Create message
    const message = new Message({
      senderId,
      receiverId,
      chainId,
      content,
      type,
    });

    await message.save();

    // Send notification via Socket.IO
    if (receiverId) {
      io.to(receiverId).emit('newMessage', {
        message,
        type: 'direct',
      });
    } else if (chainId) {
      io.to(chainId).emit('newMessage', {
        message,
        type: 'chain',
      });
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark message as read
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Validate user is the receiver
    if (message.receiverId && message.receiverId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    message.isRead = true;
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Message.countDocuments({
      $or: [
        { receiverId: userId, isRead: false },
        { chainId: { $in: req.user.chains }, isRead: false }
      ]
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
};
