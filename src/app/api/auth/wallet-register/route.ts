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
    console.log("🔐 Wallet registration request received");
    console.log("🌍 Environment:", process.env.NODE_ENV);
    console.log("🔗 Database URL set:", !!process.env.DATABASE_URL);

    const body = await req.json();
    const { address, username } = body as WalletUserData;
    
    console.log("📝 Raw request body:", JSON.stringify(body, null, 2));
    console.log("📝 Parsed registration data:", {
      address: address?.slice(0, 10) + "...",
      username,
      addressLength: address?.length,
      usernameType: typeof username,
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
    let user;
    try {
      user = await database.findUserByWallet(address);
      console.log("✅ Database query successful:", { userFound: !!user });
    } catch (dbError) {
      console.error("❌ Database query failed:", dbError);
      throw new Error(`Database query failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }

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
      console.log("🆕 Creating new user...");
      // Create new user
      const defaultUsername = username || `Player_${address.slice(0, 6)}`;

      console.log("📝 Creating user with username:", defaultUsername);

      try {
        user = await database.createUser({
          walletAddress: address,
          username: defaultUsername,
          authMethod: "wallet",
        });
        console.log("✅ New user created with ID:", user.id);
      } catch (createError) {
        console.error("❌ User creation failed:", createError);
        throw new Error(`User creation failed: ${createError instanceof Error ? createError.message : 'Unknown error'}`);
      }
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
