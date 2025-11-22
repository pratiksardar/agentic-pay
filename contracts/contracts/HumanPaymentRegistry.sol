// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title HumanPaymentRegistry
 * @dev Smart contract for tracking payments and API usage for verified humans
 * Integrates with World ID for verification and X402 for micropayments
 */
contract HumanPaymentRegistry is AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // Reference to IdentityAttestation contract (deployed separately)
    address public identityAttestation;
    
    // nullifier => (apiEndpoint => totalSpent)
    mapping(bytes32 => mapping(string => uint256)) public userSpending;
    
    // Track verified humans using APIs
    struct APIUsageRecord {
        bytes32 nullifier;
        string endpoint;
        uint256 amount;
        uint256 timestamp;
    }
    
    // API Listing structure
    struct APIListing {
        address provider;
        string endpoint;
        uint256 pricePerCall;
        bool active;
        uint256 totalCalls;
        uint256 totalRevenue;
    }
    
    mapping(string => APIListing) public apiListings;
    APIUsageRecord[] public usageRecords;
    
    event PaymentProcessed(
        bytes32 indexed nullifier,
        string endpoint,
        uint256 amount,
        uint256 timestamp
    );
    
    event APIRegistered(
        string endpoint,
        address provider,
        uint256 pricePerCall
    );
    
    event APIStatusChanged(string endpoint, bool active);
    
    constructor(address _identityAttestation) {
        identityAttestation = _identityAttestation;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Record a payment for API usage
     * @param nullifier The World ID nullifier hash
     * @param endpoint The API endpoint being called
     * @param amount The amount paid in USDC (scaled by 1e6)
     */
    function recordPayment(
        bytes32 nullifier,
        string memory endpoint,
        uint256 amount
    ) external onlyRole(VERIFIER_ROLE) {
        require(apiListings[endpoint].active, "API not active");
        require(amount > 0, "Amount must be greater than 0");
        
        // Verify identity (would check IdentityAttestation contract)
        // For now, we trust the verifier role
        
        userSpending[nullifier][endpoint] += amount;
        apiListings[endpoint].totalCalls += 1;
        apiListings[endpoint].totalRevenue += amount;
        
        usageRecords.push(APIUsageRecord({
            nullifier: nullifier,
            endpoint: endpoint,
            amount: amount,
            timestamp: block.timestamp
        }));
        
        emit PaymentProcessed(
            nullifier,
            endpoint,
            amount,
            block.timestamp
        );
    }
    
    /**
     * @dev Register a new API endpoint
     * @param endpoint The API endpoint identifier
     * @param pricePerCall Price per API call in USDC (scaled by 1e6)
     */
    function registerAPI(
        string memory endpoint,
        uint256 pricePerCall
    ) external {
        require(bytes(endpoint).length > 0, "Endpoint cannot be empty");
        require(pricePerCall > 0, "Price must be greater than 0");
        require(apiListings[endpoint].provider == address(0), "API already registered");
        
        apiListings[endpoint] = APIListing({
            provider: msg.sender,
            endpoint: endpoint,
            pricePerCall: pricePerCall,
            active: true,
            totalCalls: 0,
            totalRevenue: 0
        });
        
        emit APIRegistered(endpoint, msg.sender, pricePerCall);
    }
    
    /**
     * @dev Update API status (active/inactive)
     * @param endpoint The API endpoint identifier
     * @param active New status
     */
    function setAPIStatus(string memory endpoint, bool active) external {
        require(
            apiListings[endpoint].provider == msg.sender,
            "Only provider can update status"
        );
        apiListings[endpoint].active = active;
        emit APIStatusChanged(endpoint, active);
    }
    
    /**
     * @dev Get user's total spending on an endpoint
     * @param nullifier The World ID nullifier hash
     * @param endpoint The API endpoint identifier
     * @return Total amount spent
     */
    function getUserSpending(
        bytes32 nullifier,
        string memory endpoint
    ) external view returns (uint256) {
        return userSpending[nullifier][endpoint];
    }
    
    /**
     * @dev Get API listing details
     * @param endpoint The API endpoint identifier
     * @return API listing details
     */
    function getAPIListing(string memory endpoint) external view returns (
        address provider,
        uint256 pricePerCall,
        bool active,
        uint256 totalCalls,
        uint256 totalRevenue
    ) {
        APIListing memory listing = apiListings[endpoint];
        return (
            listing.provider,
            listing.pricePerCall,
            listing.active,
            listing.totalCalls,
            listing.totalRevenue
        );
    }
    
    /**
     * @dev Get total usage records count
     * @return Total number of usage records
     */
    function getUsageRecordsCount() external view returns (uint256) {
        return usageRecords.length;
    }
}

