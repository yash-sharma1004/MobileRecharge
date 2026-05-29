import mongoose from 'mongoose';

const RECHARGE_STATUSES = [
  'PAYMENT_PENDING',
  'PAYMENT_SUCCESS',
  'RECHARGE_PROCESSING',
  'RECHARGE_SUCCESS',
  'RECHARGE_FAILED',
  'REFUND_PROCESSING',
  'REFUNDED',
  // Legacy (existing records)
  'PENDING',
  'PROCESSING',
  'SUCCESS',
  'FAILED'
];

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
  planId: {
    type: String
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
  category: {
    type: String,
    enum: ['mobile', 'broadband', 'utility'],
    default: 'mobile'
  },
  status: {
    type: String,
    enum: RECHARGE_STATUSES,
    default: 'PAYMENT_PENDING'
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
  paymentId: {
    type: String,
    sparse: true
  },
  paymentOrderId: {
    type: String,
    sparse: true
  },
  parentRechargeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recharge'
  },
  couponCode: {
    type: String
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
  },
  providerResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, { timestamps: true });

rechargeSchema.index({ status: 1, createdAt: -1 });
rechargeSchema.index({ userId: 1, status: 1 });

export const Recharge = mongoose.model('Recharge', rechargeSchema);
