const express = require('express');
const router = express.Router();
// const authMiddleware = require('../middleware/auth'); // Temporarily disabled
const authBypass = require('../middleware/auth-bypass'); // Using bypass for debugging
const MicroPaymentEngine = require('../services/MicroPaymentEngine');
const X402Handler = require('../services/X402Handler');

// Get wallet balance
router.get('/balance', authBypass, async (req, res) => {
  try {
    const { nullifier } = req.user;

    if (!nullifier) {
      return res.status(400).json({ error: 'Nullifier required' });
    }

    // Get or create wallet
    const walletId = await MicroPaymentEngine.getOrCreateWallet(nullifier);
    
    // Get balance from MicroPaymentEngine
    const balance = await MicroPaymentEngine.getWalletBalance(walletId);

    res.json({ 
      balance,
      walletId,
    });
  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// Top up wallet (for testing)
router.post('/top-up', authBypass, async (req, res) => {
  try {
    const { nullifier } = req.user;
    const { amount } = req.body;

    if (!nullifier) {
      return res.status(400).json({ error: 'Nullifier required' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    // Get or create wallet
    const walletId = await MicroPaymentEngine.getOrCreateWallet(nullifier);
    
    // Top up balance
    const newBalance = await MicroPaymentEngine.topUpBalance(walletId, parseFloat(amount));

    res.json({ 
      success: true,
      newBalance,
      walletId,
      amountAdded: parseFloat(amount),
    });
  } catch (error) {
    console.error('Top up error:', error);
    res.status(500).json({ error: 'Failed to top up wallet' });
  }
});

// Get wallet info
router.get('/info', authBypass, async (req, res) => {
  try {
    const { nullifier } = req.user;

    if (!nullifier) {
      return res.status(400).json({ error: 'Nullifier required' });
    }

    const walletId = await MicroPaymentEngine.getWalletId(nullifier);
    const balance = walletId ? await MicroPaymentEngine.getWalletBalance(walletId) : 0;

    res.json({ 
      walletId: walletId || null,
      balance,
      hasWallet: !!walletId,
    });
  } catch (error) {
    console.error('Wallet info error:', error);
    res.status(500).json({ error: 'Failed to get wallet info' });
  }
});

module.exports = router;

