import dotenv from 'dotenv';
dotenv.config();

import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { WalletTransaction } from '../wallet/walletTransaction.model.js';
import { Wallet } from '../wallet/wallet.model.js';
import { User } from '../auth/user.model.js';
import { AppError } from '../../utils/AppError.js';
import { emitToUser } from '../../config/socket.js';

// Initialize Razorpay client safely, sanitizing quotes and whitespaces
const getRazorpayInstance = () => {
  let keyId = process.env.RAZORPAY_KEY_ID;
  let keySecret = process.env.RAZORPAY_SECRET;

  if (keyId) {
    keyId = keyId.replace(/['" ]/g, '').trim();
  }
  if (keySecret) {
    keySecret = keySecret.replace(/['" ]/g, '').trim();
  }

  if (!keyId || !keySecret) {
    console.warn('⚠️ Razorpay credentials missing or invalid in environment. Using test mode placeholders.');
  }

  return new Razorpay({
    key_id: keyId || 'rzp_test_dummyKeyId',
    key_secret: keySecret || 'dummySecretKey'
  });
};

const razorpay = getRazorpayInstance();

/**
 * Creates a Razorpay order and a pending WalletTransaction in database.
 */
export const createRazorpayOrder = async (userId, amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new AppError('Amount must be a valid number', 400);
  }
  if (!Number.isInteger(amount)) {
    throw new AppError('Decimal amounts are not allowed', 400);
  }
  if (amount < 10) {
    throw new AppError('Minimum transaction amount is ₹10', 400);
  }
  if (amount > 50000) {
    throw new AppError('Maximum transaction amount is ₹50,000', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if we are using placeholder/dummy keys, and if so, perform a clean mock simulation fallback
  const isDummyKey = 
    !process.env.RAZORPAY_KEY_ID || 
    process.env.RAZORPAY_KEY_ID.includes('YOUR_KEY_ID') || 
    process.env.RAZORPAY_KEY_ID.includes('dummy');

  if (isDummyKey && process.env.NODE_ENV === 'production') {
    throw new AppError('Razorpay credentials must be configured in production', 503);
  }

  if (isDummyKey && process.env.NODE_ENV !== 'production') {
    console.log('ℹ️ Dev mode: local Razorpay order simulation.');
    const mockOrderId = `order_mock_${Date.now()}_${Math.floor(10000 + Math.random() * 90000)}`;
    
    const txn = await WalletTransaction.create({
      userId,
      type: 'TOP_UP',
      purpose: 'TOP_UP',
      status: 'PENDING',
      amount,
      paymentGateway: 'RAZORPAY',
      orderId: mockOrderId,
      gatewayStatus: 'created',
      description: 'Wallet top-up via local simulated Razorpay initiated'
    });

    return {
      orderId: mockOrderId,
      transactionId: txn.transactionId,
      amount: txn.amount,
      currency: 'INR',
      status: txn.status
    };
  }

  // Create order via Razorpay API
  let rzpOrder;
  try {
    rzpOrder = await razorpay.orders.create({
      amount: amount * 100, // Razorpay works in paisa
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      notes: {
        userId: userId.toString(),
        purpose: 'WALLET_TOPUP'
      }
    });
  } catch (error) {
    console.error('RAZORPAY ORDER ERROR:', error);
    
    // Extract nested description/message safely to prevent 'undefined' errors on frontend
    const detailMsg = 
      error.message || 
      (error.error && error.error.description) || 
      error.description || 
      (typeof error === 'object' ? JSON.stringify(error) : String(error)) ||
      'Unknown Razorpay Gateway Error';
      
    throw new AppError(`Failed to create gateway order: ${detailMsg}`, 500);
  }

  // Save pending transaction in our database
  const txn = await WalletTransaction.create({
    userId,
    type: 'TOP_UP',
    purpose: 'TOP_UP',
    status: 'PENDING',
    amount,
    paymentGateway: 'RAZORPAY',
    orderId: rzpOrder.id,
    gatewayStatus: 'created',
    description: 'Wallet top-up via Razorpay initiated'
  });

  return {
    orderId: rzpOrder.id,
    transactionId: txn.transactionId,
    amount: txn.amount,
    currency: rzpOrder.currency,
    status: txn.status
  };
};

/**
 * Verifies Razorpay payment signature and credits the user's wallet.
 */
export const verifyRazorpayPayment = async (userId, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError('Missing required payment verification parameters', 400);
  }

  // Intercept mock order payments for safe local simulation
  const isMockMode =
    process.env.NODE_ENV !== 'production' &&
    (razorpay_order_id.startsWith('order_mock_') ||
      (process.env.RAZORPAY_SECRET && process.env.RAZORPAY_SECRET.includes('YOUR_SECRET_KEY')));

  if (isMockMode) {
    console.log('ℹ️ Placeholder keys detected. Bypassing signature verification for mock order.');
    
    // Atomically claim the transaction first
    const transaction = await WalletTransaction.findOneAndUpdate(
      { orderId: razorpay_order_id, userId, status: 'PENDING' },
      {
        $set: {
          status: 'SUCCESS',
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          paymentMethod: 'UPI',
          gatewayStatus: 'captured',
          description: `Wallet top-up via local simulated Razorpay`
        }
      },
      { new: true }
    );

    if (!transaction) {
      // Transaction already completed or not found
      const checkTxn = await WalletTransaction.findOne({ orderId: razorpay_order_id, userId });
      if (!checkTxn) {
        throw new AppError('Payment order not found in database', 404);
      }
      const wallet = await Wallet.findOne({ userId });
      return { success: true, balance: wallet ? wallet.balance : 0, transaction: checkTxn };
    }

    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: transaction.amount } },
      { upsert: true, new: true }
    );

    emitToUser(userId, 'wallet_updated', { balance: wallet.balance, type: 'TOP_UP', amount: transaction.amount });
    emitToUser(userId, 'payment_status', {
      orderId: razorpay_order_id,
      status: 'SUCCESS',
      paymentId: razorpay_payment_id,
      amount: transaction.amount
    });

    return {
      success: true,
      balance: wallet.balance,
      transaction
    };
  }

  // Verify the signature
  const keySecret = process.env.RAZORPAY_SECRET || 'dummySecretKey';
  const hmac = crypto.createHmac('sha256', keySecret);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature !== razorpay_signature) {
    throw new AppError('Invalid payment signature. Verification failed.', 400);
  }

  // Check if transaction exists at all before proceeding
  const checkExists = await WalletTransaction.findOne({ orderId: razorpay_order_id, userId });
  if (!checkExists) {
    throw new AppError('Payment order not found in database', 404);
  }

  if (checkExists.status !== 'PENDING') {
    const wallet = await Wallet.findOne({ userId });
    return {
      success: true,
      balance: wallet ? wallet.balance : 0,
      transaction: checkExists
    };
  }

  // Fetch payment details from Razorpay to detect payment method
  let paymentMethod = 'NONE';
  let rawResponse = {};
  try {
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    rawResponse = paymentDetails;
    if (paymentDetails.method) {
      paymentMethod = paymentDetails.method.toUpperCase();
      if (paymentMethod === 'NETBANKING') paymentMethod = 'NET_BANKING';
    }
  } catch (error) {
    console.warn('Could not fetch payment details from Razorpay API:', error.message);
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // 1. Atomically update the transaction to SUCCESS to prevent double-crediting
    const updatedTxn = await WalletTransaction.findOneAndUpdate(
      { orderId: razorpay_order_id, userId, status: 'PENDING' },
      {
        $set: {
          status: 'SUCCESS',
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          paymentMethod,
          gatewayStatus: 'captured',
          gatewayResponse: rawResponse,
          description: `Wallet top-up via Razorpay (${paymentMethod})`
        }
      },
      { new: true, session }
    );

    if (!updatedTxn) {
      // Race condition occurred, webhook already marked it SUCCESS
      await session.abortTransaction();
      session.endSession();
      session = null;

      const checkTxn = await WalletTransaction.findOne({ orderId: razorpay_order_id, userId });
      const wallet = await Wallet.findOne({ userId });
      return {
        success: true,
        balance: wallet ? wallet.balance : 0,
        transaction: checkTxn
      };
    }

    // 2. Credit the user's wallet balance
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: updatedTxn.amount } },
      { upsert: true, new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    emitToUser(userId, 'wallet_updated', { balance: wallet.balance, type: 'TOP_UP', amount: updatedTxn.amount });
    emitToUser(userId, 'payment_status', {
      orderId: razorpay_order_id,
      status: 'SUCCESS',
      paymentId: razorpay_payment_id,
      amount: updatedTxn.amount
    });

    return {
      success: true,
      balance: wallet.balance,
      transaction: updatedTxn
    };
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        // Suppress session start failure aborts
      }
      session.endSession();
    }

    // Fallback: If MongoDB is standalone and doesn't support transactions, run sequentially
    const isMongoTxnError = error.message && (
      error.message.includes('Transaction numbers') || 
      error.message.includes('replica set') || 
      error.message.includes('sessions') ||
      error.message.includes('retryable writes') ||
      error.message.includes('RetryableWrites')
    );

    if (isMongoTxnError) {
      console.warn('MongoDB Transactions not supported in this env. Falling back to atomic sequential execution.');

      const updatedTxn = await WalletTransaction.findOneAndUpdate(
        { orderId: razorpay_order_id, userId, status: 'PENDING' },
        {
          $set: {
            status: 'SUCCESS',
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            paymentMethod,
            gatewayStatus: 'captured',
            gatewayResponse: rawResponse,
            description: `Wallet top-up via Razorpay (${paymentMethod})`
          }
        },
        { new: true }
      );

      if (!updatedTxn) {
        const checkTxn = await WalletTransaction.findOne({ orderId: razorpay_order_id, userId });
        const wallet = await Wallet.findOne({ userId });
        return {
          success: true,
          balance: wallet ? wallet.balance : 0,
          transaction: checkTxn
        };
      }

      const wallet = await Wallet.findOneAndUpdate(
        { userId },
        { $inc: { balance: updatedTxn.amount } },
        { upsert: true, new: true }
      );

      emitToUser(userId, 'wallet_updated', { balance: wallet.balance, type: 'TOP_UP', amount: updatedTxn.amount });
      emitToUser(userId, 'payment_status', {
        orderId: razorpay_order_id,
        status: 'SUCCESS',
        paymentId: razorpay_payment_id,
        amount: updatedTxn.amount
      });

      return {
        success: true,
        balance: wallet.balance,
        transaction: updatedTxn
      };
    }

    throw error;
  }
};

