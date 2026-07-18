const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const PendingVerification = require('../models/PendingVerification');
const { auth } = require('../middleware/auth');
const { sendAuthLink } = require('../lib/email');
const { validateEmail } = require('../lib/emailValidator');

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Rate limiters (per IP)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: { message: 'Too many requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.email || req.ip, // Rate limit by email address
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { message: 'Too many password reset requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.email || req.ip,
});

const ACCOUNT_LOCK_MINUTES = 15;
const MAX_LOGIN_ATTEMPTS = 5;

// Password strength validation helper
const validatePasswordStrength = (password) => {
  const errors = [];
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }
  return errors;
};

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// =====================================================
// STEP 1: Initiate email verification (before account creation)
// =====================================================
router.post(
  '/initiate-verification',
  emailLimiter,
  [body('email').isEmail().withMessage('A valid email address is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      // Check if email is already registered and verified
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser && existingUser.isVerified) {
        return res.status(400).json({ message: 'This email is already registered. Please sign in instead.' });
      }

      // Run the full email validation pipeline
      const validation = await validateEmail(normalizedEmail);

      if (!validation.valid) {
        return res.status(400).json({
          message: validation.errors[0],
          warnings: validation.warnings,
          suggestion: validation.suggestion,
        });
      }

      // Return warnings/suggestion to the frontend
      if (validation.warnings.length > 0 || validation.suggestion) {
        // Still allow - just pass along the info
      }

      // If a pending verification already exists for this email, remove it
      await PendingVerification.deleteMany({ email: normalizedEmail, completed: false });

      // Create a new pending verification
      const pending = new PendingVerification({ email: normalizedEmail });
      const rawToken = pending.generateToken();
      await pending.save();

      const verificationLink = `${FRONTEND_URL}/verify-email?token=${rawToken}&pending=true`;
      const result = await sendAuthLink(normalizedEmail, 'there', verificationLink, 'verify');

      // If email service is unavailable, return a simulated verification link
      // so the user can still manually click to verify
      if (result && !result.sent) {
        console.log('\n📧 Verification link (not sent — email unavailable):');
        console.log(`   ${verificationLink}\n`);
        return res.json({
          devMode: true,
          rawToken,
          verificationLink,
          message: 'Email service unavailable. A verification link is available below for manual use.',
          warnings: validation.warnings,
          suggestion: validation.suggestion,
        });
      }

      res.json({
        message: 'A verification link has been sent to your email. Please check your inbox and click the link to continue.',
        email: normalizedEmail,
        warnings: validation.warnings,
        suggestion: validation.suggestion,
      });
    } catch (error) {
      console.error('Initiate verification error:', error);
      res.status(500).json({ message: 'Unable to send verification email. Please try again later.' });
    }
  }
);

// =====================================================
// STEP 2: Verify the pre-account token (from link click)
// =====================================================
router.post(
  '/verify-pending',
  [body('token').notEmpty().withMessage('Verification token is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token: rawToken } = req.body;

      // Find the pending verification by hashed token
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      const pending = await PendingVerification.findOne({
        verificationToken: hashedToken,
        verificationTokenExpires: { $gt: new Date() },
        completed: false,
      });

      if (!pending) {
        return res.status(400).json({ message: 'Invalid or expired verification link. Please request a new one.' });
      }

      res.json({
        verified: true,
        email: pending.email,
        message: 'Email verified! Now please complete your account setup.',
      });
    } catch (error) {
      console.error('Verify pending error:', error);
      res.status(500).json({ message: 'Server error during verification' });
    }
  }
);

