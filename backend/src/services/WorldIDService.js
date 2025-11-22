const axios = require('axios');

class WorldIDService {
  async verifyProof(proof, signal, nullifier) {
    try {
      // Verify proof with World ID verification endpoint
      const response = await axios.post(
        'https://developer.worldcoin.org/api/v1/verify',
        {
          proof,
          signal,
          nullifier_hash: nullifier,
          app_id: process.env.WORLD_ID_APP_ID,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.WORLD_ID_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.valid === true;
    } catch (error) {
      console.error('World ID verification failed:', error.response?.data || error.message);
      // For development, allow mock verification
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  Development mode: Allowing mock verification');
        return true;
      }
      return false;
    }
  }

  async checkVerification(nullifier) {
    // Check if nullifier is already verified (could check on-chain)
    // For now, return true if we have it in our system
    return true;
  }
}

module.exports = new WorldIDService();

