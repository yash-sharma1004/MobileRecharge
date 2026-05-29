import mongoose from 'mongoose';
import { Wallet } from './wallet.model.js';
import { WalletTransaction } from './walletTransaction.model.js';
import { AppError } from '../../utils/AppError.js';
import { emitToUser } from '../../config/socket.js';

const runWithOptionalTransaction = async (fn) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const result = await fn(session);
    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (_) {
        /* ignore */
      }
      session.endSession();
    }

    const isTxnUnsupported =
      error.message &&
      (error.message.includes('Transaction numbers') ||
        error.message.includes('replica set') ||
        error.message.includes('sessions') ||
        error.message.includes('retryable writes') ||
        error.message.includes('RetryableWrites'));

    if (isTxnUnsupported) {
      return fn(null);
    }
    throw error;
  }
};

export const debitWallet = async (userId, amount, { referenceId, description, paymentMethod = 'WALLET' }) => {
  if (!amount || amount <= 0) {
    throw new AppError('Invalid debit amount', 400);
  }

  return runWithOptionalTransaction(async (session) => {
    const walletQuery = Wallet.findOne({ userId });
    if (session) walletQuery.session(session);
    const wallet = await walletQuery;

    if (!wallet || wallet.balance < amount) {
      throw new AppError('Insufficient wallet balance', 400);
    }

    wallet.balance -= amount;
    if (session) {
      await wallet.save({ session });
    } else {
      await wallet.save();
    }

    const txnPayload = {
      userId,
      type: 'RECHARGE',
      purpose: 'RECHARGE',
      amount,
      status: 'SUCCESS',
      paymentMethod,
      paymentGateway: 'NONE',
      referenceId,
      description
    };

    const txn = session
      ? await WalletTransaction.create([txnPayload], { session }).then((r) => r[0])
      : await WalletTransaction.create(txnPayload);

    emitToUser(userId, 'wallet_updated', {
      balance: wallet.balance,
      type: 'DEBIT',
      amount,
      referenceId
    });

    return { wallet, transaction: txn };
  });
};

export const creditWallet = async (
  userId,
  amount,
  { type, purpose, referenceId, description, paymentMethod = 'NONE', paymentGateway = 'NONE', paymentId, orderId }
) => {
  if (!amount || amount <= 0) {
    throw new AppError('Invalid credit amount', 400);
  }

  return runWithOptionalTransaction(async (session) => {
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { upsert: true, new: true, session: session || undefined }
    );

    const txnPayload = {
      userId,
      type,
      purpose,
      amount,
      status: 'SUCCESS',
      paymentMethod,
      paymentGateway,
      paymentId,
      orderId,
      referenceId,
      description
    };

    const txn = session
      ? await WalletTransaction.create([txnPayload], { session }).then((r) => r[0])
      : await WalletTransaction.create(txnPayload);

    emitToUser(userId, 'wallet_updated', {
      balance: wallet.balance,
      type,
      amount,
      referenceId
    });

    return { wallet, transaction: txn };
  });
};

/**
 * Idempotent refund for a failed recharge — blocks duplicate REFUND txns.
 */
export const refundRechargePayment = async (userId, rechargeId, description) => {
  const existingRefund = await WalletTransaction.findOne({
    referenceId: rechargeId,
    type: 'REFUND',
    status: 'SUCCESS'
  });

  if (existingRefund) {
    return { alreadyRefunded: true, transaction: existingRefund };
  }

  const debitTxn = await WalletTransaction.findOne({
    referenceId: rechargeId,
    type: 'RECHARGE',
    status: 'SUCCESS'
  });

  const refundAmount = debitTxn?.amount;
  if (!refundAmount) {
    return { alreadyRefunded: false, skipped: true, reason: 'No wallet debit found for this recharge' };
  }

  return runWithOptionalTransaction(async (session) => {
    const duplicateCheck = await WalletTransaction.findOne({
      referenceId: rechargeId,
      type: 'REFUND',
      status: 'SUCCESS'
    });
    if (duplicateCheck) {
      return { alreadyRefunded: true, transaction: duplicateCheck };
    }

    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: refundAmount } },
      { upsert: true, new: true, session: session || undefined }
    );

    const txnPayload = {
      userId,
      type: 'REFUND',
      purpose: 'WALLET_REFUND',
      amount: refundAmount,
      status: 'SUCCESS',
      paymentMethod: 'WALLET',
      referenceId: rechargeId,
      refundReference: debitTxn._id,
      description: description || 'Refund for failed recharge'
    };

    const txn = session
      ? await WalletTransaction.create([txnPayload], { session }).then((r) => r[0])
      : await WalletTransaction.create(txnPayload);

    emitToUser(userId, 'wallet_updated', {
      balance: wallet.balance,
      type: 'REFUND',
      amount: refundAmount,
      referenceId: rechargeId
    });

    return { alreadyRefunded: false, wallet, transaction: txn, amount: refundAmount };
  });
};
