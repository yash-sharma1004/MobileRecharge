import jwt from 'jsonwebtoken';
import { User } from './user.model.js';
import { AppError } from '../../utils/AppError.js';
import { Referral } from '../referral/referral.model.js';
import { Wallet } from '../wallet/wallet.model.js';
import { WalletTransaction } from '../wallet/walletTransaction.model.js';

export const registerUser = async (userData) => {
  const existingMobile = await User.findOne({ mobile: userData.mobile });
  if (existingMobile) {
    throw new AppError('Mobile number is already registered', 400);
  }

  const existingEmail = await User.findOne({ email: userData.email });
  if (existingEmail) {
    throw new AppError('Email address is already registered', 400);
  }

  // Validate referral code if provided
  let referrer = null;
  if (userData.referralCode && typeof userData.referralCode === 'string' && userData.referralCode.trim()) {
    referrer = await User.findOne({ referralCode: userData.referralCode.trim().toUpperCase() });
    if (!referrer) {
      throw new AppError('Invalid referral code. Please check and try again.', 400);
    }
  }

  // Create the new user
  const user = await User.create({
    mobile: userData.mobile,
    email: userData.email,
    name: userData.name,
    passwordHash: userData.password,
    referredBy: referrer?._id || null,
    authProvider: 'password'
  });

  // Process referral reward if a valid referrer exists
  if (referrer) {
    // Self-referral guard (shouldn't happen but just in case)
    if (referrer._id.toString() === user._id.toString()) {
      // Skip reward — don't crash, just ignore
    } else {
      const referralCount = await Referral.countDocuments({ referrerId: referrer._id });
      const nextCount = referralCount + 1;
      const isMilestone = nextCount % 5 === 0;

      let reward = 50;
      if (isMilestone) reward += 100;

      // Create referral record
      await Referral.create({
        referrerId: referrer._id,
        referredUserId: user._id,
        referredUserName: user.name,
        codeUsed: referrer.referralCode,
        reward,
        isMilestone
      });

      // Credit reward to referrer's wallet
      await Wallet.findOneAndUpdate(
        { userId: referrer._id },
        { $inc: { balance: reward } },
        { upsert: true, new: true }
      );

      await WalletTransaction.create({
        userId: referrer._id,
        type: 'REFERRAL',
        purpose: 'REFERRAL',
        status: 'SUCCESS',
        amount: reward,
        description: isMilestone
          ? `Milestone bonus! ${user.name} joined via your referral`
          : `${user.name} joined via your referral`
      });
    }
  }

  const token = generateToken(user._id);

  // Return user without password
  const { passwordHash, ...userWithoutPassword } = user._doc;
  return { user: userWithoutPassword, token };
};

export const loginUser = async (credentials) => {
  const user = await User.findOne({
    $or: [{ mobile: credentials.identifier }, { email: credentials.identifier }]
  });

  if (!user) {
    throw new AppError('Invalid mobile/email or password', 401);
  }

  const isPasswordValid = await user.comparePassword(credentials.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid mobile/email or password', 401);
  }

  const token = generateToken(user._id);

  const { passwordHash, ...userWithoutPassword } = user._doc;
  return { user: userWithoutPassword, token };
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};


const generateResetToken = (userId) => {
  return jwt.sign({ id: userId, reset: true }, process.env.JWT_SECRET, {
    expiresIn: '10m' // Reset token is only valid for 10 minutes
  });
};

// ---------------------------------------------------------
// OTP SERVICE METHODS
// ---------------------------------------------------------
import { Otp } from './otp.model.js';
import { generateOTP, hashOTP, verifyOTP as checkOTPHash } from '../../utils/otp.util.js';
import { sendOTPEmail } from '../../utils/email.util.js';

