import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("🧪 Testing wallet registration...");
    
    const testWallet = {
      address: "0x1234567890123456789012345678901234567890",
      username: "TestWalletUser"
    };

    console.log("📧 Test wallet data:", testWallet);

    // Step 1: Check if wallet user exists
    console.log("🔍 Step 1: Checking if wallet exists...");
    const existingUser = await database.findUserByWallet(testWallet.address);
    console.log("✅ Step 1 completed:", { userExists: !!existingUser });

    if (!existingUser) {
      // Step 2: Create wallet user
      console.log("👤 Step 2: Creating wallet user...");
      const user = await database.createUser({
        walletAddress: testWallet.address,
        username: testWallet.username,
        authMethod: "wallet",
      });
      console.log("✅ Step 2 completed:", { userId: user.id, username: user.username });

      return NextResponse.json({
        success: true,
        message: "Wallet user created successfully",
        user: {
          id: user.id,
          username: user.username,
          walletAddress: user.walletAddress,
          authMethod: user.authMethod
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "Wallet user already exists",
        user: {
          id: existingUser.id,
          username: existingUser.username,
          walletAddress: existingUser.walletAddress,
          authMethod: existingUser.authMethod
        }
      });
    }

  } catch (error) {
    console.error("❌ Wallet test failed:", error);
    
    return NextResponse.json({
      success: false,
      error: "Wallet test failed",
      details: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : "Unknown error"
    }, { status: 500 });
  }
}
