const mongoose = require('mongoose');
const crypto = require('crypto');

const pendingVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    verificationToken: {
      type: String,
      required: true,
    },
    verificationTokenExpires: {
      type: Date,
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
    },
    notificationsEnabled: {
      type: Boolean,
      default: false,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Generate verification token (24h expiry)
pendingVerificationSchema.methods.generateToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return rawToken;
};

// Compare a raw token
pendingVerificationSchema.methods.compareToken = function (rawToken) {
  const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
  return (
    this.verificationToken === hashed &&
    this.verificationTokenExpires &&
    this.verificationTokenExpires > new Date()
  );
};

// Auto-expire old entries (TTL index)
pendingVerificationSchema.index(
  { verificationTokenExpires: 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model('PendingVerification', pendingVerificationSchema);
