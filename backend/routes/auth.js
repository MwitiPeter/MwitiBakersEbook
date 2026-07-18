const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendAuthLink } = require('../lib/email');

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

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
        const rawToken = existingUser.generateEmailVerificationToken();
        await existingUser.save();

        const verificationLink = `${FRONTEND_URL}/verify-email?token=${rawToken}`;
        const result = await sendAuthLink(email, existingUser.name, verificationLink, 'verify');

        // If email service isn't configured, auto-verify
        if (result && !result.sent) {
          existingUser.isVerified = true;
          existingUser.emailVerificationToken = undefined;
          existingUser.emailVerificationTokenExpires = undefined;
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
              isVerified: existingUser.isVerified,
              notificationsEnabled: existingUser.notificationsEnabled,
            },
          });
        }

        return res.json({
          requiresVerification: true,
          message: 'A verification link has been sent to your email.',
          email,
        });
      }

      const user = await User.create({ name, email, password, notificationsEnabled });
      const rawToken = user.generateEmailVerificationToken();
      await user.save();

      const verificationLink = `${FRONTEND_URL}/verify-email?token=${rawToken}`;
      const result = await sendAuthLink(email, name, verificationLink, 'verify');

      // If email service isn't configured, auto-verify the user (degraded mode)
      if (result && !result.sent) {
        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpires = undefined;
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
            isVerified: user.isVerified,
            notificationsEnabled: user.notificationsEnabled,
          },
        });
      }

      res.status(201).json({
        requiresVerification: true,
        message: 'Account created! Please check your email for a verification link.',
        email,
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Unable to complete signup. Please try again later.' });
    }
  }
);

// Verify email with token (from link click)
router.post(
  '/verify-email',
  [body('token').notEmpty().withMessage('Verification token is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token: rawToken } = req.body;

      // Find user by the hashed token
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification link.' });
      }

      user.isVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationTokenExpires = undefined;
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
          isVerified: user.isVerified,
          notificationsEnabled: user.notificationsEnabled,
        },
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: 'Server error during verification' });
    }
  }
);

// Resend verification link
router.post(
  '/resend-link',
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

      const rawToken = user.generateEmailVerificationToken();
      await user.save();

      const verificationLink = `${FRONTEND_URL}/verify-email?token=${rawToken}`;
      const result = await sendAuthLink(email, user.name, verificationLink, 'verify');

      // If email service isn't configured, auto-verify
      if (result && !result.sent) {
        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpires = undefined;
        await user.save();

        return res.json({
          autoVerified: true,
          message: 'Email automatically verified (unable to send verification email). You can now log in.',
          rawToken: process.env.NODE_ENV === 'development' ? rawToken : undefined,
        });
      }

      res.json({
        message: 'A new verification link has been sent to your email.',
      });
    } catch (error) {
      console.error('Resend link error:', error);
      res.status(500).json({ message: 'Unable to send verification link. Please try again later.' });
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
        // Send a fresh verification link
        const rawToken = user.generateEmailVerificationToken();
        await user.save();

        const verificationLink = `${FRONTEND_URL}/verify-email?token=${rawToken}`;
        const result = await sendAuthLink(email, user.name, verificationLink, 'verify');

        // If email service isn't configured, auto-verify and log in
        if (result && !result.sent) {
          user.isVerified = true;
          user.emailVerificationToken = undefined;
          user.emailVerificationTokenExpires = undefined;
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
              isVerified: user.isVerified,
              notificationsEnabled: user.notificationsEnabled,
              lastLogin: user.lastLogin,
            },
          });
        }

        return res.json({
          requiresVerification: true,
          message: 'Please verify your email before logging in. A new verification link has been sent.',
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
          isVerified: user.isVerified,
          notificationsEnabled: user.notificationsEnabled,
          lastLogin: user.lastLogin,
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

// Request password reset (sends reset link to email)
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

      if (!user.isVerified) {
        return res.status(400).json({
          message: 'Please verify your email before resetting your password.',
          requiresVerification: true,
          email: user.email,
        });
      }

      // Generate a reset token
      const rawToken = user.generateResetPasswordToken();
      await user.save();

      const resetLink = `${FRONTEND_URL}/reset-password?token=${rawToken}`;
      const result = await sendAuthLink(email, user.name, resetLink, 'reset');

      if (result && !result.sent) {
        console.log(`\n🔑 Password reset link for ${email}: ${resetLink} (not sent — email unavailable)`);

        return res.json({
          message: 'Email service unavailable. Redirecting to password reset...',
          email,
          rawToken,
          devMode: true,
        });
      }

      res.json({
        message: 'A password reset link has been sent to your email.',
        email,
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Unable to process request. Please try again later.' });
    }
  }
);

// Reset password with token (from link click)
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token: rawToken, password } = req.body;

      // Find user by the hashed token
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordTokenExpires: { $gt: new Date() },
      }).select('+resetPasswordToken +resetPasswordTokenExpires');

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset link.' });
      }

      // Update password
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpires = undefined;
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
