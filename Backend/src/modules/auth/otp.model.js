import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  identifier: { 
    type: String, 
    required: true,
    index: true // For faster lookups
  },
  otpHash: { 
    type: String, 
    required: true 
  },
  purpose: { 
    type: String, 
    enum: ['LOGIN', 'FORGOT_PASSWORD', 'SIGNUP'], 
    required: true 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    expires: 0 // TTL index: MongoDB will automatically delete the document when Date.now() >= expiresAt
  },
  verified: { 
    type: Boolean, 
    default: false 
  },
  attempts: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

// Ensure compound index for fast retrieval of latest unexpired OTP for a specific identifier and purpose
otpSchema.index({ identifier: 1, purpose: 1, createdAt: -1 });

export const Otp = mongoose.model('Otp', otpSchema);
