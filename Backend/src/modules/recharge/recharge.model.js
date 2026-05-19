import mongoose from 'mongoose';

const rechargeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  operator: {
    type: String,
    required: [true, 'Operator is required']
  },
  number: {
    type: String,
    required: [true, 'Mobile number is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required']
  },
  plan: {
    type: String,
    required: [true, 'Plan details are required']
  },
  planData: {
    price: Number,
    data: String,
    calls: String,
    validity: String,
    validityDays: Number,
    tag: String
  },
  payMethod: {
    type: String,
    default: 'UPI'
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  rechargeId: {
    type: String,
    unique: true,
    sparse: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  failureReason: {
    type: String
  },
  refundStatus: {
    type: String,
    enum: ['NONE', 'PENDING', 'COMPLETED', 'FAILED'],
    default: 'NONE'
  },
  cashbackEarned: {
    type: Number,
    default: 0
  },
  expiryDate: {
    type: Date
  }
}, { timestamps: true });

export const Recharge = mongoose.model('Recharge', rechargeSchema);
