# IdentityVault: Quick Start Checklist & Git Setup

## 🚀 START HERE: Friday 8 PM Setup (30 Minutes)

### Step 1: Clone & Initialize Project

```bash
# Create project directory
mkdir IdentityVault && cd IdentityVault
git init

# Initialize monorepo structure
mkdir contracts backend frontend
cd contracts && npm init -y

# Smart contracts setup
npm install --save-dev hardhat @openzeppelin/contracts ethers
npx hardhat init

# Select: Create an empty hardhat.config.js
```

### Step 2: Configure Hardhat for World Chain

```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    // World Chain Sepolia Testnet
    worldchain_sepolia: {
      url: process.env.WORLD_CHAIN_RPC_URL || "https://sepolia.worldchain.tech",
      accounts: [process.env.BACKEND_PRIVATE_KEY || ""],
      chainId: 4801
    },
    // World Chain Mainnet (for production)
    worldchain_mainnet: {
      url: "https://worldchain.tech",
      accounts: [process.env.BACKEND_PRIVATE_KEY || ""],
      chainId: 480
    }
  },
  etherscan: {
    apiKey: {
      worldchain_sepolia: process.env.BLOCKSCOUT_API_KEY || ""
    },
    customChains: [
      {
        network: "worldchain_sepolia",
        chainId: 4801,
        urls: {
          apiURL: "https://sepolia.worldchain.blockscout.com/api",
          browserURL: "https://sepolia.worldchain.blockscout.com"
        }
      }
    ]
  }
};
```

### Step 3: Create .env File

```bash
# Create .env in root directory
cat > ../.env << 'EOF'
# World Chain
WORLD_CHAIN_RPC_URL=https://sepolia.worldchain.tech
BACKEND_PRIVATE_KEY=0x... # Generate: npx hardhat run scripts/generate-wallet.js
BLOCKSCOUT_API_KEY=your_blockscout_api_key

# World ID
WORLD_ID_APP_ID=app_xxxxx
WORLD_ID_API_KEY=sk_xxxx
NEXT_PUBLIC_WORLD_ID_APP_ID=app_xxxxx

# Backend
MONGODB_URI=mongodb://localhost:27017/identity-vault
REDIS_URL=redis://localhost:6379
JWT_SECRET=$(openssl rand -base64 32)
PORT=5000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RPC_URL=https://sepolia.worldchain.tech
EOF
```

### Step 4: Get Test Tokens & Funding

```bash
# Get ETH from World Chain Sepolia faucet
# Visit: https://faucet.worldchain.tech

# Check balance
npx hardhat run scripts/check-balance.js --network worldchain_sepolia
```

---

## 📋 FRIDAY PHASE: Smart Contracts (6 Hours)

### Milestone 1: Deploy IdentityAttestation (1.5 Hours)

