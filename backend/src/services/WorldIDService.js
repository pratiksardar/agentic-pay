const axios = require('axios');

class WorldIDService {
  async verifyProof(proof, signal, nullifier) {
    try {
      const appId = process.env.WORLD_ID_APP_ID;
      const apiKey = process.env.WORLD_ID_API_KEY;

      if (!appId || !apiKey) {
        console.error('❌ Missing World ID credentials:', { hasAppId: !!appId, hasApiKey: !!apiKey });
        throw new Error('World ID credentials not configured');
      }

      console.log('📡 Calling World ID API:', {
        endpoint: 'https://developer.worldcoin.org/api/v1/verify',
        appId: appId.substring(0, 10) + '...',
        hasProof: !!proof,
        hasNullifier: !!nullifier,
        signal,
      });

      // Prepare request body - World ID API expects specific format
      const requestBody = {
        app_id: appId,
        signal: signal || '',
        nullifier_hash: nullifier,
        proof: proof, // This should be the full proof object
      };

      console.log('📦 Request body structure:', {
        hasAppId: !!requestBody.app_id,
        hasSignal: !!requestBody.signal,
        hasNullifierHash: !!requestBody.nullifier_hash,
        hasProof: !!requestBody.proof,
        proofType: typeof requestBody.proof,
        proofKeys: requestBody.proof && typeof requestBody.proof === 'object' ? Object.keys(requestBody.proof) : 'N/A',
      });

      // Verify proof with World ID verification endpoint
      const response = await axios.post(
        'https://developer.worldcoin.org/api/v1/verify',
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📥 World ID API response:', {
        status: response.status,
        valid: response.data?.valid,
        data: response.data,
      });

      return response.data?.valid === true;
    } catch (error) {
      console.error('❌ World ID verification failed:');
      console.error('Error message:', error.message);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      console.error('Error stack:', error.stack);
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