// =====================================================
// STEP 3: Complete signup (after email verification)
// =====================================================
router.post(
  '/complete-signup',
  [
    body('token').notEmpty().withMessage('Verification token is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('password').custom((value) => {
      const errors = validatePasswordStrength(value);
      if (errors.length > 0) {
        throw new Error(errors.join('. '));
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token: rawToken, name, password, notificationsEnabled } = req.body;

      // Find the pending verification
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      const pending = await PendingVerification.findOne({
        verificationToken: hashedToken,
        verificationTokenExpires: { $gt: new Date() },
        completed: false,
      });

      if (!pending) {
        return res.status(400).json({ message: 'Invalid or expired verification link. Please start over.' });
      }

      // Double-check the email isn't already taken by a verified user
      const existingUser = await User.findOne({ email: pending.email });
      if (existingUser && existingUser.isVerified) {
        await PendingVerification.deleteOne({ _id: pending._id });
        return res.status(400).json({ message: 'This email is already registered. Please sign in.' });
      }

      // Delete the pending record
      await PendingVerification.deleteOne({ _id: pending._id });

      // If user already existed but was unverified, update them
      if (existingUser) {
        existingUser.name = name;
        existingUser.password = password;
        existingUser.isVerified = true;
        existingUser.notificationsEnabled = notificationsEnabled || false;
        await existingUser.save();

        const token = generateToken(existingUser);
        return res.status(201).json({
          token,
          message: 'Account created and verified successfully!',
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

      // Create new verified user
      const user = await User.create({
        name,
        email: pending.email,
        password,
        isVerified: true,
        notificationsEnabled: notificationsEnabled || false,
      });

      const token = generateToken(user);

      res.status(201).json({
        token,
        message: 'Account created and verified successfully!',
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
      console.error('Complete signup error:', error);
      res.status(500).json({ message: 'Unable to complete signup. Please try again later.' });
    }
  }
);

// =====================================================
// Legacy signup (kept for backward compatibility)
// =====================================================
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),      body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
      body('password').custom((value) => {
        const errors = validatePasswordStrength(value);
        if (errors.length > 0) {
          throw new Error(errors.join('. '));
        }
        return true;
      }),
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, notificationsEnabled } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        // Validate email (MX, disposable, format)
        const validation = await validateEmail(normalizedEmail);
        if (!validation.valid) {
          return res.status(400).json({ message: validation.errors[0] });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        if (existingUser.isVerified) {
          return res.status(400).json({ message: 'Email already registered' });
        }
        // Resend verification for unverified users
        const rawToken = existingUser.generateEmailVerificationToken();
        await existingUser.save();

        const verificationLink = `${FRONTEND_URL}/verify-email?token=${rawToken}`;
        const result = await sendAuthLink(email, existingUser.name, verificationLink, 'verify');

        if (result && !result.sent) {
          return res.status(503).json({
            message: 'Unable to send verification email. Our email service is currently unavailable. Please try again later.',
          });
        }

        return res.json({
          requiresVerification: true,
          message: 'A verification link has been sent to your email.',
          email: normalizedEmail,
        });
      }

      const user = await User.create({ name, email: normalizedEmail, password, notificationsEnabled });
      const rawToken = user.generateEmailVerificationToken();
      await user.save();

      const verificationLink = `${FRONTEND_URL}/verify-email?token=${rawToken}`;
      const result = await sendAuthLink(normalizedEmail, name, verificationLink, 'verify');

      if (result && !result.sent) {
        return res.status(503).json({
          message: 'Unable to send verification email. Our email service is currently unavailable. Please try again later.',
        });
      }

      res.status(201).json({
        requiresVerification: true,
        message: 'Account created! Please check your email for a verification link.',
        email: normalizedEmail,
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
  emailLimiter,
  [body('email').isEmail().withMessage('Valid email is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      // Check both pending verifications and existing users
      const pending = await PendingVerification.findOne({ email: normalizedEmail, completed: false });
      const user = await User.findOne({ email: normalizedEmail });

      if (!user && !pending) {
        return res.status(404).json({ message: 'No account found with this email' });
      }

      if (user && user.isVerified) {
        return res.json({ message: 'Email already verified' });
      }

      // Handle existing user (legacy flow)
      if (user) {
        const rawToken = user.generateEmailVerificationToken();
        await user.save();

        const verificationLink = `${FRONTEND_URL}/verify-email?token=${rawToken}`;
        const result = await sendAuthLink(normalizedEmail, user.name, verificationLink, 'verify');      if (result && !result.sent) {
        return res.json({
          devMode: true,
          rawToken,
          verificationLink,
          message: 'A new verification link is available below.',
        });
      }

        return res.json({
          message: 'A new verification link has been sent to your email.',
        });
      }

      // Handle pending verification (new pre-account flow)
      await PendingVerification.deleteMany({ email: normalizedEmail, completed: false });
      const newPending = new PendingVerification({ email: normalizedEmail });
      const rawToken = newPending.generateToken();
      await newPending.save();

      const verificationLink = `${FRONTEND_URL}/verify-email?token=${rawToken}&pending=true`;
      const result = await sendAuthLink(normalizedEmail, 'there', verificationLink, 'verify');

      if (result && !result.sent) {
        return res.json({
          devMode: true,
          rawToken,
          verificationLink,
          message: 'A new verification link is available below.',
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
  loginLimiter,
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

      // Check if account is locked
      if (user && user.lockUntil && user.lockUntil > new Date()) {
        const minutesRemaining = Math.ceil((user.lockUntil - new Date()) / 60000);
        return res.status(429).json({
          message: `Account temporarily locked. Too many failed attempts. Try again in ${minutesRemaining} minute(s).`,
          locked: true,
          minutesRemaining,
        });
      }

      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        // Increment login attempts
        user.loginAttempts = (user.loginAttempts || 0) + 1;

        if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
          user.lockUntil = new Date(Date.now() + ACCOUNT_LOCK_MINUTES * 60 * 1000);
          user.loginAttempts = 0;
          await user.save();
          return res.status(429).json({
            message: `Account locked for ${ACCOUNT_LOCK_MINUTES} minutes due to too many failed attempts.`,
            locked: true,
            minutesRemaining: ACCOUNT_LOCK_MINUTES,
          });
        }

        await user.save();
        const remaining = MAX_LOGIN_ATTEMPTS - user.loginAttempts;
        return res.status(401).json({
          message: `Invalid email or password. ${remaining} attempt(s) remaining before your account is temporarily locked.`,
          remainingAttempts: remaining,
        });
      }

      // Successful login — reset attempt counter
      user.loginAttempts = 0;
      user.lockUntil = null;

      if (!user.isVerified) {
        // Send a fresh verification link
        const rawToken = user.generateEmailVerificationToken();
        await user.save();

        const verificationLink = `${FRONTEND_URL}/verify-email?token=${rawToken}`;
        const result = await sendAuthLink(email, user.name, verificationLink, 'verify');

        if (result && !result.sent) {
          return res.status(503).json({
            message: 'Unable to send verification email. Our email service is currently unavailable. Please try again later.',
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
  forgotPasswordLimiter,
  [body('email').isEmail().withMessage('Valid email is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      // Validate email (MX, disposable, format)
      const validation = await validateEmail(normalizedEmail);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.errors[0] });
      }

      const user = await User.findOne({ email: normalizedEmail });

      if (!user || !user.isVerified) {
        // Don't reveal whether the email exists or is unverified (security)
        return res.json({
          message: 'If an account exists and is verified with this email, a password reset link will be sent.',
          email: normalizedEmail,
        });
      }

      // Generate a reset token
      const rawToken = user.generateResetPasswordToken();
      await user.save();

      const resetLink = `${FRONTEND_URL}/reset-password?token=${rawToken}`;
      const result = await sendAuthLink(normalizedEmail, user.name, resetLink, 'reset');

      if (result && !result.sent) {
        console.error('Failed to send password reset email to:', normalizedEmail);
        return res.status(503).json({
          message: 'Unable to send password reset email. Our email service is currently unavailable. Please try again later.',
        });
      }

      res.json({
        message: 'A password reset link has been sent to your email.',
        email: normalizedEmail,
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

      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordTokenExpires: { $gt: new Date() },
      }).select('+resetPasswordToken +resetPasswordTokenExpires');

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset link.' });
      }

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
