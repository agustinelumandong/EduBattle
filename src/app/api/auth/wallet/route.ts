import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("🔗 Wallet authentication attempt started");
  try {
    const { address, username } = await request.json();
    console.log("📝 Wallet data received:", {
      address: address?.slice(0, 10) + "...",
      username,
    });

    // Validate inputs
    if (!address || !username) {
      return NextResponse.json(
        { success: false, error: "Wallet address and username are required" },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { success: false, error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    if (username.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Username must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists with this wallet
    console.log("🔍 Checking for existing wallet user...");
    const existingUser = await database.findUserByWallet(address);
    if (existingUser) {
      console.log("✅ Existing wallet user found:", existingUser.username);
      return NextResponse.json({
        success: true,
        user: {
          id: existingUser.id,
          username: existingUser.username,
          isGuest: false,
          walletAddress: existingUser.walletAddress,
        },
      });
    }

    // Create new wallet user
    console.log("👤 Creating new wallet user...");
    const user = await database.createUser({
      username: username.trim(),
      walletAddress: address,
      isGuest: false,
    });

    console.log("✅ Wallet user created successfully:", {
      id: user.id,
      username: user.username,
      walletAddress: user.walletAddress,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        isGuest: false,
        walletAddress: user.walletAddress,
      },
    });
  } catch (error) {
    console.error("Wallet authentication error:", error);

    let errorMessage = "Wallet authentication failed";
    if (error instanceof Error) {
      if (error.message.includes("connect")) {
        errorMessage =
          "Database connection failed. Please check your DATABASE_URL environment variable.";
      } else if (error.message.includes("Prisma")) {
        errorMessage =
          "Database query failed. Please ensure your database is properly set up.";
      }

      if (process.env.NODE_ENV === "development") {
        errorMessage = `${errorMessage} Details: ${error.message}`;
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
