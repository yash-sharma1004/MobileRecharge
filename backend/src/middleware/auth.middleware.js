import jwt from 'jsonwebtoken';
import { User } from '../modules/auth/user.model.js';
import { AppError } from '../utils/AppError.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    if (currentUser.status === 'BLOCKED') {
      return next(new AppError('Your account has been blocked by the Administrator.', 403));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};
