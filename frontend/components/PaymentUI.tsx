'use client';

import { useState, useEffect } from 'react';
import { WalletTopUp } from './WalletTopUp';
import { Notification } from './Notification';

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
}

export function PaymentUI({ balance, setBalance }: PaymentUIProps) {
  const [apis, setApis] = useState<API[]>([]);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState<string | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [apiResult, setApiResult] = useState<{ api: API; result: any } | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    fetchAPIs();
  }, []);

  const fetchAPIs = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/marketplace', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApis(data.apis || []);
      }
    } catch (error) {
      console.error('Failed to fetch APIs:', error);
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
      const response = await fetch('/api/call-api', {
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
    } catch (error: any) {
      console.error('API call error:', error);
      setNotification({
        message: error.message || 'Failed to call API. Please try again.',
        type: 'error',
      });
    } finally {
      setCalling(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading APIs...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">API Marketplace</h2>
            <p className="text-gray-600">
              Premium APIs at micro-prices. Pay only for what you use.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">Your Balance</p>
              <p className="text-2xl font-bold text-green-600">
                ${balance.toFixed(4)} USDC
              </p>
            </div>
            <button
              onClick={() => setShowTopUp(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
            >
              Top Up
            </button>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Total APIs</p>
            <p className="text-2xl font-bold text-gray-900">{apis.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Avg Price</p>
            <p className="text-2xl font-bold text-gray-900">
              ${apis.length > 0 
                ? (apis.reduce((sum, api) => sum + api.pricePerCall, 0) / apis.length).toFixed(4)
                : '0.0000'}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Total Calls</p>
            <p className="text-2xl font-bold text-gray-900">
              {apis.reduce((sum, api) => sum + api.totalCalls, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading APIs...</p>
        </div>
      ) : apis.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-4 text-gray-500">No APIs available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apis.map((api) => (
            <div
              key={api.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {api.icon && <span className="text-2xl">{api.icon}</span>}
                    <h3 className="text-xl font-bold text-gray-900">{api.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{api.description}</p>
                  {api.category && (
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded">
                      {api.category}
                    </span>
                  )}
                </div>
                <div className="ml-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600"
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
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-bold text-green-600">
                      ${api.pricePerCall.toFixed(4)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">/call</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Popularity</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {api.totalCalls.toLocaleString()} calls
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleCallAPI(api)}
                disabled={calling === api.id || balance < api.pricePerCall}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  calling === api.id
                    ? 'bg-blue-400 text-white cursor-wait'
                    : balance < api.pricePerCall
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
                }`}
              >
                {calling === api.id ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Calling API...
                  </span>
                ) : balance < api.pricePerCall ? (
                  'Insufficient Balance'
                ) : (
                  'Use API'
                )}
              </button>
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

