const express = require('express');
const TrainingVideo = require('../models/TrainingVideo');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Admin: Get all videos (including hidden) - MUST be before /:id
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }
    const videos = await TrainingVideo.find().sort('-createdAt');
    res.json(videos);
  } catch (error) {
    console.error('Admin get videos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all visible training videos (public)
router.get('/', async (req, res) => {
  try {
    const videos = await TrainingVideo.find({ isVisible: true }).sort('-isBestSeller -createdAt');
    const sanitized = videos.map((video) => ({
      _id: video._id,
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      price: video.price,
      isLocked: true,
      isBestSeller: video.isBestSeller,
      createdAt: video.createdAt,
    }));
    res.json(sanitized);
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unlocked video stream (must be before /:id)
router.get('/:id/unlock', auth, async (req, res) => {
  try {
    const video = await TrainingVideo.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const hasPurchased = req.user.purchasedItems.trainingVideos.some(
      (id) => id.toString() === req.params.id
    );

    if (!hasPurchased) {
      return res.status(403).json({ message: 'Please purchase this video to access it' });
    }

    // Increment view count
    video.viewCount += 1;
    await video.save();

    res.json({
      _id: video._id,
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.videoUrl,
      duration: video.duration,
      price: video.price,
      isLocked: false,
      isBestSeller: video.isBestSeller,
      viewCount: video.viewCount,
      createdAt: video.createdAt,
    });
  } catch (error) {
    console.error('Unlock video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single video
router.get('/:id', async (req, res) => {
  try {
    const video = await TrainingVideo.findById(req.params.id);
    if (!video || !video.isVisible) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.json({
      _id: video._id,
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      price: video.price,
      isLocked: true,
      isBestSeller: video.isBestSeller,
      createdAt: video.createdAt,
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Create training video
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const { title, description, thumbnailUrl, videoUrl, duration, price } = req.body;

    const trainingVideo = await TrainingVideo.create({
      title,
      description,
      thumbnailUrl,
      videoUrl,
      duration,
      price,
    });

    res.status(201).json(trainingVideo);
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update training video
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const video = await TrainingVideo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete training video
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const video = await TrainingVideo.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
