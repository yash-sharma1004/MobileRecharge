import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generates a 6-digit cryptographically secure random OTP
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
  // Generate random number between 100000 and 999999
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hashes the OTP using bcrypt
 * @param {string} otp 
 * @returns {Promise<string>} hashed OTP
 */
export const hashOTP = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

/**
 * Verifies a plain OTP against its hash
 * @param {string} otp - The plain text OTP
 * @param {string} hash - The hashed OTP from database
 * @returns {Promise<boolean>}
 */
export const verifyOTP = async (otp, hash) => {
  return bcrypt.compare(otp, hash);
};
