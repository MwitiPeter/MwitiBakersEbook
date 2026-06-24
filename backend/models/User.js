const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    verificationCodeExpires: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
    purchasedItems: {
      recipeBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecipeBook' }],
      trainingVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TrainingVideo' }],
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationCode;
  delete obj.verificationCodeExpires;
  return obj;
};

// Generate a 6-digit verification code
userSchema.methods.generateVerificationCode = function () {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationCode = crypto.createHash('sha256').update(code).digest('hex');
  this.verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  return code;
};

// Compare a plain code against the stored hash
userSchema.methods.compareVerificationCode = function (code) {
  const hashed = crypto.createHash('sha256').update(code).digest('hex');
  return this.verificationCode === hashed && this.verificationCodeExpires > new Date();
};

module.exports = mongoose.model('User', userSchema);
