const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const X402Handler = require('../services/X402Handler');

// Call API with X402 payment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { endpoint } = req.body;
    const { nullifier } = req.user;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint required' });
    }

    // Process X402 payment
    const result = await X402Handler.processPayment({
      nullifier,
      endpoint,
      userId: req.user.id,
    });

    if (result.status === 402) {
      // Payment required
      return res.status(402).json({
        error: result.message,
        price: result.price,
        currency: 'USDC',
      });
    }

    if (result.status === 200) {
      // Payment successful, return API result
      return res.json({
        success: true,
        result: result.apiResult,
        newBalance: result.newBalance,
        paymentId: result.paymentId,
      });
    }

    res.status(500).json({ error: 'Payment processing failed' });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

module.exports = router;

