import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    lowercase: true
  },
  bannerUrl: { 
    type: String, 
    default: '' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  code: { 
    type: String, 
    default: '' 
  }
}, { timestamps: true });

export const Offer = mongoose.model('Offer', offerSchema);
