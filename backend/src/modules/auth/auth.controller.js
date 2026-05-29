import * as authService from './auth.service.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import { AppError } from '../../utils/AppError.js';

export const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.registerUser(validatedData);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return next(new AppError(error.errors?.[0]?.message || 'Invalid input data', 400));
    }
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // With stateless JWT, logout is handled client-side by removing the token.
    // This endpoint exists for future token blacklisting and audit logging.
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.loginUser(validatedData);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return next(new AppError(error.errors?.[0]?.message || 'Invalid input data', 400));
    }
    next(error);
  }
};

export const firebaseLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) throw new AppError('Firebase ID Token is required', 400);

    const result = await authService.firebaseLogin(idToken);

    res.status(200).json({
      success: true,
      message: 'Firebase login successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------
// OTP CONTROLLERS
// ---------------------------------------------------------

export const sendLoginOTP = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    if (!identifier) throw new AppError('Identifier (mobile or email) is required', 400);

    const result = await authService.sendLoginOTP({ identifier });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const verifyLoginOTP = async (req, res, next) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) throw new AppError('Identifier and OTP are required', 400);

    const result = await authService.verifyLoginOTP({ identifier, otp });
    res.status(200).json({ success: true, message: 'Login successful', data: result });
  } catch (error) {
    next(error);
  }
};

export const sendForgotPasswordOTP = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    if (!identifier) throw new AppError('Identifier is required', 400);

    const result = await authService.sendForgotPasswordOTP({ identifier });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const verifyForgotPasswordOTP = async (req, res, next) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) throw new AppError('Identifier and OTP are required', 400);

    const result = await authService.verifyForgotPasswordOTP({ identifier, otp });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const verifyFirebaseResetToken = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) throw new AppError('Firebase ID Token is required', 400);

    const result = await authService.verifyFirebaseResetToken(idToken);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) throw new AppError('Reset token and new password are required', 400);
    if (newPassword.length < 6) throw new AppError('Password must be at least 6 characters', 400);

    const result = await authService.resetPassword({ resetToken, newPassword });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

