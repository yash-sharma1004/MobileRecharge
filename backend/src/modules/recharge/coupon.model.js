import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  discount: { 
    type: Number, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['flat', 'percentage'], 
    default: 'flat' 
  },
  minAmount: { 
    type: Number, 
    default: 0 
  },
  expiry: { 
    type: Date, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  usageLimit: { 
    type: Number, 
    default: null 
  },
  usageCount: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

export const Coupon = mongoose.model('Coupon', couponSchema);
