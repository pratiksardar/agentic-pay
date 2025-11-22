'use client';

import { useEffect, useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';
import { WorldIDVerifier } from '@/components/WorldIDVerifier';
import { Dashboard } from '@/components/Dashboard';

export default function Home() {
  const [isVerified, setIsVerified] = useState(false);
  const [minikit, setMinikit] = useState<MiniKit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize MiniKit SDK
    const initMiniKit = async () => {
      try {
        const kit = await MiniKit.init({
          app_id: process.env.NEXT_PUBLIC_WORLD_ID_APP_ID || '',
        });
        setMinikit(kit);
        
        // Check if user is already verified
        const verified = localStorage.getItem('world_id_verified') === 'true';
        setIsVerified(verified);
      } catch (error) {
        console.error('Failed to initialize MiniKit:', error);
      } finally {
        setLoading(false);
      }
    };

    initMiniKit();
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
        <WorldIDVerifier 
          minikit={minikit}
          onVerificationSuccess={handleVerificationSuccess}
        />
      ) : (
        <Dashboard minikit={minikit} />
      )}
    </div>
  );
}
