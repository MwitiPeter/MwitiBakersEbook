const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { initializePayment, verifyPayment } = require('../config/paystack');
const Payment = require('../models/Payment');
const Image = require('../models/Image');
const RecipeBook = require('../models/RecipeBook');
const TrainingVideo = require('../models/TrainingVideo');
const User = require('../models/User');

const router = express.Router();

// Get the content item based on type
const getContentItem = async (itemType, itemId) => {
  switch (itemType) {
    case 'image':
      return Image.findById(itemId);
    case 'recipeBook':
      return RecipeBook.findById(itemId);
    case 'trainingVideo':
      return TrainingVideo.findById(itemId);
    default:
      return null;
  }
};

// Initialize payment for a content item
router.post(
  '/initialize',
  auth,
  [
    body('itemType')
      .isIn(['image', 'recipeBook', 'trainingVideo'])
      .withMessage('Invalid item type'),
    body('itemId').isMongoId().withMessage('Invalid item ID'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { itemType, itemId } = req.body;

      // Check if already purchased
      const user = await User.findById(req.user._id);
      const purchasedItems = user.purchasedItems[itemType === 'trainingVideo' ? 'trainingVideos' : itemType === 'recipeBook' ? 'recipeBooks' : 'images'];
      
      if (purchasedItems.some((id) => id.toString() === itemId)) {
        return res.status(400).json({ message: 'You already own this item' });
      }

      const item = await getContentItem(itemType, itemId);
      if (!item || !item.isVisible) {
        return res.status(404).json({ message: 'Item not found' });
      }

      // Initialize payment with Paystack
      const metadata = {
        userId: req.user._id.toString(),
        itemType,
        itemId: itemId.toString(),
        itemTitle: item.title,
      };

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const callbackUrl = `${frontendUrl}/payment/callback?itemType=${itemType}&itemId=${itemId}`;

      const payment = await initializePayment(
        req.user.email,
        item.price,
        metadata,
        callbackUrl
      );

      // Save payment record
      const paymentRecord = await Payment.create({
        user: req.user._id,
        reference: payment.data.reference,
        amount: item.price,
        itemType,
        itemId,
        status: 'pending',
        metadata,
      });

      res.json({
        authorizationUrl: payment.data.authorization_url,
        reference: payment.data.reference,
        accessCode: payment.data.access_code,
        paymentId: paymentRecord._id,
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      res.status(500).json({ message: 'Payment initialization failed' });
    }
  }
);

// Verify payment after redirect
router.get('/verify/:reference', auth, async (req, res) => {
  try {
    const { reference } = req.params;

    const payment = await Payment.findOne({ reference });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Verify with Paystack
    const verification = await verifyPayment(reference);

    if (verification.data.status === 'success') {
      // Update payment status
      payment.status = 'success';
      await payment.save();

      // Grant access to user
      const user = await User.findById(req.user._id);
      const itemType =
        payment.itemType === 'trainingVideo'
          ? 'trainingVideos'
          : payment.itemType === 'recipeBook'
          ? 'recipeBooks'
          : 'images';

      if (!user.purchasedItems[itemType].some((id) => id.toString() === payment.itemId.toString())) {
        user.purchasedItems[itemType].push(payment.itemId);
        await user.save();

        // Increment download count for images and recipe books
        if (payment.itemType === 'image') {
          await Image.findByIdAndUpdate(payment.itemId, { $inc: { downloadCount: 1 } });
        } else if (payment.itemType === 'recipeBook') {
          await RecipeBook.findByIdAndUpdate(payment.itemId, { $inc: { downloadCount: 1 } });
        }
      }

      return res.json({
        success: true,
        message: 'Payment verified and content unlocked!',
        itemType: payment.itemType,
        itemId: payment.itemId,
      });
    }

    payment.status = 'failed';
    await payment.save();
    res.json({ success: false, message: 'Payment verification failed' });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

// Webhook for Paystack to notify us of payment events
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;

    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;

      const payment = await Payment.findOne({ reference });
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      payment.status = 'success';
      await payment.save();

      // Grant access
      const user = await User.findById(payment.user);
      const itemType =
        payment.itemType === 'trainingVideo'
          ? 'trainingVideos'
          : payment.itemType === 'recipeBook'
          ? 'recipeBooks'
          : 'images';

      if (!user.purchasedItems[itemType].some((id) => id.toString() === payment.itemId.toString())) {
        user.purchasedItems[itemType].push(payment.itemId);
        await user.save();

        if (payment.itemType === 'image') {
          await Image.findByIdAndUpdate(payment.itemId, { $inc: { downloadCount: 1 } });
        } else if (payment.itemType === 'recipeBook') {
          await RecipeBook.findByIdAndUpdate(payment.itemId, { $inc: { downloadCount: 1 } });
        }
      }
    }

    res.status(200).end();
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

// Get user's payment history
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('itemId');
    res.json(payments);
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all payments
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }
    const payments = await Payment.find()
      .sort('-createdAt')
      .populate('user', 'name email')
      .populate('itemId');
    res.json(payments);
  } catch (error) {
    console.error('Admin payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