```bash
# 1. Create contract file
touch contracts/IdentityAttestation.sol

# 2. Copy code from PDF Part 2.2
# 3. Compile
npx hardhat compile

# 4. Write deployment script
cat > scripts/deploy-identity.js << 'EOF'
const hre = require("hardhat");

async function main() {
    const IdentityAttestation = await hre.ethers.getContractFactory("IdentityAttestation");
    const contract = await IdentityAttestation.deploy();
    await contract.waitForDeployment();
    
    const address = await contract.getAddress();
    console.log("IdentityAttestation deployed to:", address);
    
    // Save to .env
    console.log(`IDENTITY_ATTESTATION_ADDRESS=${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
EOF

# 5. Deploy
npx hardhat run scripts/deploy-identity.js --network worldchain_sepolia
```

### Milestone 2: Deploy RewardPool (1.5 Hours)

```bash
# 1. Create contract file
touch contracts/RewardPool.sol

# 2. Copy code from PDF Part 2.3
# 3. Compile
npx hardhat compile

# 4. Write deployment script
cat > scripts/deploy-reward-pool.js << 'EOF'
const hre = require("hardhat");
const dotenv = require("dotenv");
dotenv.config();

async function main() {
    const identityAddress = process.env.IDENTITY_ATTESTATION_ADDRESS;
    // Use USDC on World Chain: 0x... (check testnet faucet)
    const usdcAddress = "0x..."; // Find this in World Chain docs
    
    const RewardPool = await hre.ethers.getContractFactory("RewardPool");
    const contract = await RewardPool.deploy(identityAddress, usdcAddress);
    await contract.waitForDeployment();
    
    const address = await contract.getAddress();
    console.log("RewardPool deployed to:", address);
    console.log(`REWARD_POOL_ADDRESS=${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
EOF

# 5. Deploy
npx hardhat run scripts/deploy-reward-pool.js --network worldchain_sepolia
```

### Milestone 3: Write & Run Tests (1.5 Hours)

```bash
# 1. Create test directory
mkdir test

# 2. Create test files
cat > test/IdentityAttestation.test.js << 'EOF'
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IdentityAttestation", function () {
    let identityAttestation, owner, verifier;

    beforeEach(async function () {
        [owner, verifier] = await ethers.getSigners();
        const IdentityAttestation = await ethers.getContractFactory("IdentityAttestation");
        identityAttestation = await IdentityAttestation.deploy();
        
        const VERIFIER_ROLE = await identityAttestation.VERIFIER_ROLE();
        await identityAttestation.grantRole(VERIFIER_ROLE, verifier.address);
    });

    it("Should record verification", async function () {
        const nullifier = ethers.id("test-1");
        await identityAttestation.connect(verifier).recordVerification(nullifier);
        expect(await identityAttestation.isVerified(nullifier)).to.be.true;
    });

    it("Should prevent double verification", async function () {
        const nullifier = ethers.id("test-1");
        await identityAttestation.connect(verifier).recordVerification(nullifier);
        
        await expect(
            identityAttestation.connect(verifier).recordVerification(nullifier)
        ).to.be.revertedWith("Already verified");
    });
});
EOF

# 3. Run tests
npx hardhat test

# Expected output: 2 passing (in a few seconds)
```

### Milestone 4: Verify on Blockscout (1 Hour)

```bash
# 1. Get verification arguments
cat > scripts/verify-contracts.js << 'EOF'
const hre = require("hardhat");

async function main() {
    const identityAddress = process.env.IDENTITY_ATTESTATION_ADDRESS;
    const rewardPoolAddress = process.env.REWARD_POOL_ADDRESS;
    
    // Verify IdentityAttestation (no constructor args)
    await hre.run("verify:verify", {
        address: identityAddress,
        constructorArguments: []
    });
    
    console.log("✓ IdentityAttestation verified");
}

main().catch(console.error);
EOF

npx hardhat run scripts/verify-contracts.js --network worldchain_sepolia

# 2. Manual verification on Blockscout
# Visit: https://sepolia.worldchain.blockscout.com
# Paste contract address
# Click "Verify & Publish"
# Copy contract code from Solidity file
# Compiler version: 0.8.20
# Optimization: Enabled
```

---

## 🔧 SATURDAY MORNING: Backend Setup (6 Hours)

### Step 1: Initialize Backend

```bash
cd backend
npm init -y

npm install \
  express \
  dotenv \
  ethers \
  jsonwebtoken \
  mongoose \
  redis \
  axios \
  cors \
  helmet \
  express-validator

npm install --save-dev nodemon
```

### Step 2: Create App Structure

```bash
mkdir -p src/{config,services,routes,controllers,middleware,models,utils}

cat > src/app.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
EOF

cat > package.json scripts add:
"scripts": {
  "start": "node src/app.js",
  "dev": "nodemon src/app.js"
}
```

### Step 3: World ID Verification Service

```bash
cat > src/services/WorldIDService.js << 'EOF'
const axios = require('axios');

class WorldIDService {
    async verifyProof(proof, signal, signalHash) {
        try {
            // Verify proof with World's verification endpoint
            const response = await axios.post(
                'https://api.world.org/verify',
                {
                    proof,
                    signal,
                    signalHash,
                    app_id: process.env.WORLD_ID_APP_ID
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.WORLD_ID_API_KEY}`
                    }
                }
            );
            
            return response.data.valid;
        } catch (error) {
            console.error('World ID verification failed:', error);
            return false;
        }
    }
}

module.exports = new WorldIDService();
EOF
```

### Step 4: Auth Routes

```bash
cat > src/routes/auth.routes.js << 'EOF'
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

router.post('/verify-proof', AuthController.verifyProof);
router.post('/verify-session', AuthController.verifySession);

module.exports = router;
EOF
```

### Step 5: Start Backend

```bash
npm run dev

# Should output: "Server running on port 5000"
```

---

## 🎨 SATURDAY AFTERNOON: Frontend Setup (4 Hours)

### Step 1: Create Next.js App

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint

# Choose defaults (or customize as needed)
```

### Step 2: Install Dependencies

```bash
npm install \
  @worldcoin/minikit-js \
  ethers \
  axios \
  zustand
```

### Step 3: Create Pages & Components

```bash
# Verify page
cat > app/auth/page.tsx << 'EOF'
'use client';
import { WorldIDVerifier } from '@/components/WorldIDVerifier';

export default function AuthPage() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <WorldIDVerifier />
        </div>
    );
}
EOF

# Dashboard page
cat > app/dashboard/page.tsx << 'EOF'
'use client';
import { Dashboard } from '@/components/Dashboard';

export default function DashboardPage() {
    return <Dashboard />;
}
EOF
```

