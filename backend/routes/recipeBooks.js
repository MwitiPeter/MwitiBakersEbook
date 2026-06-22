const express = require('express');
const RecipeBook = require('../models/RecipeBook');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Admin: Get all recipe books (including hidden) - MUST be before /:id
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }
    const books = await RecipeBook.find().sort('-createdAt');
    res.json(books);
  } catch (error) {
    console.error('Admin get recipe books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all visible recipe books (public)
router.get('/', async (req, res) => {
  try {
    const books = await RecipeBook.find({ isVisible: true }).sort('-createdAt');
    const sanitized = books.map((book) => ({
      _id: book._id,
      title: book.title,
      description: book.description,
      coverImage: book.coverImage,
      price: book.price,
      pages: book.pages,
      isLocked: true,
      createdAt: book.createdAt,
    }));
    res.json(sanitized);
  } catch (error) {
    console.error('Get recipe books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unlocked recipe book (must be before /:id)
router.get('/:id/unlock', auth, async (req, res) => {
  try {
    const book = await RecipeBook.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Recipe book not found' });
    }

    const hasPurchased = req.user.purchasedItems.recipeBooks.some(
      (id) => id.toString() === req.params.id
    );

    if (!hasPurchased) {
      return res.status(403).json({ message: 'Please purchase this recipe book to access it' });
    }

    res.json({
      _id: book._id,
      title: book.title,
      description: book.description,
      coverImage: book.coverImage,
      pdfUrl: book.pdfUrl,
      price: book.price,
      pages: book.pages,
      isLocked: false,
      downloadCount: book.downloadCount,
      createdAt: book.createdAt,
    });
  } catch (error) {
    console.error('Unlock recipe book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single recipe book
router.get('/:id', async (req, res) => {
  try {
    const book = await RecipeBook.findById(req.params.id);
    if (!book || !book.isVisible) {
      return res.status(404).json({ message: 'Recipe book not found' });
    }
    res.json({
      _id: book._id,
      title: book.title,
      description: book.description,
      coverImage: book.coverImage,
      price: book.price,
      pages: book.pages,
      isLocked: true,
      createdAt: book.createdAt,
    });
  } catch (error) {
    console.error('Get recipe book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Create recipe book
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const { title, description, coverImage, pdfUrl, price, pages } = req.body;

    const book = await RecipeBook.create({
      title,
      description,
      coverImage,
      pdfUrl,
      price,
      pages: pages || 0,
    });

    res.status(201).json(book);
  } catch (error) {
    console.error('Create recipe book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update recipe book
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const book = await RecipeBook.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!book) {
      return res.status(404).json({ message: 'Recipe book not found' });
    }

    res.json(book);
  } catch (error) {
    console.error('Update recipe book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete recipe book
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const book = await RecipeBook.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Recipe book not found' });
    }

    res.json({ message: 'Recipe book deleted successfully' });
  } catch (error) {
    console.error('Delete recipe book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
