/**
 * Transaction Service - Track user transactions
 */

class TransactionService {
  constructor() {
    // In-memory storage (replace with database in production)
    this.transactions = new Map(); // nullifier => [transactions]
  }

  /**
   * Record a transaction
   * @param {Object} transaction - Transaction data
   * @param {string} transaction.nullifier - User nullifier
   * @param {string} transaction.endpoint - API endpoint
   * @param {number} transaction.amount - Payment amount
   * @param {string} transaction.paymentId - Payment ID
   * @param {string} transaction.status - Transaction status
   * @returns {Promise<Object>} Transaction record
   */
  async recordTransaction(transaction) {
    const { nullifier, endpoint, amount, paymentId, status = 'completed' } = transaction;

    const tx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nullifier,
      endpoint,
      amount,
      paymentId,
      status,
      timestamp: new Date().toISOString(),
      apiName: transaction.apiName || endpoint,
    };

    // Store transaction
    if (!this.transactions.has(nullifier)) {
      this.transactions.set(nullifier, []);
    }

    this.transactions.get(nullifier).unshift(tx); // Add to beginning

    // Keep only last 100 transactions per user
    const userTxs = this.transactions.get(nullifier);
    if (userTxs.length > 100) {
      userTxs.splice(100);
    }

    console.log(`📝 Recorded transaction: ${tx.id} for ${nullifier.slice(0, 8)}...`);
    return tx;
  }

  /**
   * Get user transactions
   * @param {string} nullifier - User nullifier
   * @param {number} limit - Maximum number of transactions to return
   * @returns {Promise<Array>} Array of transactions
   */
  async getUserTransactions(nullifier, limit = 50) {
    if (!this.transactions.has(nullifier)) {
      return [];
    }

    const txs = this.transactions.get(nullifier);
    return txs.slice(0, limit);
  }

  /**
   * Get transaction by ID
   * @param {string} nullifier - User nullifier
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object|null>} Transaction or null
   */
  async getTransaction(nullifier, transactionId) {
    if (!this.transactions.has(nullifier)) {
      return null;
    }

    const txs = this.transactions.get(nullifier);
    return txs.find(tx => tx.id === transactionId) || null;
  }

  /**
   * Get transaction statistics
   * @param {string} nullifier - User nullifier
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics(nullifier) {
    if (!this.transactions.has(nullifier)) {
      return {
        totalTransactions: 0,
        totalSpent: 0,
        lastTransaction: null,
      };
    }

    const txs = this.transactions.get(nullifier);
    const totalSpent = txs.reduce((sum, tx) => sum + (tx.amount || 0), 0);

    return {
      totalTransactions: txs.length,
      totalSpent,
      lastTransaction: txs[0] || null,
    };
  }
}

module.exports = new TransactionService();

