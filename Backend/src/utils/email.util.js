import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Ensure environment variables are loaded immediately for this module
dotenv.config();

// Configure standard nodemailer transport
// In production, use your real SMTP server (e.g. Resend, Sendgrid, Gmail)
// We will create a test account on the fly for development if no host is provided.

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Use environment variables if available
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    console.log('Using SMTP Configuration for:', process.env.SMTP_USER);
    
    // For Gmail, use service: 'gmail' for better reliability
    if (process.env.SMTP_HOST.includes('gmail')) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT == 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  } else {
    console.error("FATAL ERROR: SMTP configuration missing in .env file!");
    throw new Error("SMTP configuration missing. Please check SMTP_HOST and SMTP_USER in .env");
  }
  return transporter;
};

/**
 * Sends an OTP email to the user
 * @param {string} to - Recipient email address
 * @param {string} otp - The plain 6-digit OTP
 * @param {string} purpose - Purpose of the OTP (e.g. 'LOGIN', 'FORGOT_PASSWORD')
 */
export const sendOTPEmail = async (to, otp, purpose) => {
  const recipient = to.toLowerCase().trim();
  try {
    const transport = await getTransporter();

    let subject = 'Your MobileRecharge OTP';
    let text = `Your OTP is ${otp}. It is valid for 5 minutes.`;
    let html = `<p>Your OTP is <b>${otp}</b>.</p><p>It is valid for 5 minutes. Do not share this code with anyone.</p>`;

    if (purpose === 'FORGOT_PASSWORD') {
      subject = 'MobileRecharge Password Reset OTP';
      text = `Your password reset OTP is ${otp}. It is valid for 5 minutes.`;
      html = `<p>You requested a password reset. Your OTP is <b>${otp}</b>.</p><p>It is valid for 5 minutes.</p>`;
    } else if (purpose === 'LOGIN') {
      subject = 'MobileRecharge Login OTP';
    }

    console.log(`Attempting to send email from: ${process.env.EMAIL_FROM || process.env.SMTP_USER}`);
    console.log(`Recipient: ${recipient}`);

    const info = await transport.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: recipient,
      subject: subject,
      text: text,
      html: html
    });

    console.log(`Email accepted by SMTP server. Message ID: ${info.messageId}`);
    console.log(`SMTP Response: ${info.response}`);

    return true;
  } catch (error) {
    console.error('CRITICAL: Error sending email via SMTP:', error);
    // We throw the error so the calling service knows delivery failed
    // and can return a 500/400 to the frontend instead of failing silently.
    throw new Error('Failed to deliver OTP email. Please check SMTP configuration.');
  }
};

// The connection will be verified and transporter created on the first email request.
