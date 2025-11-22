'use client';

import { useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';
// Note: Using standard button for now - UI Kit Button can be added later

interface WorldIDVerifierProps {
  minikit: MiniKit | null;
  onVerificationSuccess: () => void;
}

export function WorldIDVerifier({ minikit, onVerificationSuccess }: WorldIDVerifierProps) {
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!minikit) {
      setError('MiniKit not initialized');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      // Verify with World ID using MiniKit
      const result = await minikit.verify({
        signal: 'humanpay-verification',
        action: 'humanpay-verify',
      });

      if (result.success) {
        // Send verification to backend
        const response = await fetch('/api/auth/verify', {
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
          throw new Error('Backend verification failed');
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
            disabled={verifying || !minikit}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {verifying ? 'Verifying...' : 'Verify with World ID'}
          </button>

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

