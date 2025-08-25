import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
} from "@worldcoin/minikit-js";
import { database } from "@/lib/database";

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload;
  nonce: string;
}

/**
 * API route to complete and verify Sign in with Ethereum (SIWE) authentication
 * This verifies the blockchain signature and completes the login process
 */
export async function POST(req: NextRequest) {
  try {
    const { payload, nonce } = (await req.json()) as IRequestPayload;

    // Verify nonce matches what we stored earlier
    const cookieStore = await cookies();
    const storedNonce = cookieStore.get("siwe")?.value;

    if (nonce !== storedNonce) {
      return NextResponse.json(
        {
          status: "error",
          isValid: false,
          message: "Invalid or expired nonce",
        },
        { status: 400 }
      );
    }

    // Verify the SIWE signature using MiniKit's verification
    const validMessage = await verifySiweMessage(payload, nonce);

    if (validMessage.isValid) {
      // Clear the used nonce
      cookieStore.delete("siwe");

      // ✅ Return success for signature verification only
      // Database registration will be handled by the frontend
      return NextResponse.json({
        status: "success",
        isValid: true,
        address: payload.address,
        message: "Authentication successful",
      });
    } else {
      return NextResponse.json(
        {
          status: "error",
          isValid: false,
          message: "Invalid signature verification",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("SIWE verification error:", error);
    return NextResponse.json(
      {
        status: "error",
        isValid: false,
        message: error.message || "Authentication verification failed",
      },
      { status: 500 }
    );
  }
}
