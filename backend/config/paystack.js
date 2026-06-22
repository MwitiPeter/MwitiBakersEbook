const axios = require('axios');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API = 'https://api.paystack.co';

const paystack = axios.create({
  baseURL: PAYSTACK_API,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

const initializePayment = async (email, amount, metadata, callbackUrl) => {
  try {
    const payload = {
      email,
      amount: amount * 100, // Paystack uses kobo/cents
      metadata,
    };

    if (callbackUrl) {
      payload.callback_url = callbackUrl;
    }

    const response = await paystack.post('/transaction/initialize', payload);
    return response.data;
  } catch (error) {
    console.error('Paystack initialization error:', error.response?.data || error.message);
    throw new Error('Payment initialization failed');
  }
};

const verifyPayment = async (reference) => {
  try {
    const response = await paystack.get(`/transaction/verify/${reference}`);
    return response.data;
  } catch (error) {
    console.error('Paystack verification error:', error.response?.data || error.message);
    throw new Error('Payment verification failed');
  }
};

module.exports = { initializePayment, verifyPayment };
