'use client';

import { useState, useEffect } from 'react';

interface Transaction {
  id: string;
  endpoint: string;
  amount: number;
  paymentId: string;
  status: string;
  timestamp: string;
  apiName?: string;
}

interface TransactionHistoryProps {
  compact?: boolean;
}

export function TransactionHistory({ compact = false }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalTransactions: number;
    totalSpent: number;
    lastTransaction: Transaction | null;
  } | null>(null);

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchTransactions = async () => {
    try {
      const { getApiUrl } = await import('@/lib/api-config');
      const apiUrl = getApiUrl();
      // Auth is currently bypassed, so no token needed
      const headers: HeadersInit = {};
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${apiUrl}/api/transactions`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        setStats(data.statistics || null);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d6efd] mx-auto"></div>
        <p className="mt-2 text-sm text-[#6c757d]">Loading transactions...</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {transactions.slice(0, 5).map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-2 bg-[#f8f9fa] rounded border border-[#e9ecef] text-xs"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#212529] truncate">{tx.apiName || tx.endpoint}</p>
              <p className="text-[#6c757d]">{formatTime(tx.timestamp)}</p>
            </div>
            <div className="text-right ml-2">
              <p className="font-bold text-[#dc3545]">-${tx.amount.toFixed(4)}</p>
              <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(tx.status)}`}>
                {tx.status}
              </span>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="text-center text-sm text-[#6c757d] py-4">No transactions yet</p>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-[#e9ecef] p-4">
            <p className="text-xs text-[#6c757d] mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-[#212529]">{stats.totalTransactions}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#e9ecef] p-4">
            <p className="text-xs text-[#6c757d] mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-[#dc3545]">${stats.totalSpent.toFixed(4)}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#e9ecef] p-4">
            <p className="text-xs text-[#6c757d] mb-1">Last Transaction</p>
            <p className="text-sm font-semibold text-[#212529]">
              {stats.lastTransaction ? formatTime(stats.lastTransaction.timestamp) : 'N/A'}
            </p>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="bg-white rounded-lg border border-[#e9ecef]">
        <div className="border-b border-[#e9ecef] p-4">
          <h3 className="text-lg font-bold text-[#212529]">Transaction History</h3>
        </div>
        <div className="divide-y divide-[#e9ecef]">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#6c757d]">No transactions yet</p>
              <p className="text-sm text-[#6c757d] mt-2">Your API calls will appear here</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="p-4 hover:bg-[#f8f9fa] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#e9ecef] rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-[#0d6efd]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#212529] truncate">
                          {tx.apiName || tx.endpoint}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-[#6c757d]">{formatTime(tx.timestamp)}</p>
                          <span className="text-xs text-[#6c757d]">•</span>
                          <p className="text-xs text-[#6c757d] truncate">ID: {tx.paymentId.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-[#dc3545]">-${tx.amount.toFixed(4)}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

