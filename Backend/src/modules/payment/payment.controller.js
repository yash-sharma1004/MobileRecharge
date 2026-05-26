import * as paymentService from './payment.service.js';

export const createOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    const orderData = await paymentService.createRazorpayOrder(req.user._id, Number(amount));

    res.status(201).json({
      success: true,
      message: 'Razorpay order created successfully',
      data: orderData
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Payment ID, and Signature are required'
      });
    }

    const verificationResult = await paymentService.verifyRazorpayPayment(req.user._id, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully and wallet credited',
      data: {
        balance: verificationResult.balance,
        transaction: verificationResult.transaction
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const result = await paymentService.verifyAndProcessWebhook(signature, rawBody);

    res.status(200).json(result);
  } catch (error) {
    console.error('Webhook Error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message || 'Webhook processing failed'
    });
  }
};
