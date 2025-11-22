/**
 * Test routes for Phase 1 verification
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const MicroPaymentEngine = require('../services/MicroPaymentEngine');
const X402Handler = require('../services/X402Handler');

// Test X402 payment flow
router.post('/x402-payment', authMiddleware, async (req, res) => {
  try {
    const { nullifier } = req.user;
    const { endpoint, amount } = req.body;

    if (!nullifier) {
      return res.status(400).json({ error: 'Nullifier required' });
    }

    const testEndpoint = endpoint || '/api/weather';
    const testAmount = amount || 0.0001;

    console.log('🧪 Testing X402 payment flow...');
    console.log(`   Nullifier: ${nullifier.slice(0, 8)}...`);
    console.log(`   Endpoint: ${testEndpoint}`);
    console.log(`   Amount: $${testAmount} USDC`);

    // Test payment processing
    const result = await MicroPaymentEngine.processX402Payment(
      {
        nullifier,
        endpoint: testEndpoint,
      },
      testAmount
    );

    res.json({
      success: true,
      test: 'X402 Payment Flow',
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ 
      error: 'Test failed',
      message: error.message,
    });
  }
});

// Test World ID verification
router.post('/verify-world-id', authMiddleware, async (req, res) => {
  try {
    const { nullifier } = req.user;

    if (!nullifier) {
      return res.status(400).json({ error: 'Nullifier required' });
    }

    console.log('🧪 Testing World ID verification...');
    const isVerified = await MicroPaymentEngine.verifyWorldID(nullifier);

    res.json({
      success: true,
      test: 'World ID Verification',
      nullifier: nullifier.slice(0, 8) + '...',
      verified: isVerified,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ 
      error: 'Test failed',
      message: error.message,
    });
  }
});

// Test wallet creation
router.post('/create-wallet', authMiddleware, async (req, res) => {
  try {
    const { nullifier } = req.user;

    if (!nullifier) {
      return res.status(400).json({ error: 'Nullifier required' });
    }

    console.log('🧪 Testing wallet creation...');
    const walletId = await MicroPaymentEngine.getOrCreateWallet(nullifier);
    const balance = await MicroPaymentEngine.getWalletBalance(walletId);

    res.json({
      success: true,
      test: 'Wallet Creation',
      nullifier: nullifier.slice(0, 8) + '...',
      walletId,
      balance,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ 
      error: 'Test failed',
      message: error.message,
    });
  }
});

// Test full payment flow
router.post('/full-flow', authMiddleware, async (req, res) => {
  try {
    const { nullifier } = req.user;
    const { endpoint } = req.body;

    if (!nullifier) {
      return res.status(400).json({ error: 'Nullifier required' });
    }

    const testEndpoint = endpoint || '/api/weather';

    console.log('🧪 Testing full X402 payment flow...');
    
    // Step 1: Verify World ID
    const isVerified = await MicroPaymentEngine.verifyWorldID(nullifier);
    if (!isVerified) {
      return res.status(402).json({
        error: 'World ID verification failed',
        step: 'verification',
      });
    }

    // Step 2: Get or create wallet
    const walletId = await MicroPaymentEngine.getOrCreateWallet(nullifier);
    
    // Step 3: Get balance
    const balance = await MicroPaymentEngine.getWalletBalance(walletId);
    
    // Step 4: Process payment
    const paymentResult = await X402Handler.processPayment({
      nullifier,
      endpoint: testEndpoint,
    });

    res.json({
      success: true,
      test: 'Full X402 Payment Flow',
      steps: {
        '1_verification': isVerified,
        '2_wallet_created': walletId,
        '3_initial_balance': balance,
        '4_payment_result': paymentResult,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ 
      error: 'Test failed',
      message: error.message,
    });
  }
});

module.exports = router;

