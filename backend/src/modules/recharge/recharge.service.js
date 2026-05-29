import { Recharge } from './recharge.model.js';
import { Coupon } from './coupon.model.js';
import { AppError } from '../../utils/AppError.js';
import { emitToUser } from '../../config/socket.js';
import * as walletLedger from '../wallet/walletLedger.service.js';
import { processRechargeWithProvider } from '../provider/provider.service.js';
import { resolveProviderKey } from '../provider/provider.config.js';

const emitStatus = (userId, recharge, extra = {}) => {
  emitToUser(userId, 'recharge_status', {
    rechargeId: recharge._id,
    status: recharge.status,
    failureReason: recharge.failureReason,
    providerResponse: recharge.providerResponse,
    transactionId: recharge.transactionId,
    ...extra
  });
};

const validatePlanAmount = (data) => {
  const planPrice = data.planData?.price;
  if (planPrice != null && Math.abs(data.amount - planPrice) > 0.01) {
    throw new AppError('Recharge amount does not match selected plan price', 400);
  }
};

const computeDiscounts = async (data) => {
  let couponDiscount = 0;
  let hasCoupon = false;
  let couponRecord = null;

  if (data.couponCode && typeof data.couponCode === 'string') {
    couponRecord = await Coupon.findOne({
      code: data.couponCode.toUpperCase(),
      isActive: true
    });
    if (!couponRecord) throw new AppError('Invalid or inactive coupon code', 400);
    if (data.amount < couponRecord.minAmount) {
      throw new AppError(`Minimum recharge of ₹${couponRecord.minAmount} required`, 400);
    }
    if (new Date() > new Date(couponRecord.expiry)) {
      throw new AppError('Coupon has expired', 400);
    }
    if (couponRecord.usageLimit !== null && couponRecord.usageCount >= couponRecord.usageLimit) {
      throw new AppError('Coupon usage limit has been reached', 400);
    }
    couponDiscount =
      couponRecord.type === 'percentage'
        ? (data.amount * couponRecord.discount) / 100
        : couponRecord.discount;
    hasCoupon = true;
  }

  let referralDiscount = 0;
  if (
    data.referralCode &&
    typeof data.referralCode === 'string' &&
    data.referralCode.toUpperCase() === 'YASH2026'
  ) {
    referralDiscount = 50;
  }

  const finalAmount = Math.max(0, data.amount - couponDiscount - referralDiscount);
  return { finalAmount, hasCoupon, couponRecord, couponCode: couponRecord?.code };
};

export const createRecharge = async (userId, data) => {
  validatePlanAmount(data);

  const { finalAmount, hasCoupon, couponCode } = await computeDiscounts(data);

  if (finalAmount <= 0) {
    throw new AppError('Invalid recharge amount after discounts', 400);
  }

  const walletAmountRequired =
    data.useWallet && data.walletAmountUsed > 0
      ? Math.min(data.walletAmountUsed, finalAmount)
      : finalAmount;

  if (!data.useWallet || walletAmountRequired < finalAmount) {
    throw new AppError(
      'Full payment must be completed before recharge. Top up wallet via Razorpay first.',
      400
    );
  }

  const txnId = `TXN${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;
  const providerKey = resolveProviderKey(data.operator);

  const recharge = await Recharge.create({
    userId,
    operator: data.operator,
    number: data.number,
    amount: finalAmount,
    plan: data.plan,
    planId: data.planId,
    planData: data.planData,
    payMethod: data.payMethod || 'UPI',
    category:
      data.category ||
      (providerKey === 'broadband' ? 'broadband' : providerKey === 'electricity' ? 'utility' : 'mobile'),
    status: 'PAYMENT_PENDING',
    transactionId: txnId,
    couponCode: couponCode || undefined,
    paymentOrderId: data.paymentOrderId || undefined,
    parentRechargeId: data.parentRechargeId || undefined
  });

  try {
    emitStatus(userId, recharge, { message: 'Confirming payment…' });

    const { transaction: debitTxn } = await walletLedger.debitWallet(userId, finalAmount, {
      referenceId: recharge._id,
      description: `Payment for ${data.operator} recharge`,
      paymentMethod: data.payMethod === 'Wallet' ? 'WALLET' : 'UPI'
    });

    recharge.paymentId = debitTxn._id.toString();
    recharge.status = 'PAYMENT_SUCCESS';
    await recharge.save();
    emitStatus(userId, recharge, { message: 'Payment verified' });

    recharge.status = 'RECHARGE_PROCESSING';
    recharge.providerResponse = {
      provider: data.operator,
      status: 'PROCESSING',
      message: 'Submitting recharge to operator…',
      queuedAt: new Date()
    };
    await recharge.save();
    emitStatus(userId, recharge, { message: 'Recharge processing with operator…' });

    processRechargeWithProvider(recharge._id, userId, hasCoupon).catch((err) => {
      console.error('Provider processing error:', err);
    });

    return {
      recharge: {
        id: recharge._id,
        transactionId: recharge.transactionId,
        operator: recharge.operator,
        number: recharge.number,
        amount: recharge.amount,
        status: recharge.status,
        date: recharge.createdAt,
        providerResponse: recharge.providerResponse
      },
      walletUsed: finalAmount,
      cashbackEarned: 0,
      message: 'Recharge submitted to operator'
    };
  } catch (error) {
    recharge.status = 'RECHARGE_FAILED';
    recharge.failureReason = error.message;
    await recharge.save();
    emitStatus(userId, recharge, { message: error.message });
    throw error;
  }
};

export const retryRecharge = async (userId, rechargeId) => {
  const oldRecharge = await Recharge.findOne({
    _id: rechargeId,
    userId,
    status: { $in: ['RECHARGE_FAILED', 'REFUNDED', 'FAILED'] }
  });

  if (!oldRecharge) {
    throw new AppError('Failed recharge not found or not eligible for retry', 404);
  }

  if (oldRecharge.status === 'REFUNDED' || oldRecharge.refundStatus === 'COMPLETED') {
    const wallet = await import('../wallet/wallet.model.js').then((m) => m.Wallet.findOne({ userId }));
    if (!wallet || wallet.balance < oldRecharge.amount) {
      throw new AppError('Insufficient wallet balance for retry', 400);
    }
  }

  return createRecharge(userId, {
    operator: oldRecharge.operator,
    number: oldRecharge.number,
    amount: oldRecharge.planData?.price || oldRecharge.amount,
    plan: oldRecharge.plan,
    planData: oldRecharge.planData,
    planId: oldRecharge.planId,
    payMethod: oldRecharge.payMethod,
    useWallet: true,
    walletAmountUsed: oldRecharge.amount,
    category: oldRecharge.category,
    parentRechargeId: oldRecharge._id
  });
};

export const getRechargeHistory = async (userId) => {
  return Recharge.find({ userId }).sort({ createdAt: -1 });
};

export const getLastRecharge = async (userId) => {
  return Recharge.findOne({ userId }).sort({ createdAt: -1 });
};

export const getActiveExpiry = async (userId) => {
  const latest = await Recharge.findOne({
    userId,
    status: { $in: ['RECHARGE_SUCCESS', 'SUCCESS'] },
    expiryDate: { $ne: null }
  }).sort({ createdAt: -1 });

  if (!latest || !latest.expiryDate) return null;

  const daysLeft = Math.ceil((new Date(latest.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  return {
    expiryDate: latest.expiryDate,
    daysLeft,
    plan: latest.plan,
    operator: latest.operator
  };
};
