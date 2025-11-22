# 🚀 HumanPay - Verified Human API Marketplace

**Bot-proof API marketplace where verified humans pay pennies per call via X402**

HumanPay is a World Mini App that combines World ID verification with X402 micropayments to create a bot-resistant API marketplace. Verified humans can access premium APIs for micro-prices, while bots are blocked at the gate.

## 🎯 Features

- ✅ **World ID Verification** - Zero-knowledge proof of unique personhood
- ✅ **X402 Micropayments** - Pay pennies per API call (as low as $0.0001)
- ✅ **Bot-Proof** - Only verified humans can access APIs
- ✅ **AI Agent Support** - Deploy agents with human authorization
- ✅ **World Chain Integration** - Low fees enable microtransactions
- ✅ **CDP Embedded Wallets** - Seamless payment experience

## 🏗️ Architecture

```
HumanPay/
├── frontend/          # Next.js World Mini App
│   ├── app/          # App router pages
│   ├── components/   # React components
│   └── lib/          # Utilities
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── routes/  # API routes
│   │   ├── services/ # Business logic
│   │   └── middleware/ # Auth & validation
└── contracts/        # Solidity smart contracts
    ├── contracts/    # .sol files
    ├── scripts/      # Deployment scripts
    └── test/         # Contract tests
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Git
- World ID App ID (get from [developer.worldcoin.org](https://developer.worldcoin.org))
- Coinbase CDP API keys (for X402 payments)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/humanpay.git
cd humanpay
```

2. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# Contracts
cd ../contracts
npm install
```

3. **Set up environment variables**

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_WORLD_ID_APP_ID=app_xxxxx
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WORLD_CHAIN_RPC_URL=https://sepolia.worldchain.tech
```

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_here
WORLD_ID_APP_ID=app_xxxxx
WORLD_ID_API_KEY=sk_xxxx
COINBASE_PRIVATE_KEY=your_private_key
MONGODB_URI=mongodb://localhost:27017/humanpay
REDIS_URL=redis://localhost:6379
WORLD_CHAIN_RPC_URL=https://sepolia.worldchain.tech
BACKEND_PRIVATE_KEY=0x...
```

4. **Deploy contracts**
```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network worldchain_sepolia
```

5. **Start development servers**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

6. **Open the app**
- Visit `http://localhost:3000`
- Or open in World App using the mini app URL

## 📱 World Mini App Setup

To run as a World Mini App:

1. **Configure your app** in World App Developer Console
2. **Set the mini app URL** to your deployed frontend URL
3. **Test locally** using World App's development mode
4. **Deploy** to production (Vercel recommended)

## 🧪 Testing

### Smart Contracts
```bash
cd contracts
npx hardhat test
```

### Backend API
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 📚 Documentation

- [Getting Started Guide](./getting-started.md)
- [Technical Specification](./human-pay.md)
- [Quick Start Checklist](./quick-start-checklist.md)

## 🏆 Bounty Targets

HumanPay is designed to win multiple hackathon bounties:

- **Coinbase CDP** ($20K) - X402 + CDP Embedded Wallets
- **World Chain** ($5-9K) - World ID + MiniKit integration
- **ChaosChain** ($4K) - Verifiable AI agents
- **Circle** ($10K) - USDC settlement layer

## 🔐 Security

- World ID verification prevents sybil attacks
- Smart contracts use OpenZeppelin's battle-tested libraries
- JWT tokens for API authentication
- Rate limiting on payment endpoints

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- World ID for zero-knowledge verification
- Coinbase CDP for X402 micropayment protocol
- OpenZeppelin for secure smart contract libraries

---

**Built with ❤️ for the Web3 community**

