const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Get wallet balance
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const { nullifier } = req.user;

    // Mock balance - replace with actual wallet query
    const balance = 10.0; // USDC

    res.json({ balance });
  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

module.exports = router;

