const Chain = require('../models/Chain');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// Get all chains for a user
const getChains = async (req, res) => {
  try {
    const userId = req.user.id;
    const chains = await Chain.find({
      $or: [
        { creatorId: userId },
        { 'members.userId': userId }
      ]
    })
    .populate('creatorId', 'name email')
    .populate('members.userId', 'name email')
    .populate('subscriptions', 'name price category');

    res.json(chains);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new chain
const createChain = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, rules } = req.body;

    // Validate chain data
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // Create chain
    const chain = new Chain({
      name,
      description,
      creatorId: userId,
      rules,
    });

    // Add creator as first member
    chain.members.push({
      userId,
      status: 'accepted',
      sharePercentage: 100,
      joinedAt: new Date(),
    });

    await chain.save();

    // Update user's chains array
    await User.findByIdAndUpdate(userId, {
      $push: { chains: chain._id },
    });

    res.status(201).json(chain);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Invite users to chain
const inviteUsers = async (req, res) => {
  try {
    const { chainId, userIds } = req.body;
    const chain = await Chain.findById(chainId);

    // Validate chain exists and user is creator
    if (!chain || chain.creatorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Add invitations
    const newMembers = userIds.map(userId => ({
      userId,
      status: 'pending',
      joinedAt: new Date(),
    }));

    chain.members.push(...newMembers);
    await chain.save();

    // Update users' chains array
    await User.updateMany(
      { _id: { $in: userIds } },
      { $push: { chains: chain._id } }
    );

    res.json({ message: 'Invitations sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept chain invitation
const acceptInvitation = async (req, res) => {
  try {
    const { chainId } = req.params;
    const userId = req.user.id;

    const chain = await Chain.findById(chainId);
    if (!chain) {
      return res.status(404).json({ message: 'Chain not found' });
    }

    // Find user's invitation
    const memberIndex = chain.members.findIndex(
      m => m.userId.toString() === userId && m.status === 'pending'
    );

    if (memberIndex === -1) {
      return res.status(400).json({ message: 'No pending invitation found' });
    }

    // Update member status and calculate share percentage
    const totalAccepted = chain.members.filter(m => m.status === 'accepted').length;
    const newSharePercentage = Math.round(100 / (totalAccepted + 1));

    chain.members[memberIndex] = {
      userId,
      status: 'accepted',
      sharePercentage: newSharePercentage,
      joinedAt: chain.members[memberIndex].joinedAt,
    };

    // Update other members' share percentages
    chain.members.forEach((member, index) => {
      if (index !== memberIndex && member.status === 'accepted') {
        member.sharePercentage = newSharePercentage;
      }
    });

    await chain.save();
    res.json({ message: 'Invitation accepted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add subscription to chain
const addSubscriptionToChain = async (req, res) => {
  try {
    const { chainId, subscriptionId } = req.body;
    const chain = await Chain.findById(chainId);
    const subscription = await Subscription.findById(subscriptionId);

    // Validate chain and subscription exist
    if (!chain || !subscription) {
      return res.status(404).json({ message: 'Chain or subscription not found' });
    }

    // Validate user is creator
    if (chain.creatorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Add subscription to chain
    chain.subscriptions.push(subscriptionId);
    await chain.save();

    // Update subscription to be shared
    await Subscription.findByIdAndUpdate(subscriptionId, {
      chainId,
      isShared: true,
    });

    res.json({ message: 'Subscription added to chain successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getChains,
  createChain,
  inviteUsers,
  acceptInvitation,
  addSubscriptionToChain,
};
