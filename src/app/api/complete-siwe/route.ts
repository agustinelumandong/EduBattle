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

        // 🆕 IMPROVED USERNAME GENERATION: Create better usernames
        let username = "";

        // Generate a user-friendly username from wallet address
        // MiniKit payload doesn't contain user data, so we generate from address
        const shortAddress = payload.address.slice(2, 8); // Remove 0x, get 6 chars
        username = `Player_${shortAddress}`;
        console.log("✅ Generated username from wallet address:", username);

        // Ensure username is valid and unique
        if (!username || username.length < 3) {
          const shortAddress = payload.address.slice(2, 8);
          username = `Player_${shortAddress}`;
          console.log("🔄 Username was invalid, using fallback:", username);
        }

        console.log("🎯 Final username for database:", username);

        // Check if user already exists
        const existingUser = await database.findUserByWallet(payload.address);

        if (existingUser) {
          console.log(
            "✅ User already exists in database:",
            existingUser.username
          );

          // Update username if it's different
          if (existingUser.username !== username) {
            console.log(
              "🔄 Updating username from",
              existingUser.username,
              "to",
              username
            );
            try {
              const updatedUser = await database.updateUser(existingUser.id, {
                username,
              });
              console.log(
                "✅ Username updated successfully:",
                updatedUser.username
              );
              return NextResponse.json({
                status: "success",
                isValid: true,
                address: payload.address,
                message: "Authentication successful - username updated",
                user: updatedUser,
              });
            } catch (updateError: any) {
              console.error(
                "❌ Failed to update username:",
                updateError.message
              );
              // Return existing user if update fails
              return NextResponse.json({
                status: "success",
                isValid: true,
                address: payload.address,
                message: "Authentication successful - user already registered",
                user: existingUser,
              });
            }
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
