'use client';

import { useEffect } from 'react';

/**
 * Eruda Debug Component
 * Mobile browser console for debugging
 * https://github.com/liriliri/eruda
 * 
 * Only loads in development or when NEXT_PUBLIC_ENABLE_ERUDA=true
 */
export function ErudaDebug() {
  useEffect(() => {
    // Only load Eruda in development or when explicitly enabled
    const isDevelopment = process.env.NODE_ENV === 'development';
    const erudaEnabled = process.env.NEXT_PUBLIC_ENABLE_ERUDA === 'true';
    
    if (!isDevelopment && !erudaEnabled) {
      return;
    }

    // Dynamically import and initialize Eruda
    const initEruda = async () => {
      try {
        // Use dynamic import to avoid SSR issues
        const eruda = await import('eruda');
        eruda.default.init({
          container: document.body,
          tool: ['console', 'elements', 'network', 'resources', 'info', 'snippets', 'sources'],
          useShadowDom: true,
          autoScale: true,
          defaults: {
            displaySize: 50,
            transparency: 0.9,
            theme: 'auto',
          },
        });
        console.log('✅ Eruda debug console initialized');
      } catch (error) {
        console.error('❌ Failed to initialize Eruda:', error);
      }
    };

    initEruda();

    // Cleanup on unmount (optional)
    return () => {
      // Eruda doesn't need explicit cleanup, but we can remove it if needed
      if (typeof window !== 'undefined' && (window as any).eruda) {
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

