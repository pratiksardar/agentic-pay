/**
 * MiniKit utility functions
 * Handles MiniKit initialization and availability checks
 * Based on official World App MiniKit SDK patterns
 */

export function getMiniKit(): any {
  if (typeof window === 'undefined') {
    return null;
  }

  // Official World App MiniKit is injected as window.MiniKit
  // Check for it directly first
  const windowMiniKit = (window as any).MiniKit;
  
  if (windowMiniKit) {
    console.log('✅ Found MiniKit at window.MiniKit');
    console.log('📦 MiniKit type:', typeof windowMiniKit);
    console.log('📦 MiniKit keys:', typeof windowMiniKit === 'object' ? Object.keys(windowMiniKit) : 'N/A');
    
    // Check if it has isInstalled method (official API)
    if (typeof windowMiniKit.isInstalled === 'function') {
      try {
        const installed = windowMiniKit.isInstalled();
        console.log('📱 MiniKit.isInstalled():', installed);
        if (installed) {
          return windowMiniKit;
        }
      } catch (e) {
        console.warn('MiniKit.isInstalled() error:', e);
      }
    }
    
    // If MiniKit exists but no isInstalled, still return it
    // (some versions might not have isInstalled)
    return windowMiniKit;
  }

  // Check for React Native WebView bridge (World App uses React Native)
  if ((window as any).ReactNativeWebView) {
    const webView = (window as any).ReactNativeWebView;
    if (webView.MiniKit) {
      console.log('✅ Found MiniKit via ReactNativeWebView');
      return webView.MiniKit;
    }
    // Sometimes MiniKit might be accessed through postMessage
    if (webView.postMessage) {
      console.log('📡 ReactNativeWebView.postMessage available');
    }
  }

  // Check for webkit message handlers (iOS)
  if ((window as any).webkit?.messageHandlers?.MiniKit) {
    console.log('✅ Found MiniKit via webkit messageHandlers');
    return (window as any).webkit.messageHandlers.MiniKit;
  }

  // Debug: Log all window properties that might be related
  const relevantKeys = Object.keys(window).filter(k => {
    const lower = k.toLowerCase();
    return lower.includes('mini') || 
           lower.includes('world') || 
           lower.includes('reactnative') ||
           lower.includes('webview');
  });
  
  if (relevantKeys.length > 0) {
    console.log('🔍 Found potentially relevant window keys:', relevantKeys);
  }

  return null;
}

export function isMiniKitAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // First check if window.MiniKit exists
  const windowMiniKit = (window as any).MiniKit;
  if (!windowMiniKit) {
    console.log('❌ window.MiniKit not found');
    return false;
  }

  // Use official isInstalled() method if available
  if (typeof windowMiniKit.isInstalled === 'function') {
    try {
      const installed = windowMiniKit.isInstalled();
      console.log('📱 MiniKit.isInstalled():', installed);
      return installed;
    } catch (e) {
      console.warn('MiniKit.isInstalled() error:', e);
      // If isInstalled fails but MiniKit exists, assume it's available
      return true;
    }
  }

  // If MiniKit exists but no isInstalled method, check for other indicators
  // Check if it has commandsAsync (indicates it's the real MiniKit)
  if (windowMiniKit.commandsAsync || windowMiniKit.commands) {
    console.log('📱 MiniKit found with commands - assuming available');
    return true;
  }

  // If MiniKit object exists, assume it's available
  console.log('📱 MiniKit object found - assuming available');
  return true;
}

/**
 * Verify with World ID using MiniKit
 * This follows the official pattern from World App documentation
 */
export async function verifyWithWorldID(
  action: string,
  verificationLevel: 'Orb' | 'Device' = 'Orb',
  signal?: string
): Promise<any> {
  // Import MiniKit dynamically to avoid SSR issues
  const { MiniKit } = await import('@worldcoin/minikit-js');

  if (!MiniKit || !MiniKit.commandsAsync) {
    throw new Error('MiniKit is not available. Please open this app in World App.');
  }

  console.log('🔐 Attempting World ID verification with:', { action, verificationLevel, signal });

  try {
    // Use the official MiniKit.commandsAsync.verify() method
    const result = await MiniKit.commandsAsync.verify({
      action, // Action ID from Developer Portal
      verification_level: verificationLevel as any,
      ...(signal && { signal }), // Optional signal
    });
    
    console.log('✅ MiniKit verification result:', result);
    console.log('📦 finalPayload:', result.finalPayload);
    
    // Return the full result with finalPayload (matches reference implementation)
    return result;
  } catch (error: any) {
    console.error('❌ MiniKit.commandsAsync.verify() error:', error);
    throw error;
  }
}

