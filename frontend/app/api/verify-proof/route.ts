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
        status: payload.status,
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

    if (verifyRes.success) {
      // This is where you should perform backend actions if the verification succeeds
      // Such as, setting a user as "verified" in a database
      // For now, we'll generate a simple token
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
      // This is where you should handle errors from the World ID /verify endpoint.
      // Common errors:
      // - invalid_proof: Action ID doesn't exist or proof is malformed
      // - proof_already_used: User already verified this action (unless using different signal)
      // - invalid_app_id: App ID doesn't match
      const errorMessage = verifyRes.error || verifyRes.detail || 'Verification failed';
      const errorCode = verifyRes.code || 'unknown_error';
      
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
            : errorCode === 'proof_already_used'
            ? 'This action has already been verified. Use a different signal or action ID for new verifications.'
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

