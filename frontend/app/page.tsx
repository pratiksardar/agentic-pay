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
  // Initialize verified state from localStorage
  const [isVerified, setIsVerified] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('world_id_verified') === 'true';
    }
    return false;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const handleVerificationSuccess = () => {
    setIsVerified(true);
    localStorage.setItem('world_id_verified', 'true');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading HumanPay...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {!isVerified ? (
        <WorldIDVerifier onVerificationSuccess={handleVerificationSuccess} />
      ) : (
        <Dashboard />
      )}
    </div>
  );
}
