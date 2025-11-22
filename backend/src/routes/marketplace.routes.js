const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Get all available APIs
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Mock API listings - replace with database query
    const apis = [
      {
        id: '1',
        name: 'Weather API',
        description: 'Get current weather data for any location',
        endpoint: '/api/weather',
        pricePerCall: 0.0001,
        totalCalls: 1250,
      },
      {
        id: '2',
        name: 'News Headlines',
        description: 'Latest news headlines from multiple sources',
        endpoint: '/api/news',
        pricePerCall: 0.0002,
        totalCalls: 890,
      },
      {
        id: '3',
        name: 'Price Data',
        description: 'Real-time cryptocurrency price data',
        endpoint: '/api/prices',
        pricePerCall: 0.0001,
        totalCalls: 3420,
      },
    ];

    res.json({ apis });
  } catch (error) {
    console.error('Marketplace error:', error);
    res.status(500).json({ error: 'Failed to fetch APIs' });
  }
});

module.exports = router;

