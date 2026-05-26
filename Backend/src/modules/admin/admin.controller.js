import { User } from '../auth/user.model.js';
import { Recharge } from '../recharge/recharge.model.js';
import { Wallet } from '../wallet/wallet.model.js';
import { WalletTransaction } from '../wallet/walletTransaction.model.js';
import { Coupon } from '../recharge/coupon.model.js';
import { CashbackRule } from '../recharge/cashbackRule.model.js';
import { Referral } from '../referral/referral.model.js';
import { Offer } from '../recharge/offer.model.js';
import { AppError } from '../../utils/AppError.js';
import { emitToUser } from '../../config/socket.js';

// ==========================================
// 1. ANALYTICS & DASHBOARD METRICS
// ==========================================
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments({ role: 'USER' });
    const totalRecharges = await Recharge.countDocuments();
    const failedRecharges = await Recharge.countDocuments({
      status: { $in: ['RECHARGE_FAILED', 'FAILED', 'REFUNDED'] }
    });
    const activeOffers = await Offer.countDocuments({ isActive: true });
    const referralStatistics = await Referral.countDocuments();

    // Financial aggregates
    const revenueResult = await Recharge.aggregate([
      { $match: { status: { $in: ['RECHARGE_SUCCESS', 'SUCCESS'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const cashbackResult = await WalletTransaction.aggregate([
      { $match: { type: 'CASHBACK', status: 'SUCCESS' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalCashback = cashbackResult[0]?.total || 0;

    const walletBalanceResult = await Wallet.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    const totalWalletBalance = walletBalanceResult[0]?.total || 0;

    // Operator market share
    const operatorShare = await Recharge.aggregate([
      { $group: { _id: '$operator', count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
      { $project: { operator: '$_id', count: 1, revenue: 1, _id: 0 } }
    ]);

    // Recharge growth trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const growthTrends = await Recharge.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, revenue: 1, _id: 0 } }
    ]);

    // Recent activity log
    const recentRecharges = await Recharge.find()
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find({ role: 'USER' })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalRecharges,
          totalRevenue,
          totalCashback,
          totalWalletBalance,
          failedRecharges,
          activeOffers,
          referralStatistics
        },
        operatorShare,
        growthTrends,
        recentRecharges,
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. USER MANAGEMENT
// ==========================================
export const getUsers = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const query = { role: 'USER' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    const skipIndex = (page - 1) * limit;
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(parseInt(limit));

    // Get user extra statistics (Wallet and Recharges)
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const wallet = await Wallet.findOne({ userId: user._id });
        const rechargeCount = await Recharge.countDocuments({ userId: user._id });
        const totalRecharged = await Recharge.aggregate([
          { $match: { userId: user._id, status: 'SUCCESS' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        return {
          ...user._doc,
          walletBalance: wallet?.balance || 0,
          rechargeCount,
          totalRechargedAmount: totalRecharged[0]?.total || 0
        };
      })
    );

    res.status(200).json({
      success: true,
      data: usersWithStats,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const blockUnblockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) throw new AppError('User not found', 404);
    if (user.role === 'ADMIN') throw new AppError('Admin users cannot be blocked', 400);

    user.status = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status changed to ${user.status}`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const adjustUserWallet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, description, operation = 'ADD' } = req.body; // operation: 'ADD' or 'DEDUCT'

    const user = await User.findById(id);
    if (!user) throw new AppError('User not found', 404);

    const changeAmt = Math.abs(parseFloat(amount));
    if (isNaN(changeAmt) || changeAmt <= 0) throw new AppError('Invalid adjustment amount', 400);

    let wallet = await Wallet.findOne({ userId: id });
    if (!wallet) {
      wallet = await Wallet.create({ userId: id, balance: 0 });
    }

    if (operation === 'DEDUCT') {
      if (wallet.balance < changeAmt) throw new AppError('Insufficient wallet balance to deduct', 400);
      wallet.balance -= changeAmt;
    } else {
      wallet.balance += changeAmt;
    }

    await wallet.save();

    // Create a transaction record
    await WalletTransaction.create({
      userId: id,
      type: operation === 'DEDUCT' ? 'RECHARGE' : 'TOP_UP',
      purpose: operation === 'DEDUCT' ? 'RECHARGE' : 'TOP_UP',
      amount: changeAmt,
      status: 'SUCCESS',
      description: description || `Admin Manual Adjustment: ${operation}`
    });

    res.status(200).json({
      success: true,
      message: `Successfully adjusted wallet balance`,
      data: {
        userId: id,
        newBalance: wallet.balance
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recharges = await Recharge.find({ userId: id }).sort({ createdAt: -1 });
    const transactions = await WalletTransaction.find({ userId: id }).sort({ createdAt: -1 });
    const referrals = await Referral.find({ referrerId: id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        recharges,
        transactions,
        referrals
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. RECHARGE & FAILURE MANAGEMENT
// ==========================================
export const getRecharges = async (req, res, next) => {
  try {
    const { search, status, operator, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (operator) {
      query.operator = { $regex: operator, $options: 'i' };
    }

    if (search) {
      // Find matching users first
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } }
        ]
      });
      const userIds = users.map(u => u._id);
      
      query.$or = [
        { userId: { $in: userIds } },
        { number: { $regex: search, $options: 'i' } },
        { rechargeId: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } }
      ];
    }

    const skipIndex = (page - 1) * limit;
    const total = await Recharge.countDocuments(query);
    const recharges = await Recharge.find(query)
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: recharges,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const retryRecharge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recharge = await Recharge.findById(id);

    if (!recharge) throw new AppError('Recharge record not found', 404);
    const retryable = ['RECHARGE_FAILED', 'FAILED', 'REFUNDED'];
    if (!retryable.includes(recharge.status)) {
      throw new AppError('Only failed or refunded recharges can be retried', 400);
    }

    const { processRechargeWithProvider } = await import('../provider/provider.service.js');
    const walletLedger = await import('../wallet/walletLedger.service.js');

    if (recharge.status === 'REFUNDED' || recharge.refundStatus === 'COMPLETED') {
      const wallet = await Wallet.findOne({ userId: recharge.userId });
      if (!wallet || wallet.balance < recharge.amount) {
        throw new AppError('User has insufficient wallet balance for admin retry', 400);
      }
      await walletLedger.debitWallet(recharge.userId, recharge.amount, {
        referenceId: recharge._id,
        description: `Admin retry debit for ${recharge.operator}`
      });
      recharge.refundStatus = 'NONE';
    }

    recharge.status = 'RECHARGE_PROCESSING';
    recharge.failureReason = undefined;
    recharge.providerResponse = {
      provider: recharge.operator,
      status: 'PROCESSING',
      message: 'Admin-initiated retry — contacting operator…',
      retriedAt: new Date()
    };
    await recharge.save();

    emitToUser(recharge.userId, 'recharge_status', {
      rechargeId: recharge._id,
      status: 'RECHARGE_PROCESSING',
      message: 'Admin retry in progress'
    });

    processRechargeWithProvider(recharge._id, recharge.userId, false).catch(console.error);

    res.status(200).json({
      success: true,
      message: 'Provider retry initiated',
      data: recharge
    });
  } catch (error) {
    next(error);
  }
};

export const refundRecharge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recharge = await Recharge.findById(id);

    if (!recharge) throw new AppError('Recharge record not found', 404);
    const refundable = ['RECHARGE_FAILED', 'FAILED'];
    if (!refundable.includes(recharge.status)) {
      throw new AppError('Only failed transactions can be manually refunded', 400);
    }
    if (recharge.refundStatus === 'COMPLETED') throw new AppError('This transaction has already been refunded', 400);

    const { processAutomaticRefund } = await import('../recharge/recharge.lifecycle.js');
    const updated = await processAutomaticRefund(recharge._id, recharge.userId);

    emitToUser(recharge.userId, 'recharge_status', {
      rechargeId: id,
      status: updated?.status || 'REFUNDED',
      message: 'Refund processed by Admin'
    });

    res.status(200).json({
      success: true,
      message: 'Refund successfully processed to user wallet',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. WALLET AUDITING
// ==========================================
export const getWalletTransactions = async (req, res, next) => {
  try {
    const { type, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (type) {
      query.type = type;
    }

    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } }
        ]
      });
      const userIds = users.map(u => u._id);
      query.$or = [
        { userId: { $in: userIds } },
        { transactionId: { $regex: search, $options: 'i' } }
      ];
    }

    const skipIndex = (page - 1) * limit;
    const total = await WalletTransaction.countDocuments(query);
    const transactions = await WalletTransaction.find(query)
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. COUPON MANAGEMENT CRUD
// ==========================================
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: coupons
    });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const { code, description, discount, type, minAmount, expiry, usageLimit } = req.body;
    if (!code || !description || discount === undefined || !expiry) {
      throw new AppError('Required fields: code, description, discount, expiry', 400);
    }

    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) throw new AppError('Coupon code already exists', 400);

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discount: parseFloat(discount),
      type: type || 'flat',
      minAmount: parseFloat(minAmount || 0),
      expiry: new Date(expiry),
      usageLimit: usageLimit ? parseInt(usageLimit) : null
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }

    const coupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!coupon) throw new AppError('Coupon not found', 404);

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) throw new AppError('Coupon not found', 404);

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. CASHBACK RULE ENGINE
// ==========================================
export const getCashbackRules = async (req, res, next) => {
  try {
    let rule = await CashbackRule.findOne({ isActive: true });
    if (!rule) {
      rule = await CashbackRule.create({
        type: 'random',
        minAmount: 0,
        minRandom: 1,
        maxRandom: 25,
        isActive: true
      });
    }
    res.status(200).json({
      success: true,
      data: rule
    });
  } catch (error) {
    next(error);
  }
};

export const updateCashbackRule = async (req, res, next) => {
  try {
    const { type, minAmount, cashbackPercentage, cashbackAmount, minRandom, maxRandom } = req.body;

    // deactivate all active rules first
    await CashbackRule.updateMany({}, { isActive: false });

    // create/activate new rule
    const rule = await CashbackRule.create({
      type: type || 'random',
      minAmount: parseFloat(minAmount || 0),
      cashbackPercentage: parseFloat(cashbackPercentage || 0),
      cashbackAmount: parseFloat(cashbackAmount || 0),
      minRandom: parseInt(minRandom || 1),
      maxRandom: parseInt(maxRandom || 25),
      isActive: true
    });

    res.status(200).json({
      success: true,
      message: 'Cashback rule designer updated successfully',
      data: rule
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 7. REFERRAL MONITOR
// ==========================================
export const getReferrals = async (req, res, next) => {
  try {
    const referrals = await Referral.find()
      .populate('referrerId', 'name email mobile referralCode')
      .populate('referredUserId', 'name email mobile')
      .sort({ createdAt: -1 });

    // Count rewards by referrer to construct leaderboards
    const leaderboard = await Referral.aggregate([
      { $group: { _id: '$referrerId', totalEarnings: { $sum: '$reward' }, inviteCount: { $sum: 1 } } },
      { $sort: { totalEarnings: -1 } },
      { $limit: 10 }
    ]);

    // Populate leaderboards referrers details
    const populatedLeaderboard = await Promise.all(
      leaderboard.map(async (entry) => {
        const user = await User.findById(entry._id).select('name email mobile referralCode');
        return {
          ...entry,
          referrer: user
        };
      })
    );

    // Detect loops / suspicious activities: For example: A refers B, and B refers A
    // We will do a simple abuse scanning: find where referred users are also referring their referrers
    const suspiciousReferrals = [];
    const referralMap = {};

    const allRefs = await Referral.find();
    allRefs.forEach(ref => {
      referralMap[ref.referredUserId.toString()] = ref.referrerId.toString();
    });

    allRefs.forEach(ref => {
      const parent = ref.referrerId.toString();
      const child = ref.referredUserId.toString();
      if (referralMap[parent] === child) {
        // Direct loop detected: A referred B, B referred A!
        suspiciousReferrals.push({
          type: 'Loop',
          userA: ref.referrerId,
          userB: ref.referredUserId,
          details: `Direct Referral Loop detected between both users`
        });
      }
    });

    // Suspect duplicate IPs or identical names or fast signups (not trackable here directly, but loop is awesome!)

    res.status(200).json({
      success: true,
      data: {
        referrals,
        leaderboard: populatedLeaderboard,
        suspiciousReferrals
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 8. OFFER MANAGEMENT CRUD
// ==========================================
export const getOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: offers
    });
  } catch (error) {
    next(error);
  }
};

export const createOffer = async (req, res, next) => {
  try {
    const { title, description, category, bannerUrl, code } = req.body;
    if (!title || !description || !category) {
      throw new AppError('Required fields: title, description, category', 400);
    }

    const offer = await Offer.create({
      title,
      description,
      category: category.toLowerCase(),
      bannerUrl: bannerUrl || '',
      code: code || ''
    });

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      data: offer
    });
  } catch (error) {
    next(error);
  }
};

export const updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const offer = await Offer.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!offer) throw new AppError('Offer not found', 404);

    res.status(200).json({
      success: true,
      message: 'Offer updated successfully',
      data: offer
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findByIdAndDelete(id);
    if (!offer) throw new AppError('Offer not found', 404);

    res.status(200).json({
      success: true,
      message: 'Offer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
