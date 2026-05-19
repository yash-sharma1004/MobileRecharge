import { Recharge } from './recharge.model.js';
import { Wallet } from '../wallet/wallet.model.js';
import { WalletTransaction } from '../wallet/walletTransaction.model.js';
import { Referral } from '../referral/referral.model.js';
import { AppError } from '../../utils/AppError.js';

// Cashback rules (moved from frontend)
const cashbackRules = {
  type: 'random',
  min: 1,
  max: 25
};

const calculateCashback = (amount, hasCoupon) => {
  if (!amount) return 0;

  if (hasCoupon) {
    return Math.floor(Math.random() * 4) + 2; // 2-5 with coupon
  }

  let cb = 0;
  if (cashbackRules.type === 'random') {
    cb = Math.floor(Math.random() * (cashbackRules.max - cashbackRules.min + 1)) + cashbackRules.min;
  }

  // Clamp to 20-25 range
  if (cb > 25) cb = Math.floor(Math.random() * 6) + 20;
  else if (cb < 20) cb = Math.floor(Math.random() * 6) + 20;

  return cb;
};

// Coupon definitions (moved from frontend)
const coupons = [
  { code: 'SAVE50', discount: 50, minAmount: 200, expiry: '2026-12-31' },
  { code: 'NEWUSER100', discount: 100, minAmount: 300, expiry: '2026-12-31' },
  { code: 'BHAVYA2202', type: 'percentage', discount: 100, minAmount: 0, expiry: '2026-12-31' },
  { code: 'WEEKEND20', discount: 5, minAmount: 150, expiry: '2026-12-31' },
  { code: 'FLAT75', discount: 15.5, minAmount: 500, expiry: '2026-12-31' }
];

import { emitToUser } from '../../config/socket.js';

// ... (cashbackRules and coupons remain the same) ...

export const createRecharge = async (userId, data) => {
  // Validate coupon server-side
  let couponDiscount = 0;
  let hasCoupon = false;
  if (data.couponCode && typeof data.couponCode === 'string') {
    const coupon = coupons.find(c => c.code === data.couponCode.toUpperCase());
    if (!coupon) throw new AppError('Invalid coupon code', 400);
    if (data.amount < coupon.minAmount) throw new AppError(`Minimum recharge of ₹${coupon.minAmount} required`, 400);
    if (new Date() > new Date(coupon.expiry)) throw new AppError('Coupon has expired', 400);
    couponDiscount = coupon.type === 'percentage' ? (data.amount * coupon.discount / 100) : coupon.discount;
    hasCoupon = true;
  }

  // Referral discount
  let referralDiscount = 0;
  if (data.referralCode && typeof data.referralCode === 'string' && data.referralCode.toUpperCase() === 'YASH2026') {
    referralDiscount = 50;
  }

  const finalAmount = Math.max(0, data.amount - couponDiscount - referralDiscount);

  // Initial recharge record (PENDING)
  const txnId = `TXN${Date.now().toString().slice(-8)}`;
  const recharge = await Recharge.create({
    userId,
    operator: data.operator,
    number: data.number,
    amount: finalAmount,
    plan: data.plan,
    planData: data.planData,
    payMethod: data.payMethod || 'UPI',
    status: 'PENDING',
    transactionId: txnId
  });

  // Handle wallet deduction and move to PROCESSING
  let walletUsed = 0;
  try {
    if (data.useWallet && data.walletAmountUsed > 0) {
      const wallet = await Wallet.findOne({ userId });
      if (wallet && wallet.balance >= data.walletAmountUsed) {
        walletUsed = Math.min(data.walletAmountUsed, finalAmount);
        wallet.balance -= walletUsed;
        await wallet.save();

        await WalletTransaction.create({
          userId,
          type: 'RECHARGE',
          purpose: 'RECHARGE',
          amount: walletUsed,
          status: 'SUCCESS',
          referenceId: recharge._id,
          description: `Used for ${data.operator} recharge`
        });
      } else if (data.useWallet) {
        throw new AppError('Insufficient wallet balance', 400);
      }
    }

    // Update status to PROCESSING
    recharge.status = 'PROCESSING';
    await recharge.save();
    emitToUser(userId, 'recharge_status', { rechargeId: recharge._id, status: 'PROCESSING' });

    // Trigger simulation asynchronously
    processRechargeSimulation(recharge._id, userId, hasCoupon);

  } catch (error) {
    recharge.status = 'FAILED';
    recharge.failureReason = error.message;
    await recharge.save();
    emitToUser(userId, 'recharge_status', { rechargeId: recharge._id, status: 'FAILED', reason: error.message });
    throw error;
  }

  return {
    recharge: {
      id: recharge._id,
      transactionId: recharge.transactionId,
      operator: recharge.operator,
      number: recharge.number,
      amount: recharge.amount,
      status: recharge.status,
      date: recharge.createdAt
    },
    walletUsed
  };
};

