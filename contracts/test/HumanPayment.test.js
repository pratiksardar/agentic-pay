const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HumanPaymentRegistry", function () {
  let identityAttestation, registry, owner, verifier, user;

  beforeEach(async function () {
    [owner, verifier, user] = await ethers.getSigners();

    // Deploy IdentityAttestation
    const IdentityAttestation = await ethers.getContractFactory("IdentityAttestation");
    identityAttestation = await IdentityAttestation.deploy();

    // Deploy HumanPaymentRegistry
    const HumanPaymentRegistry = await ethers.getContractFactory("HumanPaymentRegistry");
    registry = await HumanPaymentRegistry.deploy(await identityAttestation.getAddress());

    // Grant VERIFIER_ROLE to registry
    const VERIFIER_ROLE = await identityAttestation.VERIFIER_ROLE();
    await identityAttestation.grantRole(VERIFIER_ROLE, await registry.getAddress());
  });

  describe("API Registration", function () {
    it("Should register a new API", async function () {
      const endpoint = "/api/weather";
      const pricePerCall = ethers.parseUnits("0.0001", 6); // 0.0001 USDC

      await expect(registry.connect(user).registerAPI(endpoint, pricePerCall))
        .to.emit(registry, "APIRegistered")
        .withArgs(endpoint, user.address, pricePerCall);

      const listing = await registry.getAPIListing(endpoint);
      expect(listing.provider).to.equal(user.address);
      expect(listing.pricePerCall).to.equal(pricePerCall);
      expect(listing.active).to.be.true;
    });

    it("Should prevent duplicate API registration", async function () {
      const endpoint = "/api/weather";
      const pricePerCall = ethers.parseUnits("0.0001", 6);

      await registry.connect(user).registerAPI(endpoint, pricePerCall);

      await expect(
        registry.connect(user).registerAPI(endpoint, pricePerCall)
      ).to.be.revertedWith("API already registered");
    });
  });

  describe("Payment Processing", function () {
    beforeEach(async function () {
      // Register an API
      const endpoint = "/api/weather";
      const pricePerCall = ethers.parseUnits("0.0001", 6);
      await registry.connect(user).registerAPI(endpoint, pricePerCall);

      // Record a verification in IdentityAttestation
      const nullifier = ethers.id("test-nullifier-1");
      const VERIFIER_ROLE = await identityAttestation.VERIFIER_ROLE();
      await identityAttestation.grantRole(VERIFIER_ROLE, owner.address);
      await identityAttestation.recordVerification(nullifier);
    });

    it("Should record a payment", async function () {
      const nullifier = ethers.id("test-nullifier-1");
      const endpoint = "/api/weather";
      const amount = ethers.parseUnits("0.0001", 6);

      // Grant VERIFIER_ROLE to registry for payment recording
      const VERIFIER_ROLE = await registry.VERIFIER_ROLE();
      await registry.grantRole(VERIFIER_ROLE, owner.address);

      await expect(registry.recordPayment(nullifier, endpoint, amount))
        .to.emit(registry, "PaymentProcessed")
        .withArgs(nullifier, endpoint, amount, (value) => value > 0);

      const spending = await registry.getUserSpending(nullifier, endpoint);
      expect(spending).to.equal(amount);
    });

    it("Should prevent payment for inactive API", async function () {
      const nullifier = ethers.id("test-nullifier-1");
      const endpoint = "/api/weather";
      const amount = ethers.parseUnits("0.0001", 6);

      // Deactivate API
      await registry.connect(user).setAPIStatus(endpoint, false);

      // Grant VERIFIER_ROLE
      const VERIFIER_ROLE = await registry.VERIFIER_ROLE();
      await registry.grantRole(VERIFIER_ROLE, owner.address);

      await expect(
        registry.recordPayment(nullifier, endpoint, amount)
      ).to.be.revertedWith("API not active");
    });
  });

  describe("API Status Management", function () {
    it("Should allow provider to update API status", async function () {
      const endpoint = "/api/weather";
      const pricePerCall = ethers.parseUnits("0.0001", 6);
      await registry.connect(user).registerAPI(endpoint, pricePerCall);

      await expect(registry.connect(user).setAPIStatus(endpoint, false))
        .to.emit(registry, "APIStatusChanged")
        .withArgs(endpoint, false);

      const listing = await registry.getAPIListing(endpoint);
      expect(listing.active).to.be.false;
    });

    it("Should prevent non-provider from updating status", async function () {
      const endpoint = "/api/weather";
      const pricePerCall = ethers.parseUnits("0.0001", 6);
      await registry.connect(user).registerAPI(endpoint, pricePerCall);

      await expect(
        registry.connect(owner).setAPIStatus(endpoint, false)
      ).to.be.revertedWith("Only provider can update status");
    });
  });
});

