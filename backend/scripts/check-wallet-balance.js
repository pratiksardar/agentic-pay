/**
 * Check wallet balance on Sepolia
 * Run: node scripts/check-wallet-balance.js
 */

require('dotenv').config();
const { ethers } = require('ethers');

async function checkBalance() {
  const privateKey = process.env.BACKEND_PRIVATE_KEY;
  const rpcUrl = process.env.WORLD_CHAIN_RPC_URL || 'https://sepolia.worldchain.tech';
  
  if (!privateKey || privateKey === '0x...') {
    console.error('❌ BACKEND_PRIVATE_KEY not set in .env file');
    process.exit(1);
  }

  try {
    // Create provider for Sepolia (using public RPC)
    // You can also use: https://rpc.sepolia.org (public endpoint)
    const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.org');
    
    // Create wallet
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('📊 Checking wallet balance...\n');
    console.log('Address:', wallet.address);
    console.log('Network: Sepolia Testnet\n');
    
    // Check ETH balance
    const ethBalance = await provider.getBalance(wallet.address);
    const ethBalanceFormatted = ethers.formatEther(ethBalance);
    
    console.log('💰 ETH Balance:', ethBalanceFormatted, 'ETH');
    
    if (parseFloat(ethBalanceFormatted) < 0.01) {
      console.log('\n⚠️  Low balance! You need ETH for gas fees.');
      console.log('🔗 Get Sepolia ETH from:');
      console.log('   https://www.alchemy.com/faucets/ethereum-sepolia');
    } else {
      console.log('✅ Sufficient ETH for gas fees');
    }
    
    // Check USDC balance (Sepolia USDC contract)
    const usdcAddress = '0x1c7D4B196Cb0E7B01F4910d4a4b0b0b0b0b0b0b0'; // Placeholder - need real Sepolia USDC address
    console.log('\n💵 USDC Balance: Check manually on Sepolia explorer');
    console.log('   For testing, you can use mock balances in MicroPaymentEngine');
    
    console.log('\n🔗 View on Explorer:');
    console.log(`   https://sepolia.etherscan.io/address/${wallet.address}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('network')) {
      console.log('\n💡 Make sure you have internet connection and RPC URL is correct');
    }
    process.exit(1);
  }
}

checkBalance();

