import mongoose from 'mongoose';

const cashbackRuleSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['flat', 'percentage', 'random'], 
    default: 'random' 
  },
  minAmount: { 
    type: Number, 
    default: 0 
  },
  cashbackPercentage: { 
    type: Number, 
    default: 0 
  },
  cashbackAmount: { 
    type: Number, 
    default: 0 
  },
  minRandom: { 
    type: Number, 
    default: 1 
  },
  maxRandom: { 
    type: Number, 
    default: 25 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

export const CashbackRule = mongoose.model('CashbackRule', cashbackRuleSchema);
