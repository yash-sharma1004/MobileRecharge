import * as walletService from './wallet.service.js';

export const getWallet = async (req, res, next) => {
  try {
    const wallet = await walletService.getWallet(req.user._id);
    res.status(200).json({
      success: true,
      data: { balance: wallet.balance }
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    // Show latest 20 transactions only (page 1, limit 20 by default)
    const { limit = 20, page = 1 } = req.query;
    const transactions = await walletService.getTransactions(req.user._id, limit, page);
    res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const order = await walletService.createOrder(req.user._id, Number(amount));
    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        transactionId: order.transactionId,
        amount: order.amount,
        status: order.status
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create payment order'
    });
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethod } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }
    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: 'Payment method is required' });
    }

    const result = await walletService.verifyPayment(req.user._id, orderId, paymentMethod);
    res.status(200).json({
      success: result.success,
      data: {
        balance: result.balance,
        transaction: result.transaction
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
};
