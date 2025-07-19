const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');
const routes = require('./routes');
const { db, auth } = require('./config/firebase');
const authRoutes = require('./routes/authRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const chainRoutes = require('./routes/chainRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', routes);
app.use('/auth', authRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/chains', chainRoutes);
app.use('/messages', messageRoutes);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join chains and handle messages
  socket.on('joinChains', async (userId) => {
    try {
      const user = await User.findById(userId).populate('chains');
      if (!user) return;

      user.chains.forEach(chain => {
        socket.join(chain._id.toString());
      });
    } catch (error) {
      console.error('Error joining chains:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Firebase Function
exports.api = functions.https.onRequest(app);

// Real-time updates
exports.onChainUpdate = functions.firestore
  .document('chains/{chainId}')
  .onUpdate(async (change, context) => {
    const chainId = context.params.chainId;
    const chain = change.after.data();
    
    // Send notifications to chain members
    const members = chain.members;
    const message = `Chain "${chain.name}" has been updated`;
    
    // TODO: Implement notification system
  });

// Subscription renewal notifications
exports.onSubscriptionRenewal = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    // Get all subscriptions due for renewal
    const subscriptions = await db
      .collection('subscriptions')
      .where('nextRenewalDate', '<=', new Date())
      .get();

    // Send renewal notifications
    subscriptions.forEach(async (doc) => {
      const subscription = doc.data();
      // TODO: Implement notification system
    });
  });
// Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
