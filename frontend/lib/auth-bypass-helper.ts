/**
 * Auth Bypass Helper - Makes frontend work with backend auth bypass mode
 * Use this for all API calls during development/testing
 *
 * Controlled by NEXT_PUBLIC_ENABLE_AUTH_BYPASS environment variable
 */

/**
 * Check if auth bypass is enabled via environment variable
 */
export function isAuthBypassEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_AUTH_BYPASS === 'true';
}

/**
 * Get debug nullifier for auth bypass mode
 * Returns the user's nullifier from localStorage or a debug nullifier
 */
export function getDebugNullifier(): string {
  if (typeof window === 'undefined') return 'debug-nullifier-1234567890abcdef';

  const nullifier = localStorage.getItem('nullifier');
  if (nullifier) {
    return nullifier;
  }

  // Return debug nullifier only if auth bypass is enabled
  if (isAuthBypassEnabled()) {
    return 'debug-nullifier-1234567890abcdef';
  }

  // If auth bypass is disabled and no nullifier, return empty (will need to authenticate)
  return '';
}

/**
 * Get headers for API requests with auth bypass support
 * Behavior changes based on NEXT_PUBLIC_ENABLE_AUTH_BYPASS flag:
 * - If true: No Authorization header (auth bypass mode)
 * - If false: Includes Authorization header if token exists (real auth)
 */
export function getAuthBypassHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (typeof window === 'undefined') return headers;

  const authBypassEnabled = isAuthBypassEnabled();

  if (authBypassEnabled) {
    // Auth bypass mode: Don't send Authorization header
    console.log('⚠️ Auth bypass mode - no Authorization header');
    return headers;
  }

  // Real auth mode: Send Authorization header if token exists
  const token = localStorage.getItem('auth_token');
  if (token && !token.includes('testMode')) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔐 Using Authorization token (real auth mode)');
  } else {
    console.warn('⚠️ Real auth enabled but no valid token found');
  }

  return headers;
}

/**
 * Check if we're in auth bypass/debug mode
 * @deprecated Use isAuthBypassEnabled() instead
 */
export function isAuthBypassMode(): boolean {
  return isAuthBypassEnabled();
}
