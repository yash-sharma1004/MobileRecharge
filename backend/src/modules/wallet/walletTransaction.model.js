import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
    default: () => `TXN${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`
  },
  type: {
    type: String,
    enum: ['TOP_UP', 'RECHARGE', 'CASHBACK', 'REFUND', 'REFERRAL'],
    required: true
  },
  direction: {
    type: String,
    enum: ['CREDIT', 'DEBIT'],
    required: true
  },
  purpose: {
    type: String,
    enum: ['TOP_UP', 'RECHARGE', 'CASHBACK', 'WALLET_REFUND', 'REFERRAL'],
    required: true,
    default: 'RECHARGE'
  },
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
    default: 'SUCCESS'
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'CARD', 'NET_BANKING', 'WALLET', 'NONE'],
    default: 'NONE'
  },
  paymentGateway: {
    type: String,
    enum: ['RAZORPAY', 'STRIPE', 'NONE'],
    default: 'NONE'
  },
  paymentId: {
    type: String,
    sparse: true
  },
  orderId: {
    type: String,
    sparse: true,
    index: true
  },
  signature: {
    type: String,
    sparse: true
  },
  gatewayStatus: {
    type: String,
    default: 'PENDING'
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  amount: {
    type: Number,
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recharge'
  },
  refundReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WalletTransaction'
  },
  description: {
    type: String,
    default: ''
  }
}, { timestamps: true });

walletTransactionSchema.index(
  { referenceId: 1, type: 1, status: 1 },
  { partialFilterExpression: { type: 'REFUND', status: 'SUCCESS' } }
);

export const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);

