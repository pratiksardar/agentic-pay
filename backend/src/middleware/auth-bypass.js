/**
 * Auth Bypass Middleware - Temporarily disables authentication
 * Use this for debugging API fetch issues
 */

const authBypass = (req, res, next) => {
  // Create a mock user object for routes that need it
  req.user = {
    id: 'debug-user',
    nullifier: 'debug-nullifier-1234567890abcdef',
  };
  
  console.log('⚠️ AUTH BYPASS ENABLED - No authentication required');
  next();
};

module.exports = authBypass;

