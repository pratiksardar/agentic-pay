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

export async function verifyWithWorldID(signal: string, action: string, appId: string, minikitInstance?: any): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('MiniKit is only available in browser/World App environment');
  }

  // Use provided instance or try to get it
  let minikit = minikitInstance;
  if (!minikit) {
    minikit = getMiniKit();
  }
  
  if (!minikit) {
    throw new Error('MiniKit is not available. Please open this app in World App.');
  }

  console.log('🔐 Attempting World ID verification with:', { signal, action, appId });
  console.log('📦 MiniKit object:', minikit);
  console.log('📦 MiniKit type:', typeof minikit);
  
  // World App MiniKit API - according to docs, use commandsAsync.verify()
  // Pattern 1: commandsAsync.verify (official API)
  if (minikit.commandsAsync && typeof minikit.commandsAsync.verify === 'function') {
    try {
      console.log('🔄 Trying MiniKit.commandsAsync.verify()...');
      const verifyPayload = {
        action: action, // Action ID from Developer Portal
        signal: signal, // Optional signal
        verification_level: 'Orb', // 'Orb' or 'Device'
      };
      
      const result = await minikit.commandsAsync.verify(verifyPayload);
      console.log('✅ Verification result:', result);
      
      // The result should have finalPayload with status
      if (result.finalPayload && result.finalPayload.status === 'success') {
        return {
          success: true,
          proof: result.finalPayload.proof,
          nullifier: result.finalPayload.nullifier_hash,
          merkle_root: result.finalPayload.merkle_root,
        };
      } else {
        throw new Error(result.finalPayload?.error || 'Verification failed');
      }
    } catch (error: any) {
      console.error('❌ MiniKit.commandsAsync.verify() error:', error);
      throw error;
    }
  }

  // Pattern 2: Direct verify method (alternative API)
  if (typeof minikit.verify === 'function') {
    try {
      console.log('🔄 Trying minikit.verify()...');
      const result = await minikit.verify({
        signal,
        action,
        app_id: appId,
      });
      console.log('✅ Verification result:', result);
      return result;
    } catch (error: any) {
      console.error('❌ MiniKit.verify() error:', error);
      // Don't throw yet, try other methods
    }
  }

  // Pattern 3: verifyProof method
  if (typeof minikit.verifyProof === 'function') {
    try {
      console.log('🔄 Trying minikit.verifyProof()...');
      const result = await minikit.verifyProof({
        signal,
        action,
        app_id: appId,
      });
      console.log('✅ Verification result:', result);
      return result;
    } catch (error: any) {
      console.error('❌ MiniKit.verifyProof() error:', error);
    }
  }

  // Debug: Log available methods and structure
  const availableMethods = typeof minikit === 'object' 
    ? Object.keys(minikit).filter(k => typeof minikit[k] === 'function' || (typeof minikit[k] === 'object' && minikit[k] !== null))
    : [];
  console.error('❌ MiniKit verify method not found');
  console.error('📋 Available properties:', availableMethods);
  console.error('📋 Has commandsAsync:', !!minikit.commandsAsync);
  console.error('📋 Has commands:', !!minikit.commands);
  console.error('📋 Full MiniKit object:', minikit);
  
  throw new Error(`MiniKit verify method not found. Available: ${availableMethods.join(', ') || 'none'}. Expected: commandsAsync.verify() or verify().`);
}

