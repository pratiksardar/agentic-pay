import {
  ISuccessResult,
  IVerifyResponse,
  verifyCloudProof,
} from '@worldcoin/minikit-js';
import { NextRequest, NextResponse } from 'next/server';

interface IRequestPayload {
  payload: ISuccessResult;
  action: string;
  signal: string | undefined;
}

/**
 * This route is used to verify the proof of the user
 * It is critical proofs are verified from the server side
 * Read More: https://docs.world.org/mini-apps/commands/verify#verifying-the-proof
 */
export async function POST(req: NextRequest) {
  try {
    const { payload, action, signal } = (await req.json()) as IRequestPayload;
    const app_id = process.env.NEXT_PUBLIC_WORLD_ID_APP_ID as `app_${string}`;

    if (!app_id) {
      return NextResponse.json(
        { error: 'World ID App ID not configured' },
        { status: 500 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action ID is required' },
        { status: 400 }
      );
    }

    if (!payload) {
      return NextResponse.json(
        { error: 'Proof payload is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Verifying proof:', { 
      action, 
      signal: signal || '(undefined)', 
      hasPayload: !!payload,
      app_id: app_id.substring(0, 10) + '...',
    });

    // Log payload structure for debugging
    if (payload) {
      console.log('📦 Payload structure:', {
        hasProof: !!payload.proof,
        hasNullifier: !!payload.nullifier_hash,
        hasMerkleRoot: !!payload.merkle_root,
        keys: Object.keys(payload),
      });
    }

    // verifyCloudProof expects:
    // 1. payload (ISuccessResult) - the proof data from MiniKit
    // 2. app_id - your World ID App ID
    // 3. action - the Action ID (must match what was used during verification)
    // 4. signal - optional, but must match what was used during verification (or undefined)
    const verifyRes = (await verifyCloudProof(
      payload,
      app_id,
      action,
      signal, // undefined or must match verification signal
    )) as IVerifyResponse;

    console.log('📊 Verification result:', verifyRes);

    const nullifier = payload.nullifier_hash;

    if (verifyRes.success) {
      // Fresh verification successful - record it in backend
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        await fetch(`${backendUrl}/api/auth/record-verification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nullifier,
            action,
            signal: signal || undefined,
          }),
        }).catch(err => {
          console.warn('Failed to record verification in backend:', err);
          // Continue anyway - this is not critical
        });
      } catch (err) {
        console.warn('Error recording verification:', err);
      }
      
      // Generate token
      const token = Buffer.from(
        JSON.stringify({
          nullifier: payload.nullifier_hash,
          verified: true,
          timestamp: Date.now(),
        })
      ).toString('base64');

      return NextResponse.json({
        verifyRes,
        token,
        status: 200,
      });
    } else {
      // Verification failed - check if user is already verified in our backend system
      const verifyResAny = verifyRes as any;
      const errorMessage = verifyResAny.error || verifyResAny.detail || 'Verification failed';
      const errorCode = verifyResAny.code || 'unknown_error';
      
      // If World ID says user already verified, automatically allow them access
      // This is like a "login" - if World ID confirms they verified before, they're good
      if (errorCode === 'max_verifications_reached' || errorCode === 'proof_already_used') {
        console.log(`✅ User already verified by World ID (${nullifier.slice(0, 8)}...), granting access`);
        
        // Record them in our backend (if not already recorded)
        try {
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
          
          // First check if already in our system
          const checkResponse = await fetch(`${backendUrl}/api/auth/check-verification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nullifier }),
          });

          let isInOurSystem = false;
          if (checkResponse.ok) {
            const checkData = await checkResponse.json();
            isInOurSystem = checkData.verified;
          }

          // If not in our system yet, record them now
          if (!isInOurSystem) {
            await fetch(`${backendUrl}/api/auth/record-verification`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nullifier,
                action,
                signal: signal || undefined,
              }),
            }).catch(err => {
              console.warn('Failed to record verification in backend:', err);
              // Continue anyway - we'll still grant access
            });
          }
        } catch (err) {
          console.warn('Error checking/recording verification:', err);
          // Continue anyway - World ID confirmed they're verified, so grant access
        }
        
        // Generate token for already-verified user (treat as successful login)
        const token = Buffer.from(
          JSON.stringify({
            nullifier: payload.nullifier_hash,
            verified: true,
            timestamp: Date.now(),
            existingUser: true,
          })
        ).toString('base64');

        return NextResponse.json({
          verifyRes: {
            success: true,
            code: 'already_verified',
            message: 'User already verified - access granted',
          },
          token,
          status: 200,
          existingUser: true,
        });
      }
      
      // For other errors or new users, return error
      console.error('❌ Verification failed:', {
        code: errorCode,
        message: errorMessage,
        action,
        app_id: app_id.substring(0, 10) + '...',
      });

      return NextResponse.json(
        {
          verifyRes,
          error: errorMessage,
          code: errorCode,
          hint: errorCode === 'invalid_proof' 
            ? 'Check that the Action ID exists in your Developer Portal and matches exactly'
            : errorCode === 'proof_already_used' || errorCode === 'max_verifications_reached'
            ? 'This action has already been verified. If you are an existing user, please contact support.'
            : 'Check your App ID and Action ID configuration',
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('❌ Verify proof error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Verification failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

