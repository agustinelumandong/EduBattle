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

      // 🆕 CRITICAL FIX: Automatically register user in database after successful verification
      try {
        console.log(
          "🔐 SIWE verification successful, registering user in database..."
        );

        // Generate username from wallet address if not provided
        const username = `Player_${payload.address.slice(0, 6)}`;

        // Check if user already exists
        const existingUser = await database.findUserByWallet(payload.address);

        if (existingUser) {
          console.log(
            "✅ User already exists in database:",
            existingUser.username
          );
          return NextResponse.json({
            status: "success",
            isValid: true,
            address: payload.address,
            message: "Authentication successful - user already registered",
            user: existingUser,
          });
        }

        // Create new user in database
        const newUser = await database.createUser({
          email: "",
          username: username,
          authMethod: "wallet",
          walletAddress: payload.address,
          passwordHash: "",
        });

        console.log("✅ New wallet user registered in database:", {
          id: newUser.id,
          username: newUser.username,
          address: newUser.walletAddress,
        });

        return NextResponse.json({
          status: "success",
          isValid: true,
          address: payload.address,
          message: "Authentication successful - new user registered",
          user: newUser,
        });
      } catch (dbError: any) {
        console.error(
          "❌ Database registration failed during SIWE completion:",
          dbError.message
        );

        // Still return success for authentication, but log the database issue
        return NextResponse.json({
          status: "success",
          isValid: true,
          address: payload.address,
          message: "Authentication successful but database registration failed",
          warning: "User not saved to database - check logs for details",
        });
      }
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
