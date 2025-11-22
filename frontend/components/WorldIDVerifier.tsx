'use client';

import { useState, useEffect } from 'react';
import { verifyWithWorldID, getMiniKit, isMiniKitAvailable } from '@/lib/minikit';
import { MiniKitDebug } from './MiniKitDebug';

interface WorldIDVerifierProps {
  onVerificationSuccess: () => void;
}

export function WorldIDVerifier({ onVerificationSuccess }: WorldIDVerifierProps) {
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Debug: Check for MiniKit on mount and periodically
  useEffect(() => {
    const checkMiniKit = () => {
      const kit = (window as any).MiniKit;
      const info: any = {
        hasWindowMiniKit: !!kit,
        hasReactNativeWebView: !!(window as any).ReactNativeWebView,
        userAgent: navigator.userAgent,
        windowKeys: Object.keys(window).filter(k => 
          k.toLowerCase().includes('mini') || 
          k.toLowerCase().includes('world') ||
          k.toLowerCase().includes('reactnative') ||
          k.toLowerCase().includes('webview')
        ),
        documentReadyState: document.readyState,
        locationHref: window.location.href,
      };
      
      // If MiniKit exists, get more details
      if (kit) {
        info.minikitDetails = {
          type: typeof kit,
          hasIsInstalled: typeof kit.isInstalled === 'function',
          hasCommandsAsync: !!kit.commandsAsync,
          hasCommands: !!kit.commands,
          keys: typeof kit === 'object' ? Object.keys(kit).slice(0, 20) : [],
        };
        
        // Try to call isInstalled if available
        if (typeof kit.isInstalled === 'function') {
          try {
            info.minikitDetails.isInstalled = kit.isInstalled();
          } catch (e) {
            info.minikitDetails.isInstalledError = String(e);
          }
        }
      }
      
      setDebugInfo(JSON.stringify(info, null, 2));
      console.log('🔍 MiniKit Debug Info:', info);
    };

    checkMiniKit();
    const interval = setInterval(checkMiniKit, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    setVerifying(true);
    setError(null);

    try {
      // Get MiniKit directly from window (provided by MiniKitProvider)
      const minikit = typeof window !== 'undefined' ? window.MiniKit : null;
      
      if (!minikit) {
        throw new Error('MiniKit is not available. Please make sure you\'re opening this app from within World App.');
      }

      // Check if installed
      if (typeof minikit.isInstalled === 'function' && !minikit.isInstalled()) {
        throw new Error('MiniKit is not installed. Please open this app from within World App.');
      }

      const appId = process.env.NEXT_PUBLIC_WORLD_ID_APP_ID || '';
      if (!appId) {
        throw new Error('World ID App ID not configured. Please check your environment variables.');
      }

      // Use the utility function to verify
      let result: any = null;
      try {
        result = await verifyWithWorldID(
          'humanpay-verification',
          'humanpay-verify',
          appId,
          minikit
        );
      } catch (verifyError: any) {
        console.error('Verification error:', verifyError);
        throw verifyError;
      }

      // Require real World ID verification - no mock fallback
      if (!result) {
        throw new Error('World ID verification failed. Please make sure you\'re using World App and have completed the verification process.');
      }

      if (result.success) {
        // Send verification to backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/auth/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            proof: result.proof,
            nullifier: result.nullifier,
            signal: 'humanpay-verification',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('nullifier', result.nullifier);
          onVerificationSuccess();
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Backend verification failed');
        }
      } else {
        throw new Error('World ID verification failed');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to HumanPay
          </h1>
          <p className="text-gray-600">
            Verify your identity with World ID to access premium APIs at micro-prices
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {verifying ? 'Verifying...' : 'Verify with World ID'}
          </button>
          
          {typeof window !== 'undefined' && !window.MiniKit && (
            <div className="mt-2 space-y-2">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 mb-2">
                  ⚠️ <strong>MiniKit not detected:</strong> Please make sure you're opening this app from within World App.
                </p>
                <button
                  onClick={() => {
                    // Retry by reloading
                    window.location.reload();
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Retry Detection
                </button>
              </div>
              <MiniKitDebug />
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            <p>Your privacy is protected with zero-knowledge proofs</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            What you get:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Access to premium APIs for pennies per call</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Bot-proof marketplace (verified humans only)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Deploy AI agents with human authorization</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

