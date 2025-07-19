const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Chain = require('../models/Chain');
const openai = require('openai');

// Get all subscriptions for a user
const getSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const subscriptions = await Subscription.find({ userId })
      .populate('userId', 'name email')
      .populate('chainId', 'name description');
    
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new subscription
const addSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, price, frequency, startDate, category, isShared } = req.body;

    // Validate subscription data
    if (!name || !price || !frequency || !startDate || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create subscription
    const subscription = new Subscription({
      ...req.body,
      userId,
    });

    await subscription.save();

    // Update user's subscriptions array
    await User.findByIdAndUpdate(userId, {
      $push: { subscriptions: subscription._id },
    });

    // If shared, create or join chain
    if (isShared) {
      const chain = new Chain({
        name: `${name} Chain`,
        creatorId: userId,
        subscriptions: [subscription._id],
      });
      await chain.save();

      await Subscription.findByIdAndUpdate(subscription._id, {
        chainId: chain._id,
        isShared: true,
      });
    }

    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update subscription
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate subscription exists and belongs to user
    const subscription = await Subscription.findById(id);
    if (!subscription || subscription.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Subscription not found or unauthorized' });
    }

    // Update subscription
    Object.assign(subscription, updates);
    await subscription.save();

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete subscription
const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate subscription exists and belongs to user
    const subscription = await Subscription.findById(id);
    if (!subscription || subscription.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Subscription not found or unauthorized' });
    }

    // Remove from user's subscriptions array
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { subscriptions: id },
    });

    // If shared, update chain
    if (subscription.isShared) {
      await Chain.findByIdAndUpdate(subscription.chainId, {
        $pull: { subscriptions: id },
      });
    }

    // Delete subscription
    await subscription.remove();

    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get AI suggestions for cheaper alternatives
const getSuggestions = async (req, res) => {
  try {
    const { name, category, price } = req.body;

    // Use OpenAI to get suggestions
    const response = await openai.createCompletion({
      model: "gpt-3.5-turbo",
      prompt: `Suggest cheaper alternatives to ${name} (${category}) priced at $${price}. Provide 3 options with their monthly prices and key features.`,
      max_tokens: 200,
    });

    res.json({ suggestions: response.data.choices[0].text });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  getSuggestions,
};
