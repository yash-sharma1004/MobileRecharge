import { Referral } from './referral.model.js';
import { User } from '../auth/user.model.js';

export const getReferralData = async (userId) => {
  const history = await Referral.find({ referrerId: userId }).sort({ createdAt: -1 });
  const totalEarnings = history.reduce((sum, r) => sum + r.reward, 0);
  
  const user = await User.findById(userId).select('referralCode');

  return {
    earnings: totalEarnings,
    history,
    referralCount: history.length,
    referralCode: user?.referralCode || null
  };
};

export const getLeaderboard = async () => {
  const leaderboard = await Referral.aggregate([
    {
      $group: {
        _id: '$referrerId',
        totalEarnings: { $sum: '$reward' },
        referralCount: { $sum: 1 }
      }
    },
    { $sort: { totalEarnings: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        name: '$user.name',
        earnings: '$totalEarnings',
        referralCount: 1
      }
    }
  ]);

  return leaderboard;
};
