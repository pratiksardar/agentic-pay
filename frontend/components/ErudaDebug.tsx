'use client';

import { useEffect } from 'react';

/**
 * Eruda Mobile Debugger
 * Loads Eruda console for debugging on mobile devices
 * Controlled by NEXT_PUBLIC_ENABLE_ERUDA environment variable
 */
export function ErudaDebug() {
  useEffect(() => {
    // Only load in browser
    if (typeof window === 'undefined') return;

    // Check if Eruda is enabled via environment variable
    const isEnabled = process.env.NEXT_PUBLIC_ENABLE_ERUDA === 'true';

    if (!isEnabled) {
      console.log('📱 Eruda debugger is disabled (set NEXT_PUBLIC_ENABLE_ERUDA=true to enable)');
      return;
    }

    // Check if Eruda is already loaded
    if ((window as any).eruda) {
      console.log('📱 Eruda already loaded');
      return;
    }

    console.log('📱 Loading Eruda mobile debugger...');

    // Load Eruda from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/eruda@3.4.3/eruda.min.js';
    script.onload = () => {
      if ((window as any).eruda) {
        (window as any).eruda.init();
        console.log('✅ Eruda mobile debugger loaded successfully!');
        console.log('📱 Click the floating button to open console');
      }
    };
    script.onerror = () => {
      console.error('❌ Failed to load Eruda debugger');
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
      if ((window as any).eruda) {
        try {
          (window as any).eruda.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  return null; // This component doesn't render anything
}
