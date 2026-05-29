import { AppError } from '../utils/AppError.js';

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return next(new AppError('Access denied. Admins only.', 403));
  }
  next();
};
