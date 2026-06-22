const express = require('express');
const Image = require('../models/Image');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Admin: Get all images (including hidden) - MUST be before /:id
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }
    const images = await Image.find().sort('-createdAt');
    res.json(images);
  } catch (error) {
    console.error('Admin get images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all visible images (public)
router.get('/', async (req, res) => {
  try {
    const images = await Image.find({ isVisible: true }).sort('-createdAt');
    const sanitized = images.map((img) => ({
      _id: img._id,
      title: img.title,
      description: img.description,
      price: img.price,
      previewUrl: img.previewUrl,
      isLocked: true,
      createdAt: img.createdAt,
    }));
    res.json(sanitized);
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get purchased/unlocked image (must be before /:id to avoid conflict with 'unlock' as id)
router.get('/:id/unlock', auth, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const hasPurchased = req.user.purchasedItems.images.some(
      (id) => id.toString() === req.params.id
    );

    if (!hasPurchased) {
      return res.status(403).json({ message: 'Please purchase this image to access it' });
    }

    res.json({
      _id: image._id,
      title: image.title,
      description: image.description,
      price: image.price,
      previewUrl: image.previewUrl,
      fullUrl: image.fullUrl,
      isLocked: false,
      downloadCount: image.downloadCount,
      createdAt: image.createdAt,
    });
  } catch (error) {
    console.error('Unlock image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single image for preview
router.get('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image || !image.isVisible) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json({
      _id: image._id,
      title: image.title,
      description: image.description,
      price: image.price,
      previewUrl: image.previewUrl,
      isLocked: true,
      createdAt: image.createdAt,
    });
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Create image
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const { title, description, price, previewUrl, fullUrl } = req.body;

    const image = await Image.create({
      title,
      description,
      price,
      previewUrl: previewUrl || '/placeholder-preview.jpg',
      fullUrl: fullUrl || '/placeholder-full.jpg',
    });

    res.status(201).json(image);
  } catch (error) {
    console.error('Create image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update image
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const image = await Image.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json(image);
  } catch (error) {
    console.error('Update image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete image
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const image = await Image.findByIdAndDelete(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
