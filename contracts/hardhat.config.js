require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // World Chain Sepolia Testnet
    worldchain_sepolia: {
      url: process.env.WORLD_CHAIN_RPC_URL || "https://sepolia.worldchain.tech",
      accounts: process.env.BACKEND_PRIVATE_KEY ? [process.env.BACKEND_PRIVATE_KEY] : [],
      chainId: 4801,
    },
    // World Chain Mainnet (for production)
    worldchain_mainnet: {
      url: "https://worldchain.tech",
      accounts: process.env.BACKEND_PRIVATE_KEY ? [process.env.BACKEND_PRIVATE_KEY] : [],
      chainId: 480,
    },
    // Hardhat local network
    hardhat: {
      chainId: 1337,
    },
  },
  etherscan: {
    apiKey: {
      worldchain_sepolia: process.env.BLOCKSCOUT_API_KEY || "",
    },
    customChains: [
      {
        network: "worldchain_sepolia",
        chainId: 4801,
        urls: {
          apiURL: "https://sepolia.worldchain.blockscout.com/api",
          browserURL: "https://sepolia.worldchain.blockscout.com",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

