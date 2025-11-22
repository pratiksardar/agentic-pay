/**
 * API Configuration - Handles different environments (local, zrok, etc.)
 */

/**
 * Get the backend API URL based on current environment
 * - If accessed via zrok/ngrok, use the same domain for backend
 * - Otherwise, use NEXT_PUBLIC_API_URL or localhost
 */
export function getApiUrl(): string {
  // Check if we have an explicit API URL set
  const explicitUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Log the API URL being used for debugging
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    console.log('🌐 Frontend origin:', origin);
    console.log('🔗 Backend API URL:', explicitUrl || 'http://localhost:5001 (default)');
    
    // If accessed via zrok/ngrok tunnel, check if explicit URL is also a tunnel
    if (origin.includes('.share.zrok.io') || 
        origin.includes('.ngrok.io') || 
        origin.includes('.ngrok-free.app')) {
      // If explicit URL is set and is also a tunnel URL, use it
      if (explicitUrl && (explicitUrl.includes('.share.zrok.io') || 
                         explicitUrl.includes('.ngrok.io') || 
                         explicitUrl.includes('.ngrok-free.app'))) {
        console.log('✅ Using explicit tunnel URL for backend:', explicitUrl);
        return explicitUrl;
      }
      // If explicit URL is localhost but we're on a tunnel, that won't work
      // Log a warning and use the explicit URL anyway (user should update it)
      if (explicitUrl && explicitUrl.includes('localhost')) {
        console.error('❌ Frontend is on tunnel but backend URL is localhost!');
        console.error('⚠️ Update NEXT_PUBLIC_API_URL in .env to your backend tunnel URL.');
        console.error('⚠️ Current backend URL:', explicitUrl);
        console.error('⚠️ This will NOT work from World App on mobile!');
      }
    }
  }
  
  // Default: use explicit URL or fallback to localhost
  const finalUrl = explicitUrl || 'http://localhost:5001';
  if (typeof window !== 'undefined') {
    console.log('📍 Final API URL:', finalUrl);
  }
  return finalUrl;
}

/**
 * Check if we're running through a tunnel/proxy
 */
export function isTunnelMode(): boolean {
  if (typeof window === 'undefined') return false;
  const origin = window.location.origin;
  return origin.includes('.share.zrok.io') || 
         origin.includes('.ngrok.io') || 
         origin.includes('.ngrok-free.app');
}

