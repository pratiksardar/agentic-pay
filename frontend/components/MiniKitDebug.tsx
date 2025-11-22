'use client';

import { useState, useEffect } from 'react';
import { getMiniKit, isMiniKitAvailable } from '@/lib/minikit';

export function MiniKitDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const gatherDebugInfo = () => {
      const info: any = {
        timestamp: new Date().toISOString(),
        window: {
          hasMiniKit: !!(window as any).MiniKit,
          hasReactNativeWebView: !!(window as any).ReactNativeWebView,
          hasWebKit: !!(window as any).webkit,
          userAgent: navigator.userAgent,
        },
        minikit: {
          detected: !!getMiniKit(),
          available: isMiniKitAvailable(),
        },
        windowKeys: {
          all: Object.keys(window).length,
          miniRelated: Object.keys(window).filter(k => 
            k.toLowerCase().includes('mini') || 
            k.toLowerCase().includes('world')
          ),
          reactNative: Object.keys(window).filter(k => 
            k.toLowerCase().includes('react') || 
            k.toLowerCase().includes('native')
          ),
        },
      };

      // Try to inspect MiniKit if available
      if ((window as any).MiniKit) {
        const kit = (window as any).MiniKit;
        const details: any = {
          type: typeof kit,
          isFunction: typeof kit === 'function',
          isObject: typeof kit === 'object',
          allKeys: typeof kit === 'object' ? Object.keys(kit) : [],
          methods: typeof kit === 'object' ? Object.keys(kit).filter(k => typeof kit[k] === 'function') : [],
          hasIsInstalled: typeof kit.isInstalled === 'function',
          hasCommandsAsync: !!kit.commandsAsync,
          hasCommands: !!kit.commands,
          hasVerify: typeof kit.verify === 'function',
          hasVerifyProof: typeof kit.verifyProof === 'function',
        };
        
        // Check isInstalled if available
        if (typeof kit.isInstalled === 'function') {
          try {
            details.isInstalledResult = kit.isInstalled();
          } catch (e) {
            details.isInstalledError = String(e);
          }
        }
        
        // Check commandsAsync structure
        if (kit.commandsAsync) {
          details.commandsAsyncKeys = Object.keys(kit.commandsAsync);
          details.hasCommandsAsyncVerify = typeof kit.commandsAsync.verify === 'function';
        }
        
        // Check commands structure
        if (kit.commands) {
          details.commandsKeys = Object.keys(kit.commands);
        }
        
        info.minikit.details = details;
      }

      setDebugInfo(info);
    };

    gatherDebugInfo();
    const interval = setInterval(gatherDebugInfo, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!debugInfo) {
    return null;
  }

  return (
    <details className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-xs">
      <summary className="cursor-pointer text-gray-700 font-medium mb-2">
        🔍 MiniKit Debug Information
      </summary>
      <div className="mt-2 space-y-2">
        <div>
          <strong>MiniKit Detected:</strong> {debugInfo.minikit.detected ? '✅ Yes' : '❌ No'}
        </div>
        <div>
          <strong>MiniKit Available:</strong> {debugInfo.minikit.available ? '✅ Yes' : '❌ No'}
        </div>
        <div>
          <strong>Window.MiniKit:</strong> {debugInfo.window.hasMiniKit ? '✅ Present' : '❌ Missing'}
        </div>
        <div>
          <strong>ReactNativeWebView:</strong> {debugInfo.window.hasReactNativeWebView ? '✅ Present' : '❌ Missing'}
        </div>
        {debugInfo.minikit.details && (
          <div className="mt-2 p-2 bg-white rounded border">
            <strong>MiniKit Details:</strong>
            <pre className="mt-1 text-xs overflow-auto">
              {JSON.stringify(debugInfo.minikit.details, null, 2)}
            </pre>
          </div>
        )}
        <div className="mt-2">
          <strong>Window Keys (Mini/World related):</strong>
          <ul className="list-disc list-inside ml-2">
            {debugInfo.windowKeys.miniRelated.map((key: string) => (
              <li key={key}>{key}</li>
            ))}
            {debugInfo.windowKeys.miniRelated.length === 0 && (
              <li className="text-gray-500">None found</li>
            )}
          </ul>
        </div>
        <div className="mt-2">
          <strong>User Agent:</strong>
          <div className="text-xs text-gray-600 break-all">{debugInfo.window.userAgent}</div>
        </div>
      </div>
    </details>
  );
}

