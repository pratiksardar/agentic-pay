/**
 * VerifiedUsersService - Stores and checks verified nullifiers
 * For Phase 1: In-memory storage (replace with database in production)
 */

class VerifiedUsersService {
  constructor() {
    // In-memory storage for verified nullifiers
    // In production, this should be a database (MongoDB, PostgreSQL, etc.)
    this.verifiedNullifiers = new Map(); // nullifier => { verifiedAt, action, signal }
  }

  /**
   * Check if a nullifier is already verified in our system
   * @param {string} nullifier - World ID nullifier hash
   * @returns {Promise<boolean>} True if verified
   */
  async isVerified(nullifier) {
    if (!nullifier) {
      return false;
    }
    return this.verifiedNullifiers.has(nullifier);
  }

  /**
   * Record a verified nullifier
   * @param {string} nullifier - World ID nullifier hash
   * @param {string} action - Action ID used for verification
   * @param {string} signal - Signal used for verification (optional)
   * @returns {Promise<void>}
   */
  async recordVerification(nullifier, action, signal) {
    if (!nullifier) {
      return;
    }

    const existing = this.verifiedNullifiers.get(nullifier);
    const now = new Date().toISOString();

    // If already exists, update lastSeen, otherwise create new record
    if (existing) {
      existing.lastSeen = now;
      // Update action if provided and different
      if (action && action !== 'unknown') {
        existing.action = action;
      }
      this.verifiedNullifiers.set(nullifier, existing);
      console.log(`✅ Updated verification record for nullifier ${nullifier.slice(0, 8)}...`);
    } else {
      this.verifiedNullifiers.set(nullifier, {
        verifiedAt: now,
        action: action || 'unknown',
        signal: signal || null,
        lastSeen: now,
      });
      console.log(`✅ Recorded new verification for nullifier ${nullifier.slice(0, 8)}...`);
    }
  }

  /**
   * Get verification info for a nullifier
   * @param {string} nullifier - World ID nullifier hash
   * @returns {Promise<Object|null>} Verification info or null
   */
  async getVerificationInfo(nullifier) {
    if (!nullifier) {
      return null;
    }
    return this.verifiedNullifiers.get(nullifier) || null;
  }

  /**
   * Update last seen timestamp for a nullifier
   * @param {string} nullifier - World ID nullifier hash
   * @returns {Promise<void>}
   */
  async updateLastSeen(nullifier) {
    if (!nullifier) {
      return;
    }

    const info = this.verifiedNullifiers.get(nullifier);
    if (info) {
      info.lastSeen = new Date().toISOString();
      this.verifiedNullifiers.set(nullifier, info);
    }
  }

  /**
   * Get all verified nullifiers (for debugging)
   * @returns {Promise<Array>} Array of verified nullifiers
   */
  async getAllVerified() {
    return Array.from(this.verifiedNullifiers.entries()).map(([nullifier, info]) => ({
      nullifier,
      ...info,
    }));
  }
}

module.exports = new VerifiedUsersService();

