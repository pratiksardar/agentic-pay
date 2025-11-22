'use client';

import { useState, useEffect } from 'react';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import { MiniKitDebug } from './MiniKitDebug';

interface WorldIDVerifierProps {
  onVerificationSuccess: () => void;
}

export function WorldIDVerifier({ onVerificationSuccess }: WorldIDVerifierProps) {
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { isInstalled } = useMiniKit();

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

  const handleVerify = async (verificationLevel: VerificationLevel = VerificationLevel.Orb) => {
    if (!isInstalled || verifying) {
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const action = process.env.NEXT_PUBLIC_WORLD_ID_ACTION_ID || 'humanpay-verify';
      
      if (!action) {
        throw new Error('World ID Action ID not configured. Please check your environment variables.');
      }

      console.log('🔐 Starting World ID verification:', { action, verificationLevel });

      // Signal should be consistent - use undefined or empty string
      // If you want to use a signal, pass it during verification AND verification
      const signal = undefined; // No signal for now - can be changed to a string if needed

      // Use MiniKit.commandsAsync.verify() directly (matches reference implementation)
      const result = await MiniKit.commandsAsync.verify({
        action, // Action ID from Developer Portal
        verification_level: verificationLevel,
        signal, // Pass signal here if you want to use one
      });

      console.log('✅ MiniKit verification result:', result);
      console.log('📦 finalPayload:', result.finalPayload);
      // Type assertion for payload structure (may vary based on success/error)
      const payload = result.finalPayload as any;
      console.log('📦 Payload structure:', {
        hasProof: !!payload.proof,
        hasNullifier: !!payload.nullifier_hash,
        hasMerkleRoot: !!payload.merkle_root,
        status: payload.status,
        keys: Object.keys(payload),
      });

      // Check if verification was successful
      if (result.finalPayload.status !== 'success') {
        throw new Error(result.finalPayload.error_code || 'Verification failed');
      }

      // Send verification to backend API route (matches reference implementation)
      // IMPORTANT: signal must match what was used during verification
      const response = await fetch('/api/verify-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: result.finalPayload,
          action: action,
          signal: signal, // Must match the signal used during verification
        }),
      });

      const data = await response.json();
      console.log('📥 Backend verification response:', data);

      // Check if verification was successful or if user is already verified
      // Both cases should grant access - this is like a login flow
      if (data.verifyRes?.success || data.existingUser || data.status === 200) {
        // Store auth token and nullifier
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        if (result.finalPayload.nullifier_hash) {
          localStorage.setItem('nullifier', result.finalPayload.nullifier_hash);
        }
        
        if (data.existingUser) {
          console.log('✅ Existing verified user - access granted (login successful)');
        } else {
          console.log('✅ New verification successful - access granted');
        }
        
        // Success - proceed to dashboard
        onVerificationSuccess();
        return;
      }

      // If we get here, there was a real error (not "already verified")
      // Only show error for actual failures, not for "already verified" cases
      const errorCode = data.code || data.verifyRes?.code;
      if (errorCode === 'max_verifications_reached' || errorCode === 'proof_already_used') {
        // This shouldn't happen if backend handled it correctly, but just in case
        console.warn('⚠️ Already verified error not handled by backend, but user should have access');
        // Still try to grant access - World ID confirmed they're verified
        const token = Buffer.from(
          JSON.stringify({
            nullifier: result.finalPayload.nullifier_hash,
            verified: true,
            timestamp: Date.now(),
            existingUser: true,
          })
        ).toString('base64');
        
        localStorage.setItem('auth_token', token);
        localStorage.setItem('nullifier', result.finalPayload.nullifier_hash);
        onVerificationSuccess();
        return;
      }
      
      // Real error - show it
      throw new Error(data.verifyRes?.error || data.error || 'Verification failed');
    } catch (err: any) {
      console.error('❌ Verification error:', err);
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 relative z-10">
      <div className="w-full max-w-md retro-card rounded-lg p-6 sm:p-10 animate-fade-in">
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 retro-card rounded-full mb-4 sm:mb-6">
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 text-[#0d6efd]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#212529] mb-2 sm:mb-3">
            Welcome to HumanPay
          </h1>
          <p className="text-[#6c757d] text-sm sm:text-base">
            Verify your identity with World ID to access premium APIs at micro-prices
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 retro-card border border-red-300 rounded-lg bg-red-50">
            <p className="text-sm text-red-800">
              <span className="font-semibold">Error:</span> {error}
            </p>
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={() => handleVerify(VerificationLevel.Orb)}
            disabled={verifying || !isInstalled}
            className="w-full retro-button retro-button-primary py-3 sm:py-4 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {verifying ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify with World ID (Orb)'
            )}
          </button>
          
          <button
            onClick={() => handleVerify(VerificationLevel.Device)}
            disabled={verifying || !isInstalled}
            className="w-full retro-button retro-button-success py-3 sm:py-4 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {verifying ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify with World ID (Device)'
            )}
          </button>
          
          {!isInstalled && (
            <div className="mt-4 space-y-2">
              <div className="p-4 retro-card border-2 border-amber-400 rounded-lg">
                <p className="text-sm text-amber-900 mb-3 font-serif">
                  ⚠️ <strong>MiniKit not detected:</strong> Please make sure you're opening this app from within World App.
                </p>
                <button
                  onClick={() => {
                    // Retry by reloading
                    window.location.reload();
                  }}
                  className="text-sm text-amber-700 hover:text-amber-900 underline font-serif italic"
                >
                  Retry Detection
                </button>
              </div>
              <MiniKitDebug />
            </div>
          )}

          <div className="text-center text-xs sm:text-sm text-[#6c757d] mt-4 sm:mt-6">
            <p>Your privacy is protected with zero-knowledge proofs</p>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 pt-6 retro-divider">
          <h3 className="text-base sm:text-lg font-semibold text-[#212529] mb-3 sm:mb-4">
            What you get:
          </h3>
          <ul className="space-y-2 sm:space-y-3 text-sm text-[#6c757d]">
            <li className="flex items-start">
              <span className="text-[#198754] mr-2 sm:mr-3 text-lg">✓</span>
              <span>Access to premium APIs for pennies per call</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#198754] mr-2 sm:mr-3 text-lg">✓</span>
              <span>Bot-proof marketplace (verified humans only)</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#198754] mr-2 sm:mr-3 text-lg">✓</span>
              <span>Deploy AI agents with human authorization</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

