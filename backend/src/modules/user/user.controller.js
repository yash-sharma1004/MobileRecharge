import { AppError } from '../../utils/AppError.js';

export const getProfile = async (req, res, next) => {
  try {
    const { passwordHash, ...userWithoutPassword } = req.user._doc;
    
    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};
