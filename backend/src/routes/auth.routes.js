const express = require('express');
const router = express.Router();
const WorldIDService = require('../services/WorldIDService');
const jwt = require('jsonwebtoken');

// Verify World ID proof
router.post('/verify', async (req, res) => {
  try {
    const { proof, nullifier, signal } = req.body;

    if (!proof || !nullifier) {
      return res.status(400).json({ error: 'Missing proof or nullifier' });
    }

    // Verify proof with World ID service
    const isValid = await WorldIDService.verifyProof(proof, signal, nullifier);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid World ID proof' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { nullifier, verified: true },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      nullifier,
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;

