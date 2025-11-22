/**
 * X402 Client - Wrapper for x402-fetch
 * Based on: https://docs.cdp.coinbase.com/x402/quickstart-for-buyers
 */

import { wrapFetchWithPayment, decodeXPaymentResponse } from 'x402-fetch';
import { CdpClient } from '@coinbase/cdp-sdk';
import { toAccount } from 'viem/accounts';

let fetchWithPayment: ((input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) | null = null;
let account: any = null;

/**
 * Initialize X402 client with CDP wallet
 */
export async function initializeX402Client() {
  try {
    // Check if CDP credentials are available
    const apiKeyId = process.env.NEXT_PUBLIC_CDP_API_KEY_ID;
    const apiKeySecret = process.env.NEXT_PUBLIC_CDP_API_KEY_SECRET;

    if (!apiKeyId || !apiKeySecret) {
      console.warn('⚠️ CDP credentials not configured. X402 payments will use fallback.');
      // Return regular fetch for now
      return fetch;
    }

    // Initialize CDP client
    // Type assertion for CDP client options (API may have changed)
    const cdp = new CdpClient({
      apiKeyName: apiKeyId,
      privateKey: apiKeySecret,
    } as any);

    // Create account
    const cdpAccount = await cdp.evm.createAccount();
    account = toAccount(cdpAccount);

    // Wrap fetch with X402 payment handling
    fetchWithPayment = wrapFetchWithPayment(fetch, account) as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

    console.log('✅ X402 client initialized with CDP wallet');
    return fetchWithPayment;
  } catch (error) {
    console.error('❌ Failed to initialize X402 client:', error);
    // Return regular fetch as fallback
    return fetch;
  }
}

/**
 * Get X402-enabled fetch function
 * If not initialized, returns regular fetch
 */
export function getX402Fetch(): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
  if (fetchWithPayment) {
    return fetchWithPayment;
  }
  return fetch as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

/**
 * Make a paid API request with automatic X402 handling
 */
export async function makePaidRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const x402Fetch = getX402Fetch();
  
  try {
    const response = await x402Fetch(url, options);
    
    // Decode payment response if present
    const paymentHeader = response.headers.get('x-payment-response');
    if (paymentHeader) {
      const paymentResponse = decodeXPaymentResponse(paymentHeader);
      console.log('💳 Payment processed:', paymentResponse);
    }
    
    return response;
  } catch (error) {
    console.error('❌ X402 request error:', error);
    throw error;
  }
}

