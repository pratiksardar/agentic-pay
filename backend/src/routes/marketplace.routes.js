const express = require('express');
const router = express.Router();
// const authMiddleware = require('../middleware/auth'); // Temporarily disabled
const authBypass = require('../middleware/auth-bypass'); // Using bypass for debugging

// Get all available APIs
router.get('/', authBypass, async (req, res) => {
  try {
    // API listings - Real APIs from free-apis.github.io
    const apis = [
      {
        id: '1',
        name: 'Random Quotes API',
        description: 'Get inspirational quotes, programming quotes, and more. Perfect for apps needing motivational content.',
        endpoint: '/api/quotes',
        pricePerCall: 0.0001,
        totalCalls: 3420,
        category: 'Entertainment',
        icon: '💬',
        baseUrl: 'https://api.quotable.io',
        documentation: 'https://github.com/lukePeavey/quotable',
      },
      {
        id: '2',
        name: 'Jokes API',
        description: 'Get random jokes, programming jokes, and puns. Great for adding humor to your applications.',
        endpoint: '/api/jokes',
        pricePerCall: 0.0001,
        totalCalls: 2890,
        category: 'Entertainment',
        icon: '😄',
        baseUrl: 'https://official-joke-api.appspot.com',
        documentation: 'https://github.com/15Dkatz/official_joke_api',
      },
      {
        id: '3',
        name: 'Random Facts API',
        description: 'Get interesting random facts about numbers, dates, and trivia. Perfect for educational apps.',
        endpoint: '/api/facts',
        pricePerCall: 0.0001,
        totalCalls: 1560,
        category: 'Education',
        icon: '📚',
        baseUrl: 'https://uselessfacts.jsph.pl',
        documentation: 'https://github.com/15Dkatz/official_joke_api',
      },
      {
        id: '4',
        name: 'Dog Facts API',
        description: 'Get random facts about dogs. Great for pet-related applications and educational content.',
        endpoint: '/api/dog-facts',
        pricePerCall: 0.0001,
        totalCalls: 980,
        category: 'Pets',
        icon: '🐕',
        baseUrl: 'https://dog-api.kinduff.com',
        documentation: 'https://kinduff.com/dog-api',
      },
      {
        id: '5',
        name: 'Cat Facts API',
        description: 'Get random facts about cats. Perfect for cat lovers and pet applications.',
        endpoint: '/api/cat-facts',
        pricePerCall: 0.0001,
        totalCalls: 1120,
        category: 'Pets',
        icon: '🐱',
        baseUrl: 'https://catfact.ninja',
        documentation: 'https://catfact.ninja/',
      },
      {
        id: '6',
        name: 'Bored API',
        description: 'Get activity suggestions when you\'re bored. Great for recommendation systems.',
        endpoint: '/api/bored',
        pricePerCall: 0.0001,
        totalCalls: 2340,
        category: 'Lifestyle',
        icon: '🎯',
        baseUrl: 'https://www.boredapi.com',
        documentation: 'https://www.boredapi.com/',
      },
      {
        id: '7',
        name: 'IP Geolocation API',
        description: 'Get geolocation data from IP addresses. Useful for location-based features.',
        endpoint: '/api/ip-geo',
        pricePerCall: 0.0002,
        totalCalls: 1890,
        category: 'Location',
        icon: '🌍',
        baseUrl: 'https://ipapi.co',
        documentation: 'https://ipapi.co/documentation',
      },
      {
        id: '8',
        name: 'Weather API',
        description: 'Get current weather data for any location worldwide',
        endpoint: '/api/weather',
        pricePerCall: 0.0001,
        totalCalls: 1250,
        category: 'Data',
        icon: '🌤️',
        baseUrl: 'https://api.openweathermap.org',
        documentation: 'https://openweathermap.org/api',
      },
    ];

    res.json({ apis });
  } catch (error) {
    console.error('Marketplace error:', error);
    res.status(500).json({ error: 'Failed to fetch APIs' });
  }
});

module.exports = router;

