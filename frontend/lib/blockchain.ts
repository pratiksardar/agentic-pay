import { ethers } from 'ethers';

// Get World Chain provider
export function getWorldChainProvider() {
  const rpcUrl = process.env.NEXT_PUBLIC_WORLD_CHAIN_RPC_URL || 'https://sepolia.worldchain.tech';
  return new ethers.JsonRpcProvider(rpcUrl);
}

// Get contract instance
export function getContract(address: string, abi: any[]) {
  const provider = getWorldChainProvider();
  return new ethers.Contract(address, abi, provider);
}

// Format USDC amount (6 decimals)
export function formatUSDC(amount: bigint): string {
  return ethers.formatUnits(amount, 6);
}

// Parse USDC amount (6 decimals)
export function parseUSDC(amount: string): bigint {
  return ethers.parseUnits(amount, 6);
}

