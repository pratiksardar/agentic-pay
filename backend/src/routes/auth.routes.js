const express = require('express');
const router = express.Router();
const WorldIDService = require('../services/WorldIDService');
const jwt = require('jsonwebtoken');

// Verify World ID proof
router.post('/verify', async (req, res) => {
  try {
    console.log('📥 Received verification request:', {
      hasProof: !!req.body.proof,
      hasNullifier: !!req.body.nullifier,
      nullifier: req.body.nullifier,
      signal: req.body.signal,
      proofType: typeof req.body.proof,
      proofKeys: req.body.proof && typeof req.body.proof === 'object' ? Object.keys(req.body.proof) : 'N/A',
    });

    const { proof, nullifier, signal } = req.body;

    if (!proof || !nullifier) {
      console.error('❌ Missing required fields:', { hasProof: !!proof, hasNullifier: !!nullifier });
      return res.status(400).json({ 
        error: 'Missing proof or nullifier',
        details: { hasProof: !!proof, hasNullifier: !!nullifier }
      });
    }

    // Verify proof with World ID service
    console.log('🔍 Verifying proof with World ID service...');
    const isValid = await WorldIDService.verifyProof(proof, signal, nullifier);

    console.log('📊 Verification result:', isValid);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid World ID proof' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { nullifier, verified: true },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('✅ Verification successful, token generated');
    res.json({
      success: true,
      token,
      nullifier,
    });
  } catch (error) {
    console.error('❌ Auth verification error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Verification failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

