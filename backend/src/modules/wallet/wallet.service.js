import { Wallet } from './wallet.model.js';
import { WalletTransaction } from './walletTransaction.model.js';
import mongoose from 'mongoose';

export const getWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId, balance: 0 });
  }
  return wallet;
};

export const getTransactions = async (userId, limit = 20, page = 1) => {
  const parsedLimit = parseInt(limit, 10) || 20;
  const parsedPage = parseInt(page, 10) || 1;
  const transactions = await WalletTransaction.find({ userId })
    .sort({ createdAt: -1 })
    .skip((parsedPage - 1) * parsedLimit)
    .limit(parsedLimit);
  return transactions;
};

export const addCashback = async (userId, amount, description = 'Cashback earned') => {
  const wallet = await Wallet.findOneAndUpdate(
    { userId },
    { $inc: { balance: amount } },
    { upsert: true, new: true }
  );

  const txn = await WalletTransaction.create({
    userId,
    type: 'CASHBACK',
    direction: 'CREDIT',
    purpose: 'CASHBACK',
    status: 'SUCCESS',
    amount,
    description
  });

  return { wallet, transaction: txn };
};

export const deductBalance = async (userId, amount, description = 'Wallet redeemed') => {
  const wallet = await Wallet.findOne({ userId });
  if (!wallet || wallet.balance < amount) {
    throw new Error('Insufficient wallet balance');
  }

  wallet.balance -= amount;
  await wallet.save();

  const txn = await WalletTransaction.create({
    userId,
    type: 'RECHARGE',
    direction: 'DEBIT',
    purpose: 'RECHARGE',
    status: 'SUCCESS',
    amount,
    description
  });

  return { wallet, transaction: txn };
};

export const createOrder = async (userId, amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new Error('Amount must be a valid number');
  }
  if (!Number.isInteger(amount)) {
    throw new Error('Decimal amounts are not allowed');
  }
  if (amount < 10) {
    throw new Error('Minimum top-up amount is ₹10');
  }
  if (amount > 50000) {
    throw new Error('Maximum top-up amount is ₹50,000');
  }

  const txn = await WalletTransaction.create({
    userId,
    type: 'TOP_UP',
    direction: 'CREDIT',
    purpose: 'TOP_UP',
    status: 'PENDING',
    amount,
    paymentMethod: 'NONE',
    description: 'Wallet top-up order created'
  });

  return txn;
};

export const verifyPayment = async () => {
  throw new Error(
    'Legacy simulated payment removed. Use POST /api/v1/payment/create-order and /api/v1/payment/verify with Razorpay.'
  );
};
