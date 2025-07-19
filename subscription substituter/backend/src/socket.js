const { Server } = require('socket.io');
const http = require('http');

// Create Socket.IO server
const io = new Server(http, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

// Store user sockets by user ID
const users = new Map();

// Store chain members by chain ID
const chainMembers = new Map();

// Socket connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their chains
  socket.on('joinChains', async (userId) => {
    try {
      const user = await User.findById(userId).populate('chains');
      if (!user) return;

      // Store socket by user ID
      users.set(userId, socket);

      // Join chain rooms
      user.chains.forEach(chain => {
        socket.join(chain._id.toString());
        
        // Update chain members
        if (!chainMembers.has(chain._id.toString())) {
          chainMembers.set(chain._id.toString(), new Set());
        }
        chainMembers.get(chain._id.toString()).add(socket.id);
      });
    } catch (error) {
      console.error('Error joining chains:', error);
    }
  });

  // Handle direct messages
  socket.on('directMessage', async (data) => {
    try {
      const { receiverId, message } = data;
      const receiverSocket = users.get(receiverId);
      
      if (receiverSocket) {
        receiverSocket.emit('newMessage', {
          message,
          type: 'direct',
        });
      }
    } catch (error) {
      console.error('Error sending direct message:', error);
    }
  });

  // Handle chain messages
  socket.on('chainMessage', async (data) => {
    try {
      const { chainId, message } = data;
      const chainRoom = chainMembers.get(chainId);
      
      if (chainRoom) {
        chainRoom.forEach(socketId => {
          if (socketId !== socket.id) {
            io.to(socketId).emit('newMessage', {
              message,
              type: 'chain',
            });
          }
        });
      }
    } catch (error) {
      console.error('Error sending chain message:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove user from chains
    chainMembers.forEach((members, chainId) => {
      members.delete(socket.id);
      if (members.size === 0) {
        chainMembers.delete(chainId);
      }
    });

    // Remove user socket
    users.forEach((userSocket, userId) => {
      if (userSocket.id === socket.id) {
        users.delete(userId);
      }
    });
  });
});

module.exports = io;
