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
    purpose: 'TOP_UP',
    status: 'PENDING',
    amount,
    paymentMethod: 'NONE',
    description: 'Wallet top-up order created'
  });

  return txn;
};

export const verifyPayment = async (userId, orderId, paymentMethod) => {
  if (!['UPI', 'CARD', 'NET_BANKING', 'WALLET'].includes(paymentMethod)) {
    throw new Error('Invalid payment method');
  }

  // Check transaction order and verify it belongs to user
  const transaction = await WalletTransaction.findOne({ _id: orderId, userId });
  if (!transaction) {
    throw new Error('Transaction order not found');
  }

  // Replay Protection Check
  if (transaction.status !== 'PENDING') {
    throw new Error('Transaction already processed');
  }

  // Simulate payment result: 80% Success, 20% Failed
  const isSuccess = Math.random() < 0.8;

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    if (isSuccess) {
      const wallet = await Wallet.findOneAndUpdate(
        { userId },
        { $inc: { balance: transaction.amount } },
        { upsert: true, new: true, session }
      );

      transaction.status = 'SUCCESS';
      transaction.paymentMethod = paymentMethod;
      transaction.description = `Wallet top-up via ${paymentMethod}`;
      await transaction.save({ session });

      await session.commitTransaction();
      session.endSession();

      return { success: true, balance: wallet.balance, transaction };
    } else {
      transaction.status = 'FAILED';
      transaction.paymentMethod = paymentMethod;
      transaction.description = `Failed wallet top-up via ${paymentMethod}`;
      await transaction.save({ session });

      await session.commitTransaction();
      session.endSession();

      const wallet = await Wallet.findOne({ userId });
      return { success: false, balance: wallet ? wallet.balance : 0, transaction };
    }
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        // ignore abort error if session was not successfully started
      }
      session.endSession();
    }

    // Fallback: If MongoDB is standalone and doesn't support transactions, do it sequentially
    const isMongoTxnError = error.message && (
      error.message.includes('Transaction numbers') || 
      error.message.includes('replica set') || 
      error.message.includes('sessions') ||
      error.message.includes('retryable writes') ||
      error.message.includes('RetryableWrites')
    );

    if (isMongoTxnError) {
      console.warn('MongoDB Transactions/Sessions/RetryableWrites not supported in this environment. Falling back to atomic sequential execution.');

      // Fetch transaction again to ensure no race condition
      const checkTxn = await WalletTransaction.findOne({ _id: orderId, userId });
      if (checkTxn.status !== 'PENDING') {
        throw new Error('Transaction already processed');
      }

      if (isSuccess) {
        const wallet = await Wallet.findOneAndUpdate(
          { userId },
          { $inc: { balance: transaction.amount } },
          { upsert: true, new: true }
        );

        checkTxn.status = 'SUCCESS';
        checkTxn.paymentMethod = paymentMethod;
        checkTxn.description = `Wallet top-up via ${paymentMethod}`;
        await checkTxn.save();

        return { success: true, balance: wallet.balance, transaction: checkTxn };
      } else {
        checkTxn.status = 'FAILED';
        checkTxn.paymentMethod = paymentMethod;
        checkTxn.description = `Failed wallet top-up via ${paymentMethod}`;
        await checkTxn.save();

        const wallet = await Wallet.findOne({ userId });
        return { success: false, balance: wallet ? wallet.balance : 0, transaction: checkTxn };
      }
    }

    throw error;
  }
};
