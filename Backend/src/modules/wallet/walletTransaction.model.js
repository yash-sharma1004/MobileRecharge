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
  purpose: {
    type: String,
    enum: ['TOP_UP', 'RECHARGE', 'CASHBACK', 'WALLET_REFUND', 'REFERRAL'],
    required: true,
    default: 'RECHARGE'
  },
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    default: 'SUCCESS'
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'CARD', 'NET_BANKING', 'WALLET', 'NONE'],
    default: 'NONE'
  },
  amount: {
    type: Number,
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recharge'
  },
  description: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);

