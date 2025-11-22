const express = require('express');
const router = express.Router();
const WorldIDService = require('../services/WorldIDService');
const VerifiedUsersService = require('../services/VerifiedUsersService');
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

    // Record verification in our system
    await VerifiedUsersService.recordVerification(nullifier, 'verify', signal);

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

// Check if user is already verified
router.post('/check-verification', async (req, res) => {
  try {
    const { nullifier } = req.body;

    if (!nullifier) {
      return res.status(400).json({ error: 'Nullifier required' });
    }

    const isVerified = await VerifiedUsersService.isVerified(nullifier);
    
    if (isVerified) {
      // Update last seen timestamp
      await VerifiedUsersService.updateLastSeen(nullifier);
    }

    res.json({
      verified: isVerified,
      nullifier: nullifier.slice(0, 8) + '...',
    });
  } catch (error) {
    console.error('❌ Check verification error:', error);
    res.status(500).json({ 
      error: 'Failed to check verification',
      message: error.message,
    });
  }
});

// Record verification (called from frontend after successful verification)
router.post('/record-verification', async (req, res) => {
  try {
    const { nullifier, action, signal } = req.body;

    if (!nullifier) {
      return res.status(400).json({ error: 'Nullifier required' });
    }

    await VerifiedUsersService.recordVerification(
      nullifier,
      action || 'unknown',
      signal || undefined
    );

    res.json({
      success: true,
      message: 'Verification recorded',
    });
  } catch (error) {
    console.error('❌ Record verification error:', error);
    res.status(500).json({ 
      error: 'Failed to record verification',
      message: error.message,
    });
  }
});

module.exports = router;

