/**
 * CDP Wallet Service - Coinbase Developer Platform Wallet Integration
 * Based on: https://docs.cdp.coinbase.com/x402/core-concepts/wallet
 */

const { CdpClient } = require('@coinbase/cdp-sdk');
const { toAccount } = require('viem/accounts');

class CDPWalletService {
  constructor() {
    this.cdp = null;
    this.wallets = new Map(); // nullifier => wallet account
    this.initialized = false;
  }

  /**
   * Initialize CDP client
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // CDP credentials from environment
      const apiKeyId = process.env.CDP_API_KEY_ID;
      const apiKeySecret = process.env.CDP_API_KEY_SECRET;
      const walletSecret = process.env.CDP_WALLET_SECRET;

      if (!apiKeyId || !apiKeySecret) {
        console.warn('⚠️ CDP credentials not configured. Using mock wallets.');
        this.initialized = true;
        return;
      }

      // Initialize CDP client
      this.cdp = new CdpClient({
        apiKeyName: apiKeyId,
        privateKey: apiKeySecret,
      });

      this.initialized = true;
      console.log('✅ CDP Wallet Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize CDP:', error);
      // Continue with mock wallets
      this.initialized = true;
    }
  }

  /**
   * Get or create wallet for user
   * @param {string} nullifier - World ID nullifier hash
   * @returns {Promise<Object>} Wallet account
   */
  async getOrCreateWallet(nullifier) {
    await this.initialize();

    // Check if wallet already exists
    if (this.wallets.has(nullifier)) {
      return this.wallets.get(nullifier);
    }

    try {
      if (this.cdp) {
        // Create wallet using CDP
        const cdpAccount = await this.cdp.evm.createAccount();
        const account = toAccount(cdpAccount);
        
        this.wallets.set(nullifier, account);
        console.log(`✅ Created CDP wallet for nullifier ${nullifier.slice(0, 8)}...`);
        
        return account;
      } else {
        // Mock wallet for testing
        const { ethers } = require('ethers');
        const wallet = ethers.Wallet.createRandom();
        const account = {
          address: wallet.address,
          privateKey: wallet.privateKey,
          type: 'mock',
        };
        
        this.wallets.set(nullifier, account);
        console.log(`✅ Created mock wallet for nullifier ${nullifier.slice(0, 8)}...`);
        
        return account;
      }
    } catch (error) {
      console.error('❌ Failed to create wallet:', error);
      throw error;
    }
  }

  /**
   * Get wallet address for user
   * @param {string} nullifier - World ID nullifier hash
   * @returns {Promise<string>} Wallet address
   */
  async getWalletAddress(nullifier) {
    const account = await this.getOrCreateWallet(nullifier);
    return account.address;
  }

  /**
   * Get wallet account for X402 payments
   * @param {string} nullifier - World ID nullifier hash
   * @returns {Promise<Object>} Wallet account (compatible with viem)
   */
  async getWalletAccount(nullifier) {
    return await this.getOrCreateWallet(nullifier);
  }
}

module.exports = new CDPWalletService();