/**
 * Creates a Razorpay order for direct recharge payments.
 */
export const createRechargeRazorpayOrder = async (rechargeId, amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new AppError('Amount must be a valid number', 400);
  }

  const isDummyKey = 
    !process.env.RAZORPAY_KEY_ID || 
    process.env.RAZORPAY_KEY_ID.includes('YOUR_KEY_ID') || 
    process.env.RAZORPAY_KEY_ID.includes('dummy');

  if (isDummyKey && process.env.NODE_ENV === 'production') {
    throw new AppError('Razorpay credentials must be configured in production', 503);
  }

  if (isDummyKey && process.env.NODE_ENV !== 'production') {
    console.log('ℹ️ Dev mode: local Razorpay direct recharge order simulation.');
    const mockOrderId = `order_mock_${Date.now()}_${Math.floor(10000 + Math.random() * 90000)}`;
    return {
      orderId: mockOrderId,
      amount,
      currency: 'INR',
      status: 'created'
    };
  }

  // Create order via Razorpay API
  try {
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay works in paisa
      currency: 'INR',
      receipt: `recharge_receipt_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      notes: {
        rechargeId: rechargeId.toString(),
        purpose: 'DIRECT_RECHARGE'
      }
    });

    return {
      orderId: rzpOrder.id,
      amount,
      currency: rzpOrder.currency,
      status: rzpOrder.status
    };
  } catch (error) {
    console.error('RAZORPAY RECHARGE ORDER ERROR:', error);
    const detailMsg = error.message || (error.error && error.error.description) || 'Unknown Razorpay Gateway Error';
    throw new AppError(`Failed to create recharge order: ${detailMsg}`, 500);
  }
};

/**
 * Verifies Razorpay payment for a direct recharge.
 * Deducts NO wallet balance and credits NO wallet balance.
 * Sets recharge status to PAYMENT_SUCCESS and logs a debit RECHARGE transaction for audit history.
 */
export const verifyRechargePayment = async (userId, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError('Missing required payment verification parameters', 400);
  }

  // Find the pending recharge by its Razorpay order id
  const { Recharge } = await import('../recharge/recharge.model.js');
  const recharge = await Recharge.findOne({ paymentOrderId: razorpay_order_id, userId });
  if (!recharge) {
    throw new AppError('Pending recharge order not found in database', 404);
  }

  if (recharge.status !== 'PAYMENT_PENDING') {
    return { success: true, status: recharge.status, recharge };
  }

  const isMockMode =
    process.env.NODE_ENV !== 'production' &&
    (razorpay_order_id.startsWith('order_mock_') ||
      (process.env.RAZORPAY_SECRET && process.env.RAZORPAY_SECRET.includes('YOUR_SECRET_KEY')));

  if (!isMockMode) {
    // Verify the signature
    const keySecret = process.env.RAZORPAY_SECRET || 'dummySecretKey';
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      throw new AppError('Invalid payment signature. Verification failed.', 400);
    }
  }

  // Fetch payment details from Razorpay to detect payment method
  let paymentMethod = 'UPI';
  let rawResponse = {};
  if (!isMockMode) {
    try {
      const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      rawResponse = paymentDetails;
      if (paymentDetails.method) {
        paymentMethod = paymentDetails.method.toUpperCase();
        if (paymentMethod === 'NETBANKING') paymentMethod = 'NET_BANKING';
      }
    } catch (error) {
      console.warn('Could not fetch payment details from Razorpay API:', error.message);
    }
  }

  // Atomic update to PAYMENT_SUCCESS and log non-wallet debit RECHARGE transaction for audit
  recharge.status = 'PAYMENT_SUCCESS';
  recharge.paymentId = razorpay_payment_id;
  await recharge.save();

  // Create audit transaction (Type = RECHARGE, Direction = DEBIT, Wallet unchanged)
  const txn = await WalletTransaction.create({
    userId,
    type: 'RECHARGE',
    direction: 'DEBIT',
    purpose: 'RECHARGE',
    amount: recharge.amount,
    status: 'SUCCESS',
    paymentMethod,
    paymentGateway: 'RAZORPAY',
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
    referenceId: recharge._id,
    description: `Direct recharge payment via ${paymentMethod}`
  });

  emitToUser(userId, 'recharge_status', {
    rechargeId: recharge._id,
    status: 'PAYMENT_SUCCESS',
    message: 'Payment verified successfully'
  });

  // Trigger provider processing asynchronously outside database transaction block
  recharge.status = 'RECHARGE_PROCESSING';
  recharge.providerResponse = {
    provider: recharge.operator,
    status: 'PROCESSING',
    message: 'Submitting recharge to operator…',
    queuedAt: new Date()
  };
  await recharge.save();

  const { processRechargeWithProvider } = await import('../provider/provider.service.js');
  processRechargeWithProvider(recharge._id, userId, !!recharge.couponCode).catch((err) => {
    console.error('Provider processing error:', err);
  });

  return {
    success: true,
    status: recharge.status,
    transaction: txn,
    recharge
  };
};

/**
 * Handle optional Webhook events from Razorpay for reliability.
 */
export const verifyAndProcessWebhook = async (signature, rawBody) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('⚠️ Webhook secret not configured in env. Skipping signature check.');
  } else {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new AppError('Invalid webhook signature', 400);
    }
  }

  const event = JSON.parse(rawBody);
  console.log(`📡 Razorpay Webhook Event Received: ${event.event}`);

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    const orderId = payment.order_id;
    const paymentId = payment.id;
    const method = payment.method ? payment.method.toUpperCase() : 'NONE';

    // Find the pending transaction first to verify amount
    const transaction = await WalletTransaction.findOne({ orderId });
    if (!transaction) {
      return { success: true, message: 'No matching transaction' };
    }

    // Verify amount matches
    if (payment.amount !== transaction.amount * 100) {
      console.error(`Webhook amount mismatch. Expected ${transaction.amount * 100} paisa, got ${payment.amount}`);
      return { success: false, message: 'Payment amount mismatch' };
    }

    // Atomically mark status to SUCCESS
    const updatedTxn = await WalletTransaction.findOneAndUpdate(
      { orderId, status: 'PENDING' },
      {
        $set: {
          status: 'SUCCESS',
          paymentId,
          paymentMethod: method === 'NETBANKING' ? 'NET_BANKING' : method,
          gatewayStatus: 'captured',
          gatewayResponse: payment,
          description: `Wallet top-up via Webhook (${method})`
        }
      },
      { new: true }
    );

    if (!updatedTxn) {
      return { success: true, message: 'Already processed or not pending' };
    }

    const userId = updatedTxn.userId;

    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: updatedTxn.amount } },
      { upsert: true, new: true }
    );

    emitToUser(userId, 'wallet_updated', {
      balance: wallet.balance,
      type: 'TOP_UP',
      amount: updatedTxn.amount
    });
    emitToUser(userId, 'payment_status', {
      orderId,
      status: 'SUCCESS',
      paymentId,
      amount: updatedTxn.amount
    });

    console.log(`✅ Webhook processed. Credited ₹${updatedTxn.amount} to user: ${userId}`);
  } else if (event.event === 'payment.failed') {
    const payment = event.payload.payment.entity;
    const orderId = payment.order_id;
    const paymentId = payment.id;
    const errorDescription = payment.error_description || 'Declined';

    // Atomically mark status to FAILED
    const updatedTxn = await WalletTransaction.findOneAndUpdate(
      { orderId, status: 'PENDING' },
      {
        $set: {
          status: 'FAILED',
          paymentId,
          gatewayStatus: 'failed',
          gatewayResponse: payment,
          description: `Wallet top-up failed (${errorDescription})`
        }
      },
      { new: true }
    );

    if (updatedTxn) {
      const userId = updatedTxn.userId;
      emitToUser(userId, 'payment_status', {
        orderId,
        status: 'FAILED',
        paymentId,
        amount: updatedTxn.amount
      });
      console.log(`❌ Webhook processed failed payment. Order: ${orderId}`);
    }
  }

  return { success: true };
};
