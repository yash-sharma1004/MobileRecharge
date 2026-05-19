import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    minlength: 10,
    maxlength: 10
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  passwordHash: {
    type: String,
    required: function() { return this.authProvider === 'password'; }
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  },
  authProvider: {
    type: String,
    enum: ['password', 'firebase'],
    default: 'password'
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isNewUser: {
    type: Boolean,
    default: true
  },
  // Unique referral code for this user (auto-generated)
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  // Who referred this user (null if organic signup)
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
});

// Auto-generate referral code before first save
userSchema.pre('save', function () {
  if (!this.referralCode) {
    // Generate code: cleaned uppercase name (padded if short) + 4 random digits
    const namePart = this.name.replace(/[^a-zA-Z]/g, '').toUpperCase();
    const baseCode = namePart.length >= 4 ? namePart.slice(0, 4) : namePart.padEnd(4, 'X');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    this.referralCode = `${baseCode}${randomDigits}`;
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);
