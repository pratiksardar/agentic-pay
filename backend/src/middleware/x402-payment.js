/**
 * X402 Payment Middleware
 * Based on: https://docs.cdp.coinbase.com/x402/quickstart-for-sellers
 */

const { requirePayment } = require('x402-express');
const { facilitator } = require('@coinbase/x402');
const TransactionService = require('../services/TransactionService');

/**
 * Create X402 payment middleware for an endpoint
 * @param {string} endpoint - API endpoint path
 * @param {number} price - Price in USDC (as number, will be converted to string)
 * @param {string} payToAddress - Wallet address to receive payments
 * @returns {Function} Express middleware
 */
function createX402Middleware(endpoint, price, payToAddress) {
  // Convert price to string format expected by X402
  const priceString = `$${price.toFixed(6)}`;

  return requirePayment(
    {
      path: endpoint,
      price: priceString,
      pay_to_address: payToAddress,
      network: process.env.X402_NETWORK || 'base-sepolia', // Use base-sepolia for testnet
    },
    facilitator
  );
}

/**
 * Wrapper middleware that records transactions
 */
function x402WithTransaction(endpoint, price, payToAddress) {
  const paymentMiddleware = createX402Middleware(endpoint, price, payToAddress);

  return async (req, res, next) => {
    // Get user nullifier from JWT
    const nullifier = req.user?.nullifier;

    // Call original payment middleware
    paymentMiddleware(req, res, async (err) => {
      if (err) {
        return next(err);
      }

      // If payment was successful, record transaction
      if (res.statusCode === 200 && nullifier) {
        try {
          const paymentId = res.getHeader('x-payment-id') || `pay_${Date.now()}`;
          
          await TransactionService.recordTransaction({
            nullifier,
            endpoint: req.path,
            amount: price,
            paymentId,
            status: 'completed',
            apiName: req.body?.apiName || endpoint,
          });
        } catch (error) {
          console.error('Failed to record transaction:', error);
          // Don't fail the request if transaction recording fails
        }
      }

      next();
    });
  };
}

module.exports = {
  createX402Middleware,
  x402WithTransaction,
};

