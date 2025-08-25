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

        // 🆕 IMPROVED USERNAME HANDLING for Apple vs Android compatibility
        console.log("📱 Device compatibility check - Payload details:", {
          address: payload.address,
          // Log available fields for debugging
          allFields: Object.keys(payload),
        });

        // Try to get username from multiple sources (iOS vs Android compatibility)
        let username = "";

        // Priority 1: Try to get username from MiniKit user data (Android)
        // Note: MiniKit payload structure may vary between devices
        if ((payload as any).user?.username) {
          username = (payload as any).user.username;
          console.log("✅ Got username from MiniKit user data:", username);
        }
        // Priority 2: Try to get username from payload directly (iOS fallback)
        else if ((payload as any).username) {
          username = (payload as any).username;
          console.log("✅ Got username from payload directly:", username);
        }
        // Priority 3: Generate user-friendly username from wallet address
        else {
          // Create a more user-friendly username
          const shortAddress = payload.address.slice(2, 8); // Remove 0x and get 6 chars
          username = `Player_${shortAddress}`;
          console.log("⚠️ No username found, generated fallback:", username);
        }

        // Ensure username is not empty and has reasonable length
        if (!username || username.length < 3) {
          const shortAddress = payload.address.slice(2, 8);
          username = `Player_${shortAddress}`;
          console.log("🔄 Username was invalid, using fallback:", username);
        }

        console.log("🎯 Final username selected:", username);

        // Check if user already exists
        const existingUser = await database.findUserByWallet(payload.address);

        if (existingUser) {
          console.log(
            "✅ User already exists in database:",
            existingUser.username
          );

          // 🆕 Update username if it's different (for returning users)
          if (
            existingUser.username !== username &&
            username !== `Player_${payload.address.slice(2, 8)}`
          ) {
            console.log("🔄 Updating username for existing user:", {
              old: existingUser.username,
              new: username,
            });

            // Update the username in database
            const updatedUser = await database.updateUser(existingUser.id, {
              username,
            });
            console.log("✅ Username updated:", updatedUser.username);

            return NextResponse.json({
              status: "success",
              isValid: true,
              address: payload.address,
              message: "Authentication successful - user updated",
              user: updatedUser,
            });
          }

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
