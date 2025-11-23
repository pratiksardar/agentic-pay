'use client';

import { useState, useEffect } from 'react';
import { WalletTopUp } from './WalletTopUp';
import { Notification } from './Notification';
import { APIDetailView } from './APIDetailView';
import { getAuthBypassHeaders } from '@/lib/auth-bypass-helper';

interface API {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  pricePerCall: number;
  totalCalls: number;
  category?: string;
  icon?: string;
}

interface PaymentUIProps {
  balance: number;
  setBalance: (balance: number) => void;
  compact?: boolean;
}

export function PaymentUI({ balance, setBalance, compact = false }: PaymentUIProps) {
  const [apis, setApis] = useState<API[]>([]);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState<string | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [apiResult, setApiResult] = useState<{ api: API; result: unknown } | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedAPI, setSelectedAPI] = useState<API | null>(null);

  useEffect(() => {
    fetchAPIs();
  }, []);

  const fetchAPIs = async () => {
    try {
      const { getApiUrl } = await import('@/lib/api-config');
      const apiUrl = getApiUrl();
      const fullUrl = `${apiUrl}/api/marketplace`;
      console.log('🔗 Fetching APIs from:', fullUrl);
      console.log('📱 User Agent:', navigator.userAgent);
      console.log('🌐 Current Origin:', window.location.origin);
      
      // Get headers with auth bypass support
      const headers = getAuthBypassHeaders();
      
      console.log('📤 Making fetch request...');
      const response = await fetch(fullUrl, {
        headers,
        // Add mode and credentials for World App
        mode: 'cors',
        credentials: 'omit',
      });

      console.log('📥 Response status:', response.status, response.statusText);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success! Fetched APIs:', data.apis?.length || 0);
        console.log('📦 API data:', data);
        setApis(data.apis || []);
        setNotification({
          message: `Loaded ${data.apis?.length || 0} APIs successfully`,
          type: 'success',
        });
      } else {
        const errorText = await response.text().catch(() => response.statusText);
        console.error('❌ Failed to fetch APIs:', response.status, errorText);
        console.error('❌ Response URL:', response.url);
        setNotification({
          message: `Failed to load APIs: ${response.status} ${response.statusText}`,
          type: 'error',
        });
        setApis([]);
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch APIs (network error):', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      // Show user-friendly error
      setNotification({
        message: `Network error: ${error.message || 'Unable to connect to server'}`,
        type: 'error',
      });
      setApis([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCallAPI = async (api: API) => {
    if (balance < api.pricePerCall) {
      setNotification({
        message: `Insufficient balance. You need $${api.pricePerCall.toFixed(4)} but have $${balance.toFixed(4)}`,
        type: 'error',
      });
      return;
    }

    setCalling(api.id);
    setNotification(null);

    try {
      const token = localStorage.getItem('auth_token');
      
      // Use X402-enabled fetch for automatic payment handling
      const { getApiUrl } = await import('@/lib/api-config');
      const apiUrl = getApiUrl();
      const { makePaidRequest } = await import('@/lib/x402-client');
      const response = await makePaidRequest(`${apiUrl}/api/call-api`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: api.endpoint,
        }),
      });

      if (response.status === 402) {
        // Payment required - X402 flow
        const data = await response.json();
        setNotification({
          message: `Payment required: $${data.price}. Please top up your balance.`,
          type: 'info',
        });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setBalance(data.newBalance);
        setApiResult({ api, result: data.result });
        setNotification({
          message: `Successfully called ${api.name}! Cost: $${api.pricePerCall.toFixed(4)}`,
          type: 'success',
        });
        fetchAPIs(); // Refresh API list
        
        // Auto-hide result after 5 seconds
        setTimeout(() => setApiResult(null), 5000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'API call failed');
      }
    } catch (error: unknown) {
      console.error('API call error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to call API. Please try again.';
      setNotification({
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setCalling(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0d6efd] border-t-transparent mx-auto"></div>
        <p className="mt-4 text-[#6c757d]">Loading APIs...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {!compact && (
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#212529] mb-2">API Marketplace</h2>
            <p className="text-[#6c757d] text-sm sm:text-base">
              Premium APIs at micro-prices. Pay only for what you use.
            </p>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
            <div className="text-right retro-card rounded-lg px-4 py-2 sm:px-5 sm:py-3 flex-1 sm:flex-none">
              <p className="text-xs text-[#6c757d] mb-1">Balance</p>
              <p className="text-xl sm:text-2xl font-bold text-[#212529]">
                ${balance.toFixed(4)} USDC
              </p>
            </div>
            <button
              onClick={() => setShowTopUp(true)}
              className="px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base whitespace-nowrap
              font-mono border-2 border-black bg-white text-black
              hover:bg-black hover:text-white transition-colors duration-150
              shadow-[3px_3px_0_0_black] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
              style={{ textShadow: 'none' }}
            >
              Top Up
            </button>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="retro-card rounded-lg p-3 sm:p-5">
            <p className="text-xs sm:text-sm text-[#6c757d] mb-1 sm:mb-2">Total APIs</p>
            <p className="text-xl sm:text-3xl font-bold text-[#212529]">{apis.length}</p>
          </div>
          <div className="retro-card rounded-lg p-3 sm:p-5">
            <p className="text-xs sm:text-sm text-[#6c757d] mb-1 sm:mb-2">Avg Price</p>
            <p className="text-xl sm:text-3xl font-bold text-[#212529]">
              ${apis.length > 0 
                ? (apis.reduce((sum, api) => sum + api.pricePerCall, 0) / apis.length).toFixed(4)
                : '0.0000'}
            </p>
          </div>
          <div className="retro-card rounded-lg p-3 sm:p-5">
            <p className="text-xs sm:text-sm text-[#6c757d] mb-1 sm:mb-2">Total Calls</p>
            <p className="text-xl sm:text-3xl font-bold text-[#212529]">
              {apis.reduce((sum, api) => sum + api.totalCalls, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading APIs...</p>
        </div>
      ) : apis.length === 0 ? (
        <div className="text-center py-16 retro-card rounded-lg">
          <div className="text-[#6c757d] text-6xl mb-4">📦</div>
          <p className="mt-4 text-[#6c757d] text-lg">
            No APIs available yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className={`grid gap-3 sm:gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {apis.map((api) => (
            <div
              key={api.id}
              className="retro-card rounded-lg p-4 sm:p-6 transition-all duration-200 hover:shadow-md animate-fade-in"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    {api.icon && <span className="text-2xl sm:text-3xl">{api.icon}</span>}
                    <h3 className="text-lg sm:text-xl font-bold text-[#212529] truncate">{api.name}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#6c757d] mb-2 sm:mb-3 leading-relaxed line-clamp-2">{api.description}</p>
                  {api.category && (
                    <span className="inline-block px-2 py-1 text-xs font-semibold retro-badge rounded">
                      {api.category}
                    </span>
                  )}
                </div>
                <div className="ml-2 sm:ml-4 flex-shrink-0">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 retro-card rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 sm:w-7 sm:h-7 text-[#0d6efd]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="mb-4 sm:mb-5 p-3 sm:p-4 retro-card rounded-lg bg-[#f8f9fa]">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                  <div>
                    <span className="text-2xl sm:text-3xl font-bold text-[#212529]">
                      ${api.pricePerCall.toFixed(4)}
                    </span>
                    <span className="text-xs sm:text-sm text-[#6c757d] ml-1">/call</span>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-[#6c757d]">Popularity</p>
                    <p className="text-sm font-semibold text-[#212529]">
                      {api.totalCalls.toLocaleString()} calls
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedAPI(api)}
                  className="flex-1 py-2.5 sm:py-3 px-4 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base retro-button border border-[#0d6efd] text-[#0d6efd] bg-white hover:bg-[#0d6efd] hover:text-white"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleCallAPI(api)}
                  disabled={calling === api.id || balance < api.pricePerCall}
                  className={`flex-1 py-2.5 sm:py-3 px-4 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
                    calling === api.id
                      ? 'retro-button-primary cursor-wait opacity-75'
                      : balance < api.pricePerCall
                      ? 'bg-[#e9ecef] text-[#6c757d] border border-[#dee2e6] cursor-not-allowed'
                      : 'retro-button retro-button-primary'
                  }`}
                >
                  {calling === api.id ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Calling...
                    </span>
                  ) : balance < api.pricePerCall ? (
                    'Insufficient'
                  ) : (
                    'Try Now'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* API Result Modal */}
      {apiResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                API Call Result: {apiResult.api.name}
              </h3>
              <button
                onClick={() => setApiResult(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">Cost: ${apiResult.api.pricePerCall.toFixed(4)}</p>
              <p className="text-sm text-gray-600">New Balance: ${balance.toFixed(4)} USDC</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-green-400 text-sm">
                {JSON.stringify(apiResult.result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Top-Up Modal */}
      {showTopUp && (
        <WalletTopUp
          onTopUp={async (amount) => {
            // TODO: Integrate with Coinbase CDP for actual top-up
            // For now, just update balance
            setBalance(balance + amount);
            setShowTopUp(false);
          }}
          onClose={() => setShowTopUp(false)}
        />
      )}

      {/* API Detail View */}
      {selectedAPI && (
        <APIDetailView
          api={selectedAPI}
          balance={balance}
          setBalance={setBalance}
          onClose={() => setSelectedAPI(null)}
        />
      )}

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

