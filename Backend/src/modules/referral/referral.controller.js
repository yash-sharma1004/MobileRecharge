import * as referralService from './referral.service.js';

export const getReferralData = async (req, res, next) => {
  try {
    const data = await referralService.getReferralData(req.user._id);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const data = await referralService.getLeaderboard();
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