### Step 4: Start Frontend

```bash
npm run dev

# Visit: http://localhost:3000
```

---

## 🎯 KEY GIT WORKFLOW

```bash
# Initialize Git
cd ..  # Go to project root
git init
git add .
git commit -m "Initial commit: IdentityVault structure"

# Create GitHub repo:
# 1. Visit https://github.com/new
# 2. Name: IdentityVault
# 3. Public (for judging)
# 4. Add MIT license

# Connect to GitHub
git remote add origin https://github.com/YOUR_USERNAME/IdentityVault.git
git branch -M main
git push -u origin main

# Regular commits (do this throughout hackathon)
git add .
git commit -m "feat: implement IdentityAttestation contract"
git push
```

---

## 📝 README.md Template

```markdown
# IdentityVault

Privacy-preserving mini-app for identity-gated rewards on World Chain.

## Features

- 🔐 World ID verification (zero-knowledge)
- 🎁 Community-based reward distribution
- 🔗 On-chain attestation
- 📱 MiniKit SDK integration
- 🛡️ Sybil-resistant

## Quick Start

### Prerequisites
- Node.js 18+
- Git
- MetaMask with World Chain configured

### Installation

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/IdentityVault.git
cd IdentityVault

# Install dependencies
cd contracts && npm install
cd ../backend && npm install
cd ../frontend && npm install

# Setup environment
cp .env.example .env
# Fill in values
```

### Development

```bash
# Terminal 1: Contracts
cd contracts
npx hardhat compile
npx hardhat test

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm run dev
```

### Deployment

```bash
# Deploy contracts
npx hardhat run scripts/deploy-identity.js --network worldchain_sepolia

# Deploy backend (Railway)
# Deploy frontend (Vercel)
```

## Contracts

- **IdentityAttestation**: 0x...
- **RewardPool**: 0x...

## Architecture

See ARCHITECTURE.md for detailed diagrams.

## Testing

```bash
cd contracts
npx hardhat test  # 85%+ coverage
```

## License

MIT
```

---

## ⏰ TIMING REFERENCE

```
FRI 8:00 PM  → Clone repo + Setup (.5h)
FRI 8:30 PM  → IdentityAttestation.sol (1h)
FRI 9:30 PM  → RewardPool.sol (1h)
FRI 10:30 PM → Tests + Deploy (1.5h)
FRI 12:00 AM → Backend boilerplate (1h)
FRI 1:00 AM  → Sleep (6h)

SAT 8:00 AM  → Auth Service (1h)
SAT 9:00 AM  → Blockchain Service (1h)
SAT 10:00 AM → API Routes (1h)
SAT 11:00 AM → Frontend Setup (1h)
SAT 12:00 PM → World ID Integration (1h)
SAT 1:00 PM  → Dashboard Component (1h)
SAT 2:00 PM  → Break + Lunch (1h)

SAT 3:00 PM  → Claim Rewards (1h)
SAT 4:00 PM  → Community Management (1h)
SAT 5:00 PM  → End-to-end Testing (1h)
SAT 6:00 PM  → Error Handling + UX (1h)
SAT 7:00 PM  → Documentation (1h)
SAT 8:00 PM  → Final Testing (1h)

SAT 9:00 PM  → Demo Video (0.5h)
SAT 9:30 PM  → Submission (0.5h)
SAT 10:00 PM → Submit! 🎉
```

---

## 🔑 CRITICAL SUCCESS FACTORS

1. **Deploy early, test often**
   - Test contracts Friday night
   - Know deployment takes 2-3 min

2. **Use faucets aggressively**
   - Request testnet ETH Friday 8 PM
   - Get backup wallet funded

3. **Git commit every milestone**
   - "feat: deploy IdentityAttestation"
   - "fix: World ID verification"
   - "test: add claim rewards tests"

4. **Test on testnet, not just local**
   - Your demo must use DEPLOYED contracts
   - Judges will verify on Blockscout

5. **Record demo by 9 PM Saturday**
   - Don't wait until last minute
   - Gives time to fix issues

6. **Documentation > Polish**
   - Clear README > fancy UI
   - Video explanation > perfect code

---

## 📞 SUPPORT RESOURCES

- **World Chain Docs:** https://docs.world.org
- **Hardhat Docs:** https://hardhat.org/docs
- **Ethers.js Docs:** https://docs.ethers.org
- **World's Discord:** https://discord.gg/worldcoin

Good luck! 🚀 Remember: shipped > perfect. Get it working, then optimize.