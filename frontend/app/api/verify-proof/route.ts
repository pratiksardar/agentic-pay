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

    console.log('🔍 Verifying proof:', { action, signal, hasPayload: !!payload });

    const verifyRes = (await verifyCloudProof(
      payload,
      app_id,
      action,
      signal,
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
      // Usually these errors are due to a user having already verified.
      return NextResponse.json(
        {
          verifyRes,
          error: verifyRes.error || 'Verification failed',
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

