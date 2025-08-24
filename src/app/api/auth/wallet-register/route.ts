import { database } from "@/lib/database";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

interface WalletUserData {
  address: string;
  username?: string;
}

/**
 * API route to register/update wallet users
 * This handles both new wallet users and username updates for existing users
 */
export async function POST(req: NextRequest) {
  try {
    console.log("🔐 Wallet registration started");
    
    const { address, username } = await req.json();

    // Validate inputs
    if (!address) {
      return NextResponse.json(
        { success: false, error: "Wallet address is required" },
        { status: 400 }
      );
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { success: false, error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await database.findUserByWallet(address);
    if (existingUser) {
      console.log("✅ Existing wallet user found");
      return NextResponse.json({
        success: true,
        user: {
          id: existingUser.id,
          username: existingUser.username,
          authMethod: existingUser.authMethod,
          walletAddress: existingUser.walletAddress,
        },
      });
    }

    // Create user in database
    console.log("👤 Creating wallet user in database...");
    const defaultUsername = username || `Player_${address.slice(0, 6)}`;
    
    const user = await database.createUser({
      walletAddress: address,
      username: defaultUsername,
      authMethod: "wallet",
    });
    
    console.log("✅ Wallet user created successfully:", { userId: user.id, username: user.username });

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-for-demo";
    const token = jwt.sign(
      {
        userId: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        authMethod: user.authMethod,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        authMethod: user.authMethod,
        walletAddress: user.walletAddress,
      },
      token,
    });

  } catch (error: any) {
    console.error("❌ Wallet registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Wallet registration failed",
      },
      { status: 500 }
    );
  }
}
