import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Better Prisma client configuration
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

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
    console.log("🔐 Wallet registration request received");

    const { address, username } = (await req.json()) as WalletUserData;
    console.log("📝 Registration data:", {
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

    console.log("🔍 Checking if user already exists...");

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (user) {
      console.log("✅ User exists, updating if needed...");
      // User exists - update username if provided and different
      if (username && username !== user.username) {
        // Check if new username is already taken by another user
        const existingUserWithUsername = await prisma.user.findFirst({
          where: {
            username: username,
            id: { not: user.id },
          },
        });

        if (existingUserWithUsername) {
          return NextResponse.json(
            { success: false, error: "Username is already taken" },
            { status: 400 }
          );
        }

        user = await prisma.user.update({
          where: { id: user.id },
          data: { username },
        });
        console.log("✅ Username updated to:", user.username);
      }
    } else {
      console.log("🆕 Creating new user...");
      // Create new user
      const defaultUsername = username || `Player_${address.slice(0, 6)}`;

      // Ensure default username is unique
      let finalUsername = defaultUsername;
      let counter = 1;

      while (true) {
        const existingUser = await prisma.user.findFirst({
          where: { username: finalUsername },
        });

        if (!existingUser) break;

        finalUsername = `${defaultUsername}_${counter}`;
        counter++;
      }

      console.log("📝 Creating user with username:", finalUsername);

      user = await prisma.user.create({
        data: {
          walletAddress: address,
          username: finalUsername,
          authMethod: "wallet",
        },
      });

      console.log("✅ New user created with ID:", user.id);
    }

    console.log("🎉 Registration successful, returning user data");

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
  }
}
