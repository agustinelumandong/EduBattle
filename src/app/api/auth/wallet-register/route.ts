import { database } from "@/lib/database";
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
    console.log("🔐 Wallet registration from frontend");

    const { address, username } = await req.json();
    console.log("📝 Frontend data:", {
      address: address?.slice(0, 10) + "...",
      username,
      addressLength: address?.length,
      usernameLength: username?.length,
    });

    if (!address || !username) {
      console.error("❌ Missing required fields:", {
        address: !!address,
        username: !!username,
      });
      return NextResponse.json(
        { success: false, error: "Wallet address and username required" },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      console.error("❌ Invalid wallet address format:", address);
      return NextResponse.json(
        { success: false, error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    // Try to save using database service first
    try {
      console.log("💾 Attempting to save with database service...");

      const user = await database.createUser({
        email: "",
        username: username,
        authMethod: "wallet",
        walletAddress: address,
        passwordHash: "",
      });

      console.log("✅ SUCCESS: User saved via database service:", {
        id: user.id,
        username: user.username,
        authMethod: user.authMethod,
      });

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          authMethod: user.authMethod,
          walletAddress: user.walletAddress,
        },
      });
    } catch (dbError: any) {
      console.error("❌ Database service failed:", dbError.message);
      console.error("🔍 Error details:", {
        name: dbError.name,
        code: dbError.code,
        meta: dbError.meta,
        stack: dbError.stack,
      });

      // Fallback: Try direct Prisma with raw SQL
      console.log("🔄 Trying direct SQL approach...");
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();

      try {
        // Use upsert to handle both insert and update
        const result = await prisma.$executeRaw`
          INSERT INTO users (id, username, "authMethod", "walletAddress", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${username}, 'wallet', ${address}, NOW(), NOW())
          ON CONFLICT ("walletAddress") 
          DO UPDATE SET 
            username = EXCLUDED.username,
            "updatedAt" = NOW()
        `;

        console.log("✅ RAW SQL SUCCESS: User saved via direct SQL");

        return NextResponse.json({
          success: true,
          user: {
            username: username,
            authMethod: "wallet",
            walletAddress: address,
          },
        });
      } catch (rawError: any) {
        console.error("❌ Raw SQL also failed:", rawError.message);
        console.error("🔍 Raw SQL error details:", {
          name: rawError.name,
          code: rawError.code,
          meta: rawError.meta,
        });
        throw rawError;
      } finally {
        await prisma.$disconnect();
      }
    }
  } catch (error: any) {
    console.error("❌ ALL ATTEMPTS FAILED to save wallet user for leaderboard");
    console.error("🔍 Final error:", error.message);
    console.error("🔍 Error stack:", error.stack);

    return NextResponse.json(
      {
        success: false,
        error: "Could not save wallet user for leaderboard: " + error.message,
      },
      { status: 500 }
    );
  }
}
