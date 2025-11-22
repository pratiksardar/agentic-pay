/**
 * X402Handler - Wrapper for MicroPaymentEngine
 * Maintains backward compatibility while using new Phase 1 implementation
 */

const MicroPaymentEngine = require('./MicroPaymentEngine');

class X402Handler {
  /**
   * Process payment using MicroPaymentEngine (Phase 1)
   * @param {Object} params - Payment parameters
   * @param {string} params.nullifier - World ID nullifier hash
   * @param {string} params.endpoint - API endpoint
   * @param {string} params.userId - User ID (optional)
   * @param {string} params.walletId - Wallet ID (optional)
   * @returns {Promise<Object>} Payment result
   */
  async processPayment({ nullifier, endpoint, userId, walletId, apiKey }) {
    try {
      // Get API price (mock - replace with database lookup)
      // Prices for free APIs from free-apis.github.io
      const apiPrices = {
        '/api/quotes': 0.0001,           // Random Quotes API
        '/api/jokes': 0.0001,           // Jokes API
        '/api/facts': 0.0001,           // Random Facts API
        '/api/dog-facts': 0.0001,       // Dog Facts API
        '/api/cat-facts': 0.0001,       // Cat Facts API
        '/api/bored': 0.0001,           // Bored API
        '/api/ip-geo': 0.0002,          // IP Geolocation API
        '/api/weather': 0.0001,         // Weather API
        // Legacy APIs (keep for backward compatibility)
        '/api/news': 0.0002,
        '/api/prices': 0.0001,
        '/api/sentiment': 0.0005,
        '/api/image-recognition': 0.0010,
        '/api/translate': 0.0003,
        '/api/liquidation': 0.003,
        '/api/mev': 0.01,
        '/api/twitter-sentiment': 0.001,
        '/api/geocode': 0.001,
      };

      const price = apiPrices[endpoint] || 0.0001;

      // Step 1: Process X402 payment FIRST (deduct amount before calling API)
      // This ensures payment is collected before making the external API call
      console.log(`💳 Step 1: Processing payment of $${price} for ${endpoint}...`);
      const paymentResult = await MicroPaymentEngine.processX402Payment(
        {
          nullifier,
          endpoint,
          walletId,
        },
        price
      );

      // If payment failed (402), return early - DO NOT call external API
      if (paymentResult.status === 402) {
        console.log(`❌ Payment failed for ${endpoint}, not calling external API`);
        return {
          status: 402,
          message: paymentResult.message,
          price: paymentResult.required || price,
          currency: 'USDC',
          error: paymentResult.error,
        };
      }

      // Step 2: Payment successful - NOW call the external API through our backend
      // The external API call goes through our application and we forward the response
      console.log(`✅ Payment successful! Step 2: Calling external API for ${endpoint}...`);
      const apiResult = await this.callAPI(endpoint, apiKey);
      console.log(`📤 Step 3: Forwarding API response to user for ${endpoint}`);

      // Record transaction
      const TransactionService = require('./TransactionService');
      await TransactionService.recordTransaction({
        nullifier,
        endpoint,
        amount: paymentResult.price,
        paymentId: paymentResult.paymentId,
        status: 'completed',
        apiName: endpoint,
      });

      return {
        status: 200,
        paymentId: paymentResult.paymentId,
        newBalance: paymentResult.remainingBalance,
        apiResult,
        price: paymentResult.price,
      };
    } catch (error) {
      console.error('X402 payment error:', error);
      throw error;
    }
  }

  /**
   * Call actual API (real APIs from free-apis.github.io)
   * @param {string} endpoint - API endpoint
   * @param {string} apiKey - User's API key (optional)
   * @returns {Promise<Object>} API result
   */
  async callAPI(endpoint, apiKey) {
    // Call external free API through our backend
    // This ensures all API calls go through our application
    const RealAPIService = require('./RealAPIService');
    try {
      console.log(`🌐 Calling external API: ${endpoint} (via our backend proxy)`);
      const result = await RealAPIService.callAPI(endpoint, apiKey);
      console.log(`✅ External API call successful, forwarding response to user`);
      return result;
    } catch (error) {
      console.warn(`⚠️ External API call failed for ${endpoint}, using fallback:`, error.message);
      // Fallback to mock data if external API fails
    }

    // Fallback mock API results
    const mockResults = {
      '/api/weather': {
        location: 'San Francisco, CA',
        temperature: 72,
        condition: 'Sunny',
        humidity: 65,
        windSpeed: 8,
        timestamp: new Date().toISOString(),
      },
      '/api/news': {
        headlines: [
          'Tech Innovation Reaches New Heights',
          'Crypto Market Shows Strong Recovery',
          'AI Development Accelerates',
        ],
        source: 'HumanPay News',
        timestamp: new Date().toISOString(),
      },
      '/api/prices': {
        btc: 43250.50,
        eth: 2650.30,
        usdc: 1.00,
        timestamp: new Date().toISOString(),
      },
      '/api/sentiment': {
        text: 'Sample text analysis',
        sentiment: 'positive',
        confidence: 0.87,
        score: 0.75,
        timestamp: new Date().toISOString(),
      },
      '/api/image-recognition': {
        image: 'url_to_image',
        objects: ['cat', 'tree', 'sky'],
        confidence: 0.92,
        timestamp: new Date().toISOString(),
      },
      '/api/translate': {
        original: 'Hello',
        translated: 'Hola',
        language: 'Spanish',
        timestamp: new Date().toISOString(),
      },
      '/api/liquidation': {
        protocol: 'Aave',
        riskLevel: 'low',
        estimatedLiquidationPrice: 42000,
        currentPrice: 43250,
        timestamp: new Date().toISOString(),
      },
      '/api/mev': {
        opportunity: 'arbitrage',
        profit: 0.15,
        chain: 'Ethereum',
        status: 'available',
        timestamp: new Date().toISOString(),
      },
      '/api/twitter-sentiment': {
        hashtag: '#crypto',
        sentiment: 'bullish',
        mentions: 1250,
        score: 0.68,
        timestamp: new Date().toISOString(),
      },
      '/api/geocode': {
        address: '1600 Amphitheatre Parkway, Mountain View, CA',
        lat: 37.4224764,
        lng: -122.0842499,
        formatted: 'Googleplex',
        timestamp: new Date().toISOString(),
      },
    };

    return mockResults[endpoint] || {
      data: `Mock result for ${endpoint}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Top up balance (for testing)
   * @param {string} nullifier - World ID nullifier
   * @param {number} amount - Amount to add
   * @returns {Promise<number>} New balance
   */
  async topUpBalance(nullifier, amount) {
    const walletId = await MicroPaymentEngine.getOrCreateWallet(nullifier);
    return await MicroPaymentEngine.topUpBalance(walletId, amount);
  }
}

module.exports = new X402Handler();

