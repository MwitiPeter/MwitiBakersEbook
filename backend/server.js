const express = require('express');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect to database
connectDB();

const app = express();

// Trust Render's proxy so req.ip and rate limiting work correctly
app.set('trust proxy', 1);

// Middleware
// Enable gzip/brotli compression for all responses
app.use(compression());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files (for local file uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check (before routes)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Mwiti Bakers API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipe-books', require('./routes/recipeBooks'));
app.use('/api/training-videos', require('./routes/trainingVideos'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/contact', require('./routes/contact'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  if (err.name === 'MulterError') {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mwiti Bakers server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
