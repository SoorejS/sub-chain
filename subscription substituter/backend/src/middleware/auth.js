const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token not found' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Check if user is admin
const authorizeAdmin = (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// Check if user owns resource
const authorizeResource = (req, res, next) => {
  try {
    const { id } = req.params;
    if (id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    next();
  } catch (error) {
    res.status(403).json({ message: 'Unauthorized access' });
  }
};

module.exports = {
  authenticateToken,
  authorizeAdmin,
  authorizeResource,
};
