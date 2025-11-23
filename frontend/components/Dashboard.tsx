'use client';

import { useState, useEffect } from 'react';
import { PaymentUI } from './PaymentUI';
import { AgentDashboard } from './AgentDashboard';
import { TransactionHistory } from './TransactionHistory';
import { getDebugNullifier, getAuthBypassHeaders, isAuthBypassMode } from '@/lib/auth-bypass-helper';

// API Marketplace Window Component
function APIMarketplaceWindow({ balance, setBalance }: { balance: number; setBalance: (b: number) => void }) {
  const [apiCount, setApiCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const { getApiUrl } = await import('@/lib/api-config');
        const apiUrl = getApiUrl();
        // Get headers with auth bypass support
        const headers = getAuthBypassHeaders();
        const response = await fetch(`${apiUrl}/api/marketplace`, {
          headers,
          mode: 'cors',
          credentials: 'omit',
        });
        if (response.ok) {
          const data = await response.json();
          setApiCount(data.apis?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch API count:', error);
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border border-[#e9ecef]">
      <div className="bg-[#e9ecef] px-4 py-2 flex items-center justify-between">
        <div className="text-xs font-semibold text-[#6c757d] uppercase">
          &gt; API MARKETPLACE
        </div>
        <div className="text-xs text-[#6c757d]">
          {apiCount} APIS
        </div>
      </div>
      <div className="p-4 max-h-[600px] overflow-y-auto">
                <PaymentUI balance={balance} setBalance={setBalance} compact={true} />
                <div className="mt-4 border-t border-[#e9ecef] pt-4">
                  <h3 className="text-sm font-semibold text-[#212529] mb-2">Recent Transactions</h3>
                  <TransactionHistory compact={true} />
                </div>
      </div>
    </div>
  );
}

// AI Agents Window Component
function AIAgentsWindow() {
  const [agentCount, setAgentCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const { getApiUrl } = await import('@/lib/api-config');
        const apiUrl = getApiUrl();
        // Get headers with auth bypass support
        const headers = getAuthBypassHeaders();
        const response = await fetch(`${apiUrl}/api/agents`, {
          headers,
          mode: 'cors',
          credentials: 'omit',
        });
        if (response.ok) {
          const data = await response.json();
          setAgentCount(data.agents?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch agent count:', error);
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border border-[#e9ecef]">
      <div className="bg-[#e9ecef] px-4 py-2 flex items-center justify-between">
        <div className="text-xs font-semibold text-[#6c757d] uppercase">
          &gt; AI AGENTS
        </div>
        <div className="text-xs text-[#6c757d]">
          {agentCount} AGENTS
        </div>
      </div>
      <div className="p-4 max-h-[600px] overflow-y-auto">
        <AgentDashboard compact={true} />
      </div>
    </div>
  );
}

export function Dashboard() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [nullifier, setNullifier] = useState<string>('');

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const { getApiUrl } = await import('@/lib/api-config');
        const apiUrl = getApiUrl();

        // Get nullifier (debug mode if not authenticated)
        const nullifierHash = getDebugNullifier();
        setNullifier(nullifierHash);

        // Get headers with auth bypass support
        const headers = getAuthBypassHeaders();

        console.log('🔗 Fetching balance from:', `${apiUrl}/api/wallet/balance`);
        const response = await fetch(`${apiUrl}/api/wallet/balance`, {
          headers,
          mode: 'cors',
          credentials: 'omit',
        });

        console.log('📥 Balance response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Balance fetched:', data.balance);
          setBalance(data.balance || 0);
        } else {
          console.error('❌ Failed to fetch balance:', response.status, response.statusText);
        }
      } catch (error: any) {
        console.error('❌ Failed to fetch balance (network error):', error);
        console.error('❌ Error details:', { name: error.name, message: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  // Format address from nullifier
  const formatAddress = (hash: string) => {
    if (!hash) return 'humanpay.brnr.eth';
    return `humanpay.${hash.slice(0, 8)}.eth`;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header - Burner Style */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#6c757d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[#212529] font-semibold">humanpay</span>
                <svg className="w-4 h-4 text-[#6c757d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full bg-[#6c757d] flex items-center justify-center hover:bg-[#5a6268] transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </header>

        {/* Address Section - Burner Style */}
        <div className="mb-6">
          <div className="bg-[#e9ecef] px-4 py-2 text-xs font-semibold text-[#6c757d] uppercase">
            &gt; ADDRESS
          </div>
          <div className="bg-white border border-[#e9ecef] border-t-0 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <button className="flex-shrink-0 text-[#6c757d] hover:text-[#212529]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
              <span className="text-sm text-[#212529] font-mono truncate">{formatAddress(nullifier)}</span>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button className="text-[#6c757d] hover:text-[#212529]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button className="text-[#6c757d] hover:text-[#212529]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Balance Section - Burner Style */}
        <div className="mb-6">
          <div className="bg-[#e9ecef] px-4 py-2 text-xs font-semibold text-[#6c757d] uppercase">
            BALANCE
          </div>
          <div className="bg-[#212529] px-4 py-6 flex items-center justify-between">
            <div className="flex-1">
              <div className="text-white text-2xl font-bold mb-1">
                {loading ? '...' : `$${balance.toFixed(2)}`}
              </div>
              <div className="flex items-center space-x-2 text-white/70 text-sm">
                <span>ALL NETWORKS</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {balance === 0 && (
              <div className="flex flex-col items-center">
                <div className="text-6xl mb-2">😐</div>
                <div className="text-white/70 text-sm">No Balance</div>
              </div>
            )}
          </div>
          <div className="bg-white border border-[#e9ecef] border-t-0 grid grid-cols-3 gap-0">
            <button className="px-4 py-3 border-r border-[#e9ecef] flex items-center justify-center space-x-2 hover:bg-[#f8f9fa] transition-colors">
              <svg className="w-5 h-5 text-[#6c757d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-semibold text-[#212529]">DEPOSIT</span>
            </button>
            <button className="px-4 py-3 border-r border-[#e9ecef] flex items-center justify-center space-x-2 hover:bg-[#f8f9fa] transition-colors">
              <svg className="w-5 h-5 text-[#6c757d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="text-sm font-semibold text-[#212529]">SWAP</span>
            </button>
            <button className="px-4 py-3 flex items-center justify-center space-x-2 hover:bg-[#f8f9fa] transition-colors">
              <svg className="w-5 h-5 text-[#6c757d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="text-sm font-semibold text-[#212529]">SEND</span>
            </button>
          </div>
        </div>

        {/* Two Windows: API Marketplace and AI Agents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <APIMarketplaceWindow balance={balance} setBalance={setBalance} />
          <AIAgentsWindow />
        </div>
      </div>
    </div>
  );
}
