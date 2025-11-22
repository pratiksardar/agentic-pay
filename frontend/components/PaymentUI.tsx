'use client';

import { useState, useEffect } from 'react';

interface API {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  pricePerCall: number;
  totalCalls: number;
}

interface PaymentUIProps {
  balance: number;
  setBalance: (balance: number) => void;
}

export function PaymentUI({ balance, setBalance }: PaymentUIProps) {
  const [apis, setApis] = useState<API[]>([]);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState<string | null>(null);

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
      alert(`Insufficient balance. You need $${api.pricePerCall.toFixed(4)} but have $${balance.toFixed(4)}`);
      return;
    }

    setCalling(api.id);

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
        alert(`Payment required: $${data.price}. Please top up your balance.`);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setBalance(data.newBalance);
        alert(`API call successful! Result: ${JSON.stringify(data.result)}`);
        fetchAPIs(); // Refresh API list
      } else {
        throw new Error('API call failed');
      }
    } catch (error: any) {
      console.error('API call error:', error);
      alert(`Error: ${error.message}`);
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">API Marketplace</h2>
        <p className="text-gray-600">
          Premium APIs at micro-prices. Pay only for what you use.
        </p>
      </div>

      {apis.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No APIs available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apis.map((api) => (
            <div
              key={api.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{api.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{api.description}</p>

              <div className="mb-4">
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-green-600">
                    ${api.pricePerCall.toFixed(4)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">/call</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {api.totalCalls} calls this month
                </p>
              </div>

              <button
                onClick={() => handleCallAPI(api)}
                disabled={calling === api.id || balance < api.pricePerCall}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  calling === api.id || balance < api.pricePerCall
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {calling === api.id
                  ? 'Calling...'
                  : balance < api.pricePerCall
                  ? 'Insufficient Balance'
                  : 'Use API'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

