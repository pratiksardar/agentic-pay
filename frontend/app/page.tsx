'use client';

import { useEffect, useState } from 'react';
import { WorldIDVerifier } from '@/components/WorldIDVerifier';
import { Dashboard } from '@/components/Dashboard';

// MiniKit type definition
interface MiniKitType {
  isInstalled: () => boolean;
  commandsAsync?: {
    verify: (payload: { action: string; signal?: string; verification_level?: string }) => Promise<{
      finalPayload?: {
        status: string;
        proof?: unknown;
        nullifier_hash?: string;
        merkle_root?: string;
        error?: string;
      };
    }>;
  };
  [key: string]: unknown;
}

declare global {
  interface Window {
    MiniKit?: MiniKitType;
  }
}

export default function Home() {
  // Check if World ID verification is enabled via feature flag
  const worldIdEnabled = process.env.NEXT_PUBLIC_ENABLE_WORLD_ID_VERIFICATION !== 'false';
  
  // Initialize verified state from localStorage or feature flag
  const [isVerified, setIsVerified] = useState(() => {
    if (typeof window !== 'undefined') {
      // If World ID is disabled, auto-verify for testing
      if (!worldIdEnabled) {
        console.log('⚠️ World ID verification is DISABLED (testing mode)');
        // Create mock auth token and nullifier for testing
        const mockData = {
          nullifier: 'test-nullifier-1234567890abcdef',
          verified: true,
          timestamp: Date.now(),
          testMode: true,
        };
        // Use btoa for base64 encoding in browser
        const mockToken = btoa(JSON.stringify(mockData));
        localStorage.setItem('auth_token', mockToken);
        localStorage.setItem('nullifier', 'test-nullifier-1234567890abcdef');
        localStorage.setItem('world_id_verified', 'true');
        return true;
      }
      return localStorage.getItem('world_id_verified') === 'true';
    }
    return false;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If World ID is disabled, skip MiniKit check and go straight to dashboard
    if (!worldIdEnabled) {
      console.log('✅ World ID verification disabled - skipping to dashboard');
      setLoading(false);
      return;
    }

    // Check MiniKit availability using official API
    const checkMiniKit = () => {
      if (typeof window === 'undefined') return false;
      
      const minikit = window.MiniKit;
      if (minikit && typeof minikit.isInstalled === 'function') {
        const installed = minikit.isInstalled();
        console.log('📱 MiniKit.isInstalled():', installed);
        return installed;
      }
      return false;
    };

    // MiniKit might load asynchronously - check with delays
    const delays = [0, 100, 300, 500, 1000, 2000];
    const timers: NodeJS.Timeout[] = [];
    
    delays.forEach((delay) => {
      const timer = setTimeout(() => {
        if (checkMiniKit()) {
          setLoading(false);
          timers.forEach(t => clearTimeout(t));
        } else if (delay === delays[delays.length - 1]) {
          // Last attempt
          console.warn('⚠️ MiniKit not available. Make sure you\'re opening this app from within World App.');
          setLoading(false);
        }
      }, delay);
      timers.push(timer);
    });

    // Also check on window load
    const handleLoad = () => {
      if (checkMiniKit()) {
        setLoading(false);
      }
    };
    
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(handleLoad, 0);
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      window.removeEventListener('load', handleLoad);
    };
  }, [worldIdEnabled]);

  const handleVerificationSuccess = () => {
    setIsVerified(true);
    localStorage.setItem('world_id_verified', 'true');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0d6efd] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#6c757d]">Loading HumanPay...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#f8f9fa]">
      {!worldIdEnabled || isVerified ? (
        <Dashboard />
      ) : (
        <WorldIDVerifier onVerificationSuccess={handleVerificationSuccess} />
      )}
    </div>
  );
}
