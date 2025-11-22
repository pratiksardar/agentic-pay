/**
 * Get wallet address from private key
 * Run: node scripts/get-wallet-address.js
 */

require('dotenv').config();
const { ethers } = require('ethers');

function getWalletAddress() {
  const privateKey = process.env.BACKEND_PRIVATE_KEY;
  
  if (!privateKey || privateKey === '0x...') {
    console.error('❌ BACKEND_PRIVATE_KEY not set in .env file');
    console.log('\n📝 To generate a new wallet:');
    console.log('   npx hardhat run scripts/generate-wallet.js');
    console.log('\n   Or use: node -e "console.log(require(\'ethers\').Wallet.createRandom().address)"');
    process.exit(1);
  }

  try {
    // Remove 0x prefix if present
    const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(`0x${cleanKey}`);
    
    console.log('✅ Wallet Address:', wallet.address);
    console.log('📋 Use this address to fund your wallet:');
    console.log(`   ${wallet.address}\n`);
    console.log('🔗 Sepolia Faucets:');
    console.log('   1. Alchemy: https://www.alchemy.com/faucets/ethereum-sepolia');
    console.log('   2. Ethernity: https://www.ethernity.io/faucet');
    console.log('   3. EthJKT: https://ethjkt.com/faucet');
    console.log('\n💵 For Sepolia USDC:');
    console.log('   https://faucet.circle.com/ (Circle USDC Faucet)');
    console.log('   Or use: https://app.uniswap.org/ (Swap ETH for USDC on Sepolia)');
    
    return wallet.address;
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure BACKEND_PRIVATE_KEY is a valid hex private key');
    process.exit(1);
  }
}

getWalletAddress();

