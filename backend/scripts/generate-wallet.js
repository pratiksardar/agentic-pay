/**
 * Generate a new wallet for testing
 * Run: node scripts/generate-wallet.js
 */

const { ethers } = require('ethers');

function generateWallet() {
  const wallet = ethers.Wallet.createRandom();
  
  console.log('🔐 New Wallet Generated:\n');
  console.log('Address:', wallet.address);
  console.log('Private Key:', wallet.privateKey);
  console.log('\n📝 Add to your .env file:');
  console.log(`BACKEND_PRIVATE_KEY=${wallet.privateKey}`);
  console.log('\n⚠️  Keep this private key secure!');
  console.log('   This is for testing only - never use in production!');
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

generateWallet();

