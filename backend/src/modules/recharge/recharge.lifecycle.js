import { Recharge } from './recharge.model.js';
import { CashbackRule } from './cashbackRule.model.js';
import { emitToUser } from '../../config/socket.js';
import * as walletLedger from '../wallet/walletLedger.service.js';

const emitStatus = (userId, recharge, extra = {}) => {
  emitToUser(userId, 'recharge_status', {
    rechargeId: recharge._id,
    status: recharge.status,
    failureReason: recharge.failureReason,
    providerResponse: recharge.providerResponse,
    cashback: recharge.cashbackEarned,
    rechargeIdRef: recharge.rechargeId,
    transactionId: recharge.transactionId,
    ...extra
  });
};

const calculateCashback = async (amount, hasCoupon) => {
  if (!amount) return 0;
  if (hasCoupon) return Math.min(5, Math.max(2, Math.floor(amount * 0.02)));

  try {
    const rule = await CashbackRule.findOne({ isActive: true });
    let cb = 0;

    if (rule) {
      if (rule.type === 'percentage') {
        cb = Math.round((amount * rule.cashbackPercentage) / 100);
      } else if (rule.type === 'flat') {
        cb = rule.cashbackAmount;
      } else if (rule.type === 'random') {
        const span = rule.maxRandom - rule.minRandom + 1;
        cb = rule.minRandom + (amount % span);
      }
    }

    if (!cb) cb = Math.min(25, Math.max(2, Math.floor(amount * 0.05)));
    return Math.min(25, Math.max(0, cb));
  } catch {
    return Math.min(25, Math.max(2, Math.floor(amount * 0.03)));
  }
};

export const finalizeProviderResult = async (rechargeId, userId, resolved, hasCoupon) => {
  const recharge = await Recharge.findById(rechargeId);
  if (!recharge || recharge.status !== 'RECHARGE_PROCESSING') {
    return recharge;
  }

  if (resolved.outcome === 'SUCCESS') {
    const cashback = await calculateCashback(recharge.amount, hasCoupon);
    const expiryDate = recharge.planData?.validityDays
      ? new Date(Date.now() + recharge.planData.validityDays * 24 * 60 * 60 * 1000)
      : null;

    recharge.status = 'RECHARGE_SUCCESS';
    recharge.rechargeId = resolved.providerRef;
    recharge.cashbackEarned = cashback;
    recharge.expiryDate = expiryDate;
    recharge.failureReason = undefined;
    recharge.providerResponse = {
      ...recharge.providerResponse,
      status: 'SUCCESS',
      message: resolved.message
    };
    await recharge.save();

    if (cashback > 0) {
      await walletLedger.creditWallet(userId, cashback, {
        type: 'CASHBACK',
        purpose: 'CASHBACK',
        referenceId: recharge._id,
        description: `Cashback for ${recharge.operator} recharge`
      });
    }

    if (recharge.couponCode) {
      const { Coupon } = await import('./coupon.model.js');
      await Coupon.updateOne({ code: recharge.couponCode }, { $inc: { usageCount: 1 } });
    }

    emitStatus(userId, recharge, { message: resolved.message, cashback });
    return recharge;
  }

  recharge.status = 'RECHARGE_FAILED';
  recharge.failureReason = resolved.message;
  recharge.providerResponse = {
    ...recharge.providerResponse,
    status: resolved.outcome,
    message: resolved.message
  };
  await recharge.save();
  emitStatus(userId, recharge, { message: resolved.message });

  return processAutomaticRefund(rechargeId, userId);
};

export const processAutomaticRefund = async (rechargeId, userId) => {
  const recharge = await Recharge.findById(rechargeId);
  if (!recharge) return null;

  if (['REFUNDED', 'REFUND_PROCESSING'].includes(recharge.status)) {
    return recharge;
  }

  if (recharge.refundStatus === 'COMPLETED') {
    recharge.status = 'REFUNDED';
    await recharge.save();
    return recharge;
  }

  recharge.status = 'REFUND_PROCESSING';
  recharge.refundStatus = 'PENDING';
  await recharge.save();
  emitStatus(userId, recharge, { message: 'Processing refund to wallet…' });

  const refundResult = await walletLedger.refundRechargePayment(
    userId,
    recharge._id,
    `Refund for failed ${recharge.operator} recharge`
  );

  if (refundResult.skipped && !refundResult.alreadyRefunded) {
    recharge.status = 'RECHARGE_FAILED';
    recharge.refundStatus = 'NONE';
    await recharge.save();
    emitStatus(userId, recharge, { message: 'No wallet debit to refund' });
    return recharge;
  }

  recharge.refundStatus = 'COMPLETED';
  recharge.status = 'REFUNDED';
  recharge.providerResponse = {
    ...recharge.providerResponse,
    refund: {
      amount: refundResult.amount || refundResult.transaction?.amount,
      completedAt: new Date(),
      message: 'Amount credited back to wallet'
    }
  };
  await recharge.save();

  emitStatus(userId, recharge, {
    message: 'Refund completed — amount credited to wallet',
    refunded: true
  });

  return recharge;
};
