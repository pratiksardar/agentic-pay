// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title IdentityAttestation
 * @dev Contract for storing World ID verification records
 * Reused from IdentityVault project
 */
contract IdentityAttestation is AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // nullifier => verification status
    mapping(bytes32 => bool) public verified;
    
    // nullifier => verification timestamp
    mapping(bytes32 => uint256) public verificationTimestamp;
    
    event VerificationRecorded(bytes32 indexed nullifier, uint256 timestamp);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Record a World ID verification
     * @param nullifier The World ID nullifier hash
     */
    function recordVerification(bytes32 nullifier) external onlyRole(VERIFIER_ROLE) {
        require(!verified[nullifier], "Already verified");
        
        verified[nullifier] = true;
        verificationTimestamp[nullifier] = block.timestamp;
        
        emit VerificationRecorded(nullifier, block.timestamp);
    }
    
    /**
     * @dev Check if a nullifier is verified
     * @param nullifier The World ID nullifier hash
     * @return True if verified
     */
    function isVerified(bytes32 nullifier) external view returns (bool) {
        return verified[nullifier];
    }
    
    /**
     * @dev Get verification timestamp
     * @param nullifier The World ID nullifier hash
     * @return Timestamp of verification, or 0 if not verified
     */
    function getVerificationTimestamp(bytes32 nullifier) external view returns (uint256) {
        return verificationTimestamp[nullifier];
    }
}

