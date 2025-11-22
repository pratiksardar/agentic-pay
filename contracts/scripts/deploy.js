const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying HumanPay contracts...\n");

  // Deploy IdentityAttestation first
  console.log("1. Deploying IdentityAttestation...");
  const IdentityAttestation = await hre.ethers.getContractFactory("IdentityAttestation");
  const identityAttestation = await IdentityAttestation.deploy();
  await identityAttestation.waitForDeployment();
  const identityAddress = await identityAttestation.getAddress();
  console.log("✅ IdentityAttestation deployed to:", identityAddress);

  // Deploy HumanPaymentRegistry
  console.log("\n2. Deploying HumanPaymentRegistry...");
  const HumanPaymentRegistry = await hre.ethers.getContractFactory("HumanPaymentRegistry");
  const registry = await HumanPaymentRegistry.deploy(identityAddress);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("✅ HumanPaymentRegistry deployed to:", registryAddress);

  // Grant VERIFIER_ROLE to registry so it can verify identities
  console.log("\n3. Granting VERIFIER_ROLE...");
  const VERIFIER_ROLE = await identityAttestation.VERIFIER_ROLE();
  await identityAttestation.grantRole(VERIFIER_ROLE, registryAddress);
  console.log("✅ VERIFIER_ROLE granted to registry");

  console.log("\n📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("IdentityAttestation:", identityAddress);
  console.log("HumanPaymentRegistry:", registryAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Save to .env format
  console.log("Add these to your .env file:");
  console.log(`IDENTITY_ATTESTATION_ADDRESS=${identityAddress}`);
  console.log(`HUMAN_PAYMENT_REGISTRY_ADDRESS=${registryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

