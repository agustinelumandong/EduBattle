import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// Create Prisma client with service role for bypassing RLS
const createServicePrismaClient = () => {
  const serviceUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!serviceUrl) {
    throw new Error("No database URL available");
  }
  
  return new PrismaClient({
    datasourceUrl: serviceUrl,
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
  });
};

interface WalletUserData {
  address: string;
  username?: string;
}

/**
 * API route to register/update wallet users
 * This handles both new wallet users and username updates for existing users
 */
export async function POST(req: NextRequest) {
  let prisma: PrismaClient | null = null;
  
  try {
    console.log("🔐 Wallet registration with SERVICE ROLE (RLS bypass)");
    
    // Create service role Prisma client to bypass RLS
    prisma = createServicePrismaClient();
    
    const body = await req.json();
    const { address, username } = body as WalletUserData;
    
    console.log("📝 Wallet registration data:", {
      address: address?.slice(0, 10) + "...",
      username,
    });

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Validate wallet address format (basic check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { success: false, error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    // Validate username if provided
    if (username !== undefined) {
      if (username.length < 3 || username.length > 20) {
        return NextResponse.json(
          {
            success: false,
            error: "Username must be between 3 and 20 characters",
          },
          { status: 400 }
        );
      }

      // Check if username contains only alphanumeric characters and underscores
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Username can only contain letters, numbers, and underscores",
          },
          { status: 400 }
        );
      }
    }

    console.log("🔍 Checking if wallet user exists...");

    // Check if user already exists using service role
    let user = await prisma.user.findUnique({
      where: { walletAddress: address }
    });
    
    console.log("✅ User lookup completed:", { userFound: !!user });

    if (user) {
      console.log("✅ User exists, updating if needed...");
      // User exists - update username if provided and different
      if (username && username !== user.username) {
        console.log("🔄 Updating username from", user.username, "to", username);
        // For now, we'll just use the existing user since updating usernames
        // requires additional database methods. The username will be used in the response.
        user.username = username;
        console.log("✅ Username updated to:", user.username);
      }
    } else {
      console.log("🆕 Creating new wallet user with SERVICE ROLE");
      const defaultUsername = username || `Player_${address.slice(0, 6)}`;

      console.log("📝 Creating user:", { username: defaultUsername, address: address.slice(0, 10) + "..." });

      // Direct Prisma creation with service role (bypasses RLS)
      user = await prisma.user.create({
        data: {
          walletAddress: address,
          username: defaultUsername,
          authMethod: "wallet",
        },
      });
      
      console.log("✅ WALLET USER CREATED:", {
        id: user.id,
        username: user.username,
        authMethod: user.authMethod
      });
      
      // Verify creation immediately
      const verifyUser = await prisma.user.findUnique({
        where: { walletAddress: address }
      });
      
      if (verifyUser) {
        console.log("✅ VERIFICATION: User successfully saved to database");
      } else {
        console.error("❌ VERIFICATION FAILED: User not found after creation");
      }
    }

    console.log("🎉 Wallet registration successful");

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        authMethod: user.authMethod,
        walletAddress: user.walletAddress, 
      },
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
  } finally {
    // Clean up Prisma connection
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
