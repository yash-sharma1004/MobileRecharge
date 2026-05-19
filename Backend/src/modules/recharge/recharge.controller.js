import * as rechargeService from './recharge.service.js';
import { createRechargeSchema } from './recharge.validation.js';
import { AppError } from '../../utils/AppError.js';

export const createRecharge = async (req, res, next) => {
  try {
    const validatedData = createRechargeSchema.parse(req.body);
    const result = await rechargeService.createRecharge(req.user._id, validatedData);

    res.status(201).json({
      success: true,
      message: 'Recharge successful',
      data: result
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return next(new AppError(error.errors?.[0]?.message || 'Invalid input data', 400));
    }
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const history = await rechargeService.getRechargeHistory(req.user._id);
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

export const getLastRecharge = async (req, res, next) => {
  try {
    const last = await rechargeService.getLastRecharge(req.user._id);
    res.status(200).json({
      success: true,
      data: last
    });
  } catch (error) {
    next(error);
  }
};

export const getExpiry = async (req, res, next) => {
  try {
    const expiry = await rechargeService.getActiveExpiry(req.user._id);
    res.status(200).json({
      success: true,
      data: expiry
    });
  } catch (error) {
    next(error);
  }
};
export const retryRecharge = async (req, res, next) => {
  try {
    const { rechargeId } = req.params;
    const result = await rechargeService.retryRecharge(req.user._id, rechargeId);

    res.status(201).json({
      success: true,
      message: 'Retry recharge initiated',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
