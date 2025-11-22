'use client';

import { useState, useEffect } from 'react';
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
  baseUrl?: string;
  documentation?: string;
}

interface APIDetailViewProps {
  api: API;
  balance: number;
  setBalance: (balance: number) => void;
  onClose: () => void;
}

export function APIDetailView({ api, balance, setBalance, onClose }: APIDetailViewProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [apiResult, setApiResult] = useState<any>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const generateAPIKey = () => {
    // Generate a unique API key for this user
    const token = localStorage.getItem('auth_token');
    const nullifier = localStorage.getItem('nullifier');
    
    if (!token || !nullifier) {
      setNotification({
        message: 'Please verify with World ID first',
        type: 'error',
      });
      return;
    }

    // Generate API key: prefix + user identifier + timestamp
    const key = `hp_${nullifier.slice(2, 10)}_${Date.now().toString(36)}`;
    setApiKey(key);
    
    // Store API key in localStorage
    const apiKeys = JSON.parse(localStorage.getItem('api_keys') || '{}');
    apiKeys[api.id] = key;
    localStorage.setItem('api_keys', JSON.stringify(apiKeys));

    setNotification({
      message: 'API key generated successfully!',
      type: 'success',
    });
  };

  const handleTryAPI = async () => {
    if (!apiKey) {
      setNotification({
        message: 'Please generate an API key first',
        type: 'error',
      });
      return;
    }

    if (balance < api.pricePerCall) {
      setNotification({
        message: `Insufficient balance. You need $${api.pricePerCall.toFixed(4)} but have $${balance.toFixed(4)}`,
        type: 'error',
      });
      return;
    }

    setTesting(true);
    setNotification(null);
    setApiResult(null);

    try {
      const { getApiUrl } = await import('@/lib/api-config');
      const apiUrl = getApiUrl();
      // Auth is currently bypassed, so no token needed (but include if available)
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Use X402-enabled fetch for automatic payment handling
      const { makePaidRequest } = await import('@/lib/x402-client');
      const response = await makePaidRequest(`${apiUrl}/api/call-api`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: api.endpoint,
          apiKey: apiKey,
        }),
      });

      if (response.status === 402) {
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
        setApiResult(data.result);
        setNotification({
          message: `API call successful! Cost: $${api.pricePerCall.toFixed(4)}`,
          type: 'success',
        });
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
      setTesting(false);
    }
  };

  // Load existing API key if available
  useEffect(() => {
    const apiKeys = JSON.parse(localStorage.getItem('api_keys') || '{}');
    if (apiKeys[api.id]) {
      setApiKey(apiKeys[api.id]);
    }
  }, [api.id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-[#e9ecef]">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#e9ecef] p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {api.icon && <span className="text-4xl">{api.icon}</span>}
            <div>
              <h2 className="text-2xl font-bold text-[#212529]">{api.name}</h2>
              {api.category && (
                <span className="inline-block px-2 py-1 text-xs font-semibold text-[#0d6efd] bg-[#e9ecef] rounded mt-1">
                  {api.category}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#6c757d] hover:text-[#212529] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-[#212529] mb-2">Description</h3>
            <p className="text-[#6c757d]">{api.description}</p>
          </div>

          {/* Pricing */}
          <div className="bg-[#f8f9fa] rounded-lg p-4 border border-[#e9ecef]">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-sm text-[#6c757d] mb-1">Price per call</p>
                <p className="text-3xl font-bold text-[#198754]">
                  ${api.pricePerCall.toFixed(4)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#6c757d] mb-1">Total calls</p>
                <p className="text-xl font-semibold text-[#212529]">
                  {api.totalCalls.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* API Key Section */}
          <div className="border border-[#e9ecef] rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#212529] mb-3">API Key</h3>
            {apiKey ? (
              <div className="space-y-3">
                <div className="bg-[#f8f9fa] rounded-lg p-3 border border-[#e9ecef]">
                  <p className="text-xs text-[#6c757d] mb-1">Your API Key</p>
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono text-[#212529] break-all">{apiKey}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey);
                        setNotification({
                          message: 'API key copied to clipboard!',
                          type: 'success',
                        });
                      }}
                      className="ml-2 text-[#0d6efd] hover:text-[#0b5ed7] text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[#6c757d]">
                  Use this API key to authenticate your requests. Keep it secure!
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-[#6c757d] mb-3">
                  Generate an API key to start using this API
                </p>
                <button
                  onClick={generateAPIKey}
                  className="bg-[#0d6efd] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0b5ed7] transition-colors"
                >
                  Generate API Key
                </button>
              </div>
            )}
          </div>

          {/* Try API Section */}
          {apiKey && (
            <div className="border border-[#e9ecef] rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#212529] mb-3">Try This API</h3>
              <p className="text-sm text-[#6c757d] mb-4">
                Test this API now. ${api.pricePerCall.toFixed(4)} will be charged from your balance.
              </p>
              <button
                onClick={handleTryAPI}
                disabled={testing || balance < api.pricePerCall}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  testing
                    ? 'bg-[#0d6efd] text-white cursor-wait opacity-80'
                    : balance < api.pricePerCall
                    ? 'bg-[#e9ecef] text-[#adb5bd] cursor-not-allowed'
                    : 'bg-[#198754] text-white hover:bg-[#157347]'
                }`}
              >
                {testing
                  ? 'Processing Payment & Calling API...'
                  : balance < api.pricePerCall
                  ? 'Insufficient Balance'
                  : `Try API ($${api.pricePerCall.toFixed(4)})`}
              </button>
            </div>
          )}

          {/* API Result */}
          {apiResult && (
            <div className="border border-[#e9ecef] rounded-lg p-4 bg-[#f8f9fa]">
              <h3 className="text-lg font-semibold text-[#212529] mb-3">API Response</h3>
              <pre className="bg-white p-4 rounded-lg text-sm text-[#212529] overflow-auto max-h-60 border border-[#e9ecef]">
                {JSON.stringify(apiResult, null, 2)}
              </pre>
              <button
                onClick={() => setApiResult(null)}
                className="mt-3 text-sm text-[#0d6efd] hover:text-[#0b5ed7]"
              >
                Clear Result
              </button>
            </div>
          )}

          {/* Documentation */}
          {api.documentation && (
            <div className="border-t border-[#e9ecef] pt-4">
              <h3 className="text-lg font-semibold text-[#212529] mb-2">Documentation</h3>
              <a
                href={api.documentation}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0d6efd] hover:text-[#0b5ed7] text-sm"
              >
                View API Documentation →
              </a>
            </div>
          )}
        </div>

        {/* Notification */}
        {notification && (
          <div className="px-6 pb-6">
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