const processRechargeSimulation = async (rechargeId, userId, hasCoupon) => {
  // Simulate network delay (3-7 seconds)
  const delay = Math.floor(Math.random() * 4000) + 3000;
  await new Promise(resolve => setTimeout(resolve, delay));

  try {
    const recharge = await Recharge.findById(rechargeId);
    if (!recharge) return;

    // Simulate outcome (85% success)
    const isSuccess = Math.random() > 0.15;

    if (isSuccess) {
      const cashback = calculateCashback(recharge.amount, hasCoupon);
      const expiryDate = recharge.planData?.validityDays
        ? new Date(Date.now() + recharge.planData.validityDays * 24 * 60 * 60 * 1000)
        : null;

      recharge.status = 'SUCCESS';
      recharge.rechargeId = `OP${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      recharge.cashbackEarned = cashback;
      recharge.expiryDate = expiryDate;
      await recharge.save();

      // Credit cashback
      if (cashback > 0) {
        await Wallet.findOneAndUpdate({ userId }, { $inc: { balance: cashback } }, { upsert: true });
        await WalletTransaction.create({
          userId,
          type: 'CASHBACK',
          purpose: 'CASHBACK',
          amount: cashback,
          status: 'SUCCESS',
          referenceId: recharge._id,
          description: `Cashback for ${recharge.operator} recharge`
        });
      }

      emitToUser(userId, 'recharge_status', { rechargeId, status: 'SUCCESS', cashback });
    } else {
      // Failure logic
      const failureReasons = ['Operator timeout', 'Invalid plan', 'Network issue', 'Provider unavailable'];
      const reason = failureReasons[Math.floor(Math.random() * failureReasons.length)];
      
      recharge.status = 'FAILED';
      recharge.failureReason = reason;
      await recharge.save();

      // Auto-refund logic
      const walletUsedTxn = await WalletTransaction.findOne({ 
        referenceId: recharge._id, 
        type: 'RECHARGE' 
      });

      if (walletUsedTxn) {
        recharge.refundStatus = 'PENDING';
        await recharge.save();

        await Wallet.findOneAndUpdate({ userId }, { $inc: { balance: walletUsedTxn.amount } });
        await WalletTransaction.create({
          userId,
          type: 'REFUND',
          purpose: 'WALLET_REFUND',
          amount: walletUsedTxn.amount,
          status: 'SUCCESS',
          referenceId: recharge._id,
          description: `Refund for failed ${recharge.operator} recharge`
        });

        recharge.refundStatus = 'COMPLETED';
        recharge.status = 'REFUNDED';
        await recharge.save();
      }

      emitToUser(userId, 'recharge_status', { rechargeId, status: recharge.status, reason });
    }
  } catch (error) {
    console.error('Simulation Error:', error);
  }
};

export const retryRecharge = async (userId, rechargeId) => {
  const oldRecharge = await Recharge.findOne({ _id: rechargeId, userId, status: { $in: ['FAILED', 'REFUNDED'] } });
  if (!oldRecharge) throw new AppError('Failed recharge not found', 404);

  // Re-initiate using the same data
  return await createRecharge(userId, {
    operator: oldRecharge.operator,
    number: oldRecharge.number,
    amount: oldRecharge.planData?.price || oldRecharge.amount,
    plan: oldRecharge.plan,
    planData: oldRecharge.planData,
    useWallet: true, // Typically retry uses wallet if refund was successful
    walletAmountUsed: oldRecharge.planData?.price || oldRecharge.amount
  });
};

export const getRechargeHistory = async (userId) => {
  return await Recharge.find({ userId }).sort({ createdAt: -1 });
};

export const getLastRecharge = async (userId) => {
  return await Recharge.findOne({ userId }).sort({ createdAt: -1 });
};

export const getActiveExpiry = async (userId) => {
  const latest = await Recharge.findOne({ userId, status: 'SUCCESS', expiryDate: { $ne: null } }).sort({ createdAt: -1 });
  if (!latest || !latest.expiryDate) return null;

  const daysLeft = Math.ceil((new Date(latest.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  return {
    expiryDate: latest.expiryDate,
    daysLeft,
    plan: latest.plan,
    operator: latest.operator
  };
};
