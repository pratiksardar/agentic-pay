const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow iframe embedding for mini app
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin requests
}));
// CORS configuration - must be before routes
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin (mobile app/curl)');
      return callback(null, true);
    }
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      // Explicit zrok URLs (add your specific URLs here for extra safety)
      'https://nisr9fn986u1.share.zrok.io', // Frontend zrok URL (where users access the app)
      'https://hqh7qhvkk6zv.share.zrok.io', // Backend zrok URL (also allow for direct access)
      // Allow zrok/ngrok tunnels (regex patterns for any subdomain)
      /^https?:\/\/.*\.share\.zrok\.io$/,
      /^https?:\/\/.*\.ngrok\.io$/,
      /^https?:\/\/.*\.ngrok-free\.app$/,
      // Allow Vercel deployments (production, preview, and branch deployments)
      /^https?:\/\/.*\.vercel\.app$/,
      /^https?:\/\/.*\.vercel\.dev$/,
    ];
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      console.log(`✅ CORS: Allowing origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS: Unknown origin (but allowing): ${origin}`);
      // Allow for now, but log warning
      // In production, you might want to block unknown origins
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  preflightContinue: false, // Let cors handle preflight
  optionsSuccessStatus: 200, // Some legacy browsers (IE11) choke on 204
}));

// CORS middleware already handles OPTIONS automatically, no need for explicit handler
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/marketplace', require('./routes/marketplace.routes'));
app.use('/api/call-api', require('./routes/payment.routes'));
app.use('/api/agents', require('./routes/agent.routes'));
app.use('/api/wallet', require('./routes/wallet.routes'));
app.use('/api/transactions', require('./routes/transactions.routes'));

// Test Routes (Phase 1 verification)
if (process.env.NODE_ENV === 'development') {
  app.use('/api/test', require('./routes/test.routes'));
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 HumanPay backend running on port ${PORT}`);
});