// Send OTP for Login
export const sendLoginOTP = async ({ identifier }) => {

  const user = await User.findOne({
    $or: [
      { mobile: identifier },
      { email: identifier }
    ]
  });

  if (!user) {
    throw new AppError(
      'No account found with this mobile number or email',
      404
    );
  }

  const lastOtp = await Otp.findOne({
    identifier,
    purpose: 'LOGIN'
  }).sort({ createdAt: -1 });

  if (
    lastOtp &&
    Date.now() - lastOtp.createdAt.getTime() < 60000
  ) {
    throw new AppError(
      'Please wait 60 seconds before requesting another OTP',
      429
    );
  }

  const plainOtp = generateOTP();

  const hashedOtp = await hashOTP(plainOtp);

  try {

    // Send email first
    if (identifier.includes('@')) {

      console.log("Sending OTP to:", identifier);
      console.log("Generated OTP:", plainOtp);

      await sendOTPEmail(
        identifier,
        plainOtp,
        'LOGIN'
      );

    } else {
      throw new AppError(
        'Phone OTP login is not supported. Please use email OTP.',
        400
      );
    }

    // Save OTP only if email sent successfully
    await Otp.create({
      identifier,
      otpHash: hashedOtp,
      purpose: 'LOGIN',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    return {
      message: 'OTP sent successfully'
    };

  } catch (error) {

    console.log("OTP EMAIL ERROR:", error);

    throw new AppError(
      'Failed to send OTP email',
      500
    );
  }
};

// Verify OTP for Login
export const verifyLoginOTP = async ({ identifier, otp }) => {
  const otpRecord = await Otp.findOne({ identifier, purpose: 'LOGIN' }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new AppError('OTP expired or invalid', 400);
  }

  if (otpRecord.attempts >= 5) {
    await Otp.deleteOne({ _id: otpRecord._id });
    throw new AppError('Too many failed attempts. Please request a new OTP.', 400);
  }

  const isValid = await checkOTPHash(otp, otpRecord.otpHash);
  if (!isValid) {
    // Increment attempts
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new AppError('Invalid OTP', 400);
  }

  // OTP is valid, clean it up
  await Otp.deleteOne({ _id: otpRecord._id });

  // Log user in
  const user = await User.findOne({ $or: [{ mobile: identifier }, { email: identifier }] });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const token = generateToken(user._id);
  const { passwordHash, ...userWithoutPassword } = user._doc;
  return { user: userWithoutPassword, token };
};

// Send OTP for Forgot Password
export const sendForgotPasswordOTP = async ({ identifier }) => {
  const user = await User.findOne({ $or: [{ mobile: identifier }, { email: identifier }] });
  if (!user) throw new AppError('No account found with this identifier', 404);

  const plainOtp = generateOTP();
  const hashedOtp = await hashOTP(plainOtp);

  await Otp.create({
    identifier,
    otpHash: hashedOtp,
    purpose: 'FORGOT_PASSWORD',
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });

  if (identifier.includes('@')) {
    await sendOTPEmail(identifier, plainOtp, 'FORGOT_PASSWORD');
  } else {
    throw new AppError('Phone OTP is not supported. Please use your email to reset password.', 400);
  }

  return { message: 'Password reset OTP sent successfully' };
};

// Verify OTP for Forgot Password
export const verifyForgotPasswordOTP = async ({ identifier, otp }) => {
  const otpRecord = await Otp.findOne({ identifier, purpose: 'FORGOT_PASSWORD' }).sort({ createdAt: -1 });
  if (!otpRecord) throw new AppError('OTP expired or invalid', 400);

  if (otpRecord.attempts >= 5) {
    await Otp.deleteOne({ _id: otpRecord._id });
    throw new AppError('Too many failed attempts. Please request a new OTP.', 400);
  }

  const isValid = await checkOTPHash(otp, otpRecord.otpHash);
  if (!isValid) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new AppError('Invalid OTP', 400);
  }

  await Otp.deleteOne({ _id: otpRecord._id });

  const user = await User.findOne({ $or: [{ mobile: identifier }, { email: identifier }] });
  const resetToken = generateResetToken(user._id);

  return { resetToken, message: 'OTP verified successfully. You can now reset your password.' };
};


// Reset Password
export const resetPassword = async ({ resetToken, newPassword }) => {
  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (!decoded.reset) {
      throw new AppError('Invalid token', 400);
    }

    const user = await User.findById(decoded.id);
    if (!user) throw new AppError('User not found', 404);

    user.passwordHash = newPassword; // Will be hashed by pre-save hook
    await user.save();

    return { message: 'Password reset successfully' };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Reset token expired', 400);
    }
    throw new AppError('Invalid or expired reset token', 400);
  }
};
