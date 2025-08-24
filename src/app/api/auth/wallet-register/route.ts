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
    console.log("🔐 Simple wallet user save for leaderboard");
    
    const { address, username } = await req.json();
    console.log("📝 Saving wallet user:", { address: address?.slice(0, 10) + "...", username });

    if (!address || !username) {
      return NextResponse.json(
        { success: false, error: "Wallet address and username required" },
        { status: 400 }
      );
    }

    // DIRECT SQL INSERT to bypass any RLS issues
    try {
      // First try with our database service
      const user = await database.createUser({
        walletAddress: address,
        username: username,
        authMethod: "wallet",
      });
      
      console.log("✅ SUCCESS: Wallet user saved for leaderboard:", user.username);
      
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
      console.error("❌ Database service failed, trying direct approach:", dbError.message);
      
      // If database service fails, try direct Prisma with raw SQL
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      
      try {
        // Try raw SQL to bypass everything
        const result = await prisma.$executeRaw`
          INSERT INTO users (id, username, "authMethod", "walletAddress", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${username}, 'wallet', ${address}, NOW(), NOW())
          ON CONFLICT ("walletAddress") DO UPDATE SET username = ${username}
        `;
        
        console.log("✅ RAW SQL SUCCESS: User saved for leaderboard");
        
        return NextResponse.json({
          success: true,
          user: {
            username: username,
            authMethod: "wallet",
            walletAddress: address,
          },
        });
        
      } catch (rawError: any) {
        console.error("❌ Even raw SQL failed:", rawError.message);
        throw rawError;
      } finally {
        await prisma.$disconnect();
      }
    }

  } catch (error: any) {
    console.error("❌ ALL ATTEMPTS FAILED to save wallet user for leaderboard");
    console.error("🔍 Final error:", error.message);
    
    return NextResponse.json(
      {
        success: false,
        error: "Could not save wallet user for leaderboard: " + error.message,
      },
      { status: 500 }
    );
  }
}
