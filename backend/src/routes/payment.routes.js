const express = require('express');
const router = express.Router();
// const authMiddleware = require('../middleware/auth'); // Temporarily disabled
const authBypass = require('../middleware/auth-bypass'); // Using bypass for debugging
const X402Handler = require('../services/X402Handler');

// Call API with X402 payment (Phase 1 Implementation)
router.post('/', authBypass, async (req, res) => {
  try {
    const { endpoint } = req.body;
    const { nullifier } = req.user || { nullifier: 'debug-nullifier' };

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint required' });
    }

    if (!nullifier) {
      return res.status(401).json({ 
        error: 'World ID verification required',
        code: 'WORLD_ID_REQUIRED',
      });
    }

    console.log(`📥 Received API call request: ${endpoint} from user ${nullifier.slice(0, 8)}...`);
    console.log(`🔄 Flow: User Request → Our Backend → Payment → External API → Forward Response`);

    // Process payment and call external API through our backend
    // The external API call goes through our application and we forward the response
    const { apiKey } = req.body; // Optional API key for tracking
    
    const result = await X402Handler.processPayment({
      nullifier,
      endpoint,
      userId: req.user.id,
      apiKey, // Pass API key to handler
    });

    if (result.status === 402) {
      // Payment required - X402 protocol response
      console.log(`⚠️ Payment required: ${result.message}`);
      return res.status(402).json({
        error: result.message,
        price: result.price,
        currency: result.currency || 'USDC',
        code: result.error || 'PAYMENT_REQUIRED',
        headers: {
          'x-price': result.price?.toString(),
          'x-currency': result.currency || 'USDC',
        },
      });
    }

    if (result.status === 200) {
      // Payment successful, return API result
      console.log(`✅ Payment successful: ${result.paymentId}, balance: ${result.newBalance} USDC`);
      return res.json({
        success: true,
        result: result.apiResult,
        newBalance: result.newBalance,
        paymentId: result.paymentId,
        price: result.price,
      });
    }

    res.status(500).json({ error: 'Payment processing failed' });
  } catch (error) {
    console.error('❌ Payment error:', error);
    res.status(500).json({ 
      error: 'Payment processing failed',
      message: error.message,
    });
  }
});

module.exports = router;

