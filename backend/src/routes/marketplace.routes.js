const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Get all available APIs
router.get('/', authMiddleware, async (req, res) => {
  try {
    // API listings - matches human-pay.md marketplace ideas
    const apis = [
      {
        id: '1',
        name: 'Weather API',
        description: 'Get current weather data for any location worldwide',
        endpoint: '/api/weather',
        pricePerCall: 0.0001,
        totalCalls: 1250,
        category: 'Data',
        icon: '🌤️',
      },
      {
        id: '2',
        name: 'News Headlines',
        description: 'Latest news headlines from multiple trusted sources',
        endpoint: '/api/news',
        pricePerCall: 0.0002,
        totalCalls: 890,
        category: 'Media',
        icon: '📰',
      },
      {
        id: '3',
        name: 'Crypto Price Data',
        description: 'Real-time cryptocurrency price data and market info',
        endpoint: '/api/prices',
        pricePerCall: 0.0001,
        totalCalls: 3420,
        category: 'Finance',
        icon: '💰',
      },
      {
        id: '4',
        name: 'ML Sentiment Analysis',
        description: 'AI-powered sentiment analysis for text content',
        endpoint: '/api/sentiment',
        pricePerCall: 0.002,
        totalCalls: 560,
        category: 'AI',
        icon: '🤖',
      },
      {
        id: '5',
        name: 'Liquidation Predictor',
        description: 'Predict liquidation events in DeFi protocols',
        endpoint: '/api/liquidation',
        pricePerCall: 0.003,
        totalCalls: 320,
        category: 'DeFi',
        icon: '⚡',
      },
      {
        id: '6',
        name: 'MEV Opportunity Detector',
        description: 'Detect arbitrage and MEV opportunities across chains',
        endpoint: '/api/mev',
        pricePerCall: 0.01,
        totalCalls: 180,
        category: 'DeFi',
        icon: '🔍',
      },
      {
        id: '7',
        name: 'Twitter Sentiment Bot',
        description: 'Analyze Twitter sentiment for any topic or hashtag',
        endpoint: '/api/twitter-sentiment',
        pricePerCall: 0.001,
        totalCalls: 2100,
        category: 'Social',
        icon: '🐦',
      },
      {
        id: '8',
        name: 'Geocoding Service',
        description: 'Convert addresses to coordinates and vice versa',
        endpoint: '/api/geocode',
        pricePerCall: 0.001,
        totalCalls: 890,
        category: 'Location',
        icon: '📍',
      },
    ];

    res.json({ apis });
  } catch (error) {
    console.error('Marketplace error:', error);
    res.status(500).json({ error: 'Failed to fetch APIs' });
  }
});

module.exports = router;

