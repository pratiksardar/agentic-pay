const express = require('express');
const router = express.Router();
const conditionalAuth = require('../middleware/conditional-auth'); // Switches based on ENABLE_AUTH_BYPASS flag
const TransactionService = require('../services/TransactionService');

// Get user transactions
router.get('/', conditionalAuth, async (req, res) => {
  try {
    const { nullifier } = req.user || { nullifier: 'debug-nullifier' };
    const limit = parseInt(req.query.limit) || 50;

    if (!nullifier) {
      return res.status(400).json({ error: 'Nullifier required' });
    }

    const transactions = await TransactionService.getUserTransactions(nullifier, limit);
    const stats = await TransactionService.getStatistics(nullifier);

    res.json({
      transactions,
      statistics: stats,
    });
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transaction statistics
router.get('/stats', conditionalAuth, async (req, res) => {
  try {
    const { nullifier } = req.user || { nullifier: 'debug-nullifier' };

    if (!nullifier) {
      return res.status(400).json({ error: 'Nullifier required' });
    }

    const stats = await TransactionService.getStatistics(nullifier);
    res.json(stats);
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;

