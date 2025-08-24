import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to generate a secure nonce for blockchain authentication
 * The nonce must be at least 8 alphanumeric characters and stored securely
 */
export async function GET(req: NextRequest) {
  try {
    // Generate a secure nonce (at least 8 alphanumeric characters)
    const nonce = crypto.randomUUID().replace(/-/g, '');

    // Store nonce in secure, non-tamperable cookie
    // In production, you might want to HMAC this with a secret key
    const cookieStore = await cookies();
    cookieStore.set('siwe', nonce, { 
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 15 // 15 minutes expiry
    });

    return NextResponse.json({ nonce });
  } catch (error) {
    console.error('Failed to generate nonce:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication nonce' },
      { status: 500 }
    );
  }
}