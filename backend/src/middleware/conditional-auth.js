/**
 * Conditional Auth Middleware
 * Switches between auth bypass and real authentication based on ENABLE_AUTH_BYPASS flag
 */

const authMiddleware = require('./auth');
const authBypass = require('./auth-bypass');

/**
 * Conditional auth middleware that checks ENABLE_AUTH_BYPASS flag
 * - If ENABLE_AUTH_BYPASS=true: Uses auth bypass (no token required)
 * - If ENABLE_AUTH_BYPASS=false: Uses real JWT authentication
 */
const conditionalAuth = (req, res, next) => {
  const enableAuthBypass = process.env.ENABLE_AUTH_BYPASS === 'true';

  if (enableAuthBypass) {
    console.log('⚠️ AUTH BYPASS ENABLED - Using debug mode');
    return authBypass(req, res, next);
  } else {
    console.log('🔐 REAL AUTH ENABLED - Validating JWT token');
    return authMiddleware(req, res, next);
  }
};

module.exports = conditionalAuth;
