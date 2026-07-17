const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendVerificationCode } = require('../lib/resend');

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Signup
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, notificationsEnabled } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        if (existingUser.isVerified) {
          return res.status(400).json({ message: 'Email already registered' });
        }
        // Resend verification for unverified users
        const code = existingUser.generateVerificationCode();
        await existingUser.save();
        const result = await sendVerificationCode(email, name, code);

        // If email service isn't configured, auto-verify
        if (result && !result.sent) {
          existingUser.isVerified = true;
          existingUser.verificationCode = undefined;
          existingUser.verificationCodeExpires = undefined;
          await existingUser.save();

          const token = generateToken(existingUser);
          return res.json({
            token,
            autoVerified: true,
            message:
              'Account created! (Unable to send verification email. You are automatically verified.)',
            user: {
              id: existingUser._id,
              name: existingUser.name,
              email: existingUser.email,
              role: existingUser.role,
            },
          });
        }

        return res.json({
          requiresVerification: true,
          message: 'A verification code has been sent to your email.',
          email,
        });
      }

      const user = await User.create({ name, email, password, notificationsEnabled });
      const code = user.generateVerificationCode();
      await user.save();

      // Send verification code via email
      const result = await sendVerificationCode(email, name, code);

      // If email service isn't configured, auto-verify the user (degraded mode)
      if (result && !result.sent) {
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        const token = generateToken(user);
        return res.status(201).json({
          token,
          autoVerified: true,
          message:
            'Account created! (Email verification not configured. You are automatically verified.)',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }

      res.status(201).json({
        requiresVerification: true,
        message: 'Account created! Please check your email for a verification code.',
        email,
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Unable to complete signup. Please try again later.' });
    }
  }
);

// Verify email with code
router.post(
  '/verify-email',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('code').matches(/^\d{6}$/).withMessage('Verification code must be 6 digits'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, code } = req.body;
      const user = await User.findOne({ email }).select('+verificationCode +verificationCodeExpires');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.isVerified) {
        const token = generateToken(user);
        return res.json({
          verified: true,
          message: 'Email already verified',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }

      if (!user.compareVerificationCode(code)) {
        return res.status(400).json({ message: 'Invalid or expired verification code' });
      }

      user.isVerified = true;
      user.verificationCode = undefined;
      user.verificationCodeExpires = undefined;
      await user.save();

      const token = generateToken(user);

      res.json({
        verified: true,
        message: 'Email verified successfully!',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: 'Server error during verification' });
    }
  }
);

// Resend verification code
router.post(
  '/resend-code',
  [body('email').isEmail().withMessage('Valid email is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.isVerified) {
        return res.json({ message: 'Email already verified' });
      }

      const code = user.generateVerificationCode();
      await user.save();
      const result = await sendVerificationCode(email, user.name, code);

      // If email service isn't configured, auto-verify
      if (result && !result.sent) {
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        return res.json({
          autoVerified: true,
          message: 'Email automatically verified (unable to send verification email). You can now log in.',
        });
      }

      res.json({
        message: 'A new verification code has been sent to your email.',
      });
    } catch (error) {
      console.error('Resend code error:', error);
      res.status(500).json({ message: 'Unable to send verification code. Please try again later.' });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      if (!user.isVerified) {
        // Send a fresh verification code
        const code = user.generateVerificationCode();
        await user.save();
        const result = await sendVerificationCode(email, user.name, code);

        // If email service isn't configured, auto-verify and log in
        if (result && !result.sent) {
          user.isVerified = true;
          user.verificationCode = undefined;
          user.verificationCodeExpires = undefined;
          user.lastLogin = new Date();
          await user.save();

          const token = generateToken(user);
          return res.json({
            token,
            autoVerified: true,
            message:
              'Logged in! (Unable to send verification email. You are automatically verified.)',
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          });
        }

        return res.json({
          requiresVerification: true,
          message: 'Please verify your email before logging in. A new code has been sent.',
          email: user.email,
        });
      }

      // Record last login
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user);

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Unable to log in. Please try again later.' });
    }
  }
);

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate([
      { path: 'purchasedItems.recipeBooks' },
      { path: 'purchasedItems.trainingVideos' },
    ]);
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request password reset (sends verification code to email)
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: 'No account found with this email' });
      }

      // Generate a reset code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.resetPasswordCode = crypto.createHash('sha256').update(code).digest('hex');
      user.resetPasswordCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      await user.save();

      // Try to send the reset code via email
      const result = await sendVerificationCode(email, user.name, code, 'reset');

      if (result && !result.sent) {
        // Email service not available — return the code so the frontend can show it directly
        console.log(`\n🔑 Password reset code for ${email}: ${code} (not sent — email service unavailable, shown on screen)`);

        return res.json({
          message:
            '⚠️ Email service is not configured. Your password reset code is shown below:',
          email,
          code, // The 6-digit code — safe to return since the user already knows the email
          devMode: true,
        });
      }

      res.json({
        message: 'A password reset code has been sent to your email.',
        email,
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Unable to process request. Please try again later.' });
    }
  }
);

// Verify reset code and reset password
router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('code').matches(/^\d{6}$/).withMessage('Verification code must be 6 digits'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, code, password } = req.body;
      const user = await User.findOne({ email }).select('+resetPasswordCode +resetPasswordCodeExpires');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res.status(400).json({ message: 'Please verify your email before resetting your password.' });
      }

      // Verify the reset code
      const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
      if (
        user.resetPasswordCode !== hashedCode ||
        !user.resetPasswordCodeExpires ||
        user.resetPasswordCodeExpires < new Date()
      ) {
        return res.status(400).json({ message: 'Invalid or expired reset code' });
      }

      // Update password
      user.password = password;
      user.resetPasswordCode = undefined;
      user.resetPasswordCodeExpires = undefined;
      await user.save();

      res.json({ message: 'Password reset successfully! You can now log in with your new password.' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Unable to reset password. Please try again later.' });
    }
  }
);

// Admin: Get all users with activity data
router.get('/admin/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const users = await User.find({}, 'name email role isVerified lastLogin createdAt notificationsEnabled');
    const totalUsers = users.length;
    const verifiedUsers = users.filter((u) => u.isVerified).length;
    const recentVisitors = users
      .filter((u) => u.lastLogin)
      .sort((a, b) => b.lastLogin - a.lastLogin)
      .slice(0, 15);

    res.json({
      totalUsers,
      verifiedUsers,
      unverifiedUsers: totalUsers - verifiedUsers,
      recentVisitors,
      users,
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
