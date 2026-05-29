import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  // The referrer (existing user who owns the code)
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // The new user who signed up using the referral code
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The name of the referred user (denormalized for quick display)
  referredUserName: {
    type: String,
    required: true
  },
  // Referral code that was used
  codeUsed: {
    type: String,
    required: true
  },
  reward: {
    type: Number,
    required: true
  },
  isMilestone: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['completed', 'pending'],
    default: 'completed'
  }
}, { timestamps: true });

// Prevent duplicate: same referred user can't be referred twice
referralSchema.index({ referredUserId: 1 }, { unique: true });

export const Referral = mongoose.model('Referral', referralSchema);
