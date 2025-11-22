#!/bin/bash

# Setup wallet for Sepolia testing
# Run: bash scripts/setup-wallet.sh

echo "🔐 Setting up wallet for Sepolia testing..."
echo ""

# Check if ethers is installed
if ! node -e "require('ethers')" 2>/dev/null; then
    echo "❌ ethers not found. Installing..."
    npm install ethers
fi

# Generate wallet
echo "📝 Generating new wallet..."
WALLET_INFO=$(node scripts/generate-wallet.js)

echo ""
echo "✅ Wallet generated!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the private key above"
echo "2. Add it to backend/.env as BACKEND_PRIVATE_KEY"
echo "3. Get your wallet address: node scripts/get-wallet-address.js"
echo "4. Fund your wallet using the faucets in FUND_SEPOLIA_WALLET.md"
echo ""
echo "🔗 Quick links:"
echo "   ETH Faucet: https://www.alchemy.com/faucets/ethereum-sepolia"
echo "   USDC Faucet: https://faucet.circle.com/"

