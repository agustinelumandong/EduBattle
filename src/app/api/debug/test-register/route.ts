import { database } from "@/lib/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("🧪 Debug registration test started");

    const body = await request.json();
    const testType = body.testType || "email"; // "email", "wallet", or "connection"

    // Test database connection first
    try {
      console.log("🔌 Testing database connection...");
      await database.findUserByEmail("connection_test@test.com");
      console.log("✅ Database connection successful");
    } catch (dbError: any) {
      console.error("❌ Database connection failed:", dbError.message);
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: {
            message: dbError.message,
            code: dbError.code,
            hint: "Check your DATABASE_URL environment variable and database status",
          },
        },
        { status: 500 }
      );
    }

    if (testType === "connection") {
      // Simple connection test
      return NextResponse.json({
        success: true,
        message: "Database connection test successful",
        testType: "connection",
        steps: ["Database connection"],
      });
    }

    if (testType === "wallet") {
      // Test wallet user creation
      const testWalletData = {
        address: `0x${Date.now().toString(16).padStart(40, "0")}`, // Generate test wallet address
        username: `testwallet_${Date.now()}`,
      };

      console.log("🔐 Testing wallet user creation:", {
        address: testWalletData.address.slice(0, 10) + "...",
        username: testWalletData.username,
      });

      // Check if wallet user exists
      const existingWalletUser = await database.findUserByWallet(
        testWalletData.address
      );
      console.log("🔍 Existing wallet user check:", {
        exists: !!existingWalletUser,
      });

      // Create wallet user
      const walletUser = await database.createUser({
        email: "",
        username: testWalletData.username,
        authMethod: "wallet",
        walletAddress: testWalletData.address,
        passwordHash: "",
      });

      console.log("✅ Wallet user created successfully:", {
        id: walletUser.id,
        username: walletUser.username,
        walletAddress: walletUser.walletAddress,
      });

      // Verify the user was actually saved by querying again
      const verifyUser = await database.findUserByWallet(
        testWalletData.address
      );
      console.log("🔍 Verification query result:", {
        found: !!verifyUser,
        username: verifyUser?.username,
        id: verifyUser?.id,
      });

      return NextResponse.json({
        success: true,
        message: "Wallet user test successful",
        testType: "wallet",
        user: {
          id: walletUser.id,
          username: walletUser.username,
          walletAddress: walletUser.walletAddress,
        },
        verification: {
          found: !!verifyUser,
          username: verifyUser?.username,
          id: verifyUser?.id,
        },
        steps: [
          "Database connection",
          "Wallet user check",
          "Wallet user creation",
          "Verification query",
        ],
      });
    }

    // Default email user test
    const testData = {
      email: `debug_${Date.now()}@test.com`,
      username: "debuguser",
      password: "testpass123",
    };

    console.log("📧 Test data:", {
      email: testData.email,
      username: testData.username,
    });

    // Step 1: Check if user exists
    console.log("🔍 Step 1: Checking existing user...");
    const existingUser = await database.findUserByEmail(testData.email);
    console.log("✅ Step 1 completed:", { userExists: !!existingUser });

    // Step 2: Hash password
    console.log("🔐 Step 2: Hashing password...");
    const passwordHash = await bcrypt.hash(testData.password, 12);
    console.log("✅ Step 2 completed: Password hashed");

    // Step 3: Create user
    console.log("👤 Step 3: Creating user...");
    const user = await database.createUser({
      email: testData.email,
      username: testData.username,
      authMethod: "email",
      passwordHash,
    });
    console.log("✅ Step 3 completed:", { userId: user.id });

    // Step 4: Generate JWT
    console.log("🎫 Step 4: Generating JWT...");
    const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-for-demo";
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        authMethod: user.authMethod,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log("✅ Step 4 completed: JWT generated");

    return NextResponse.json({
      success: true,
      message: "Debug registration successful",
      testType: "email",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      steps: [
        "Database connection",
        "User check",
        "Password hash",
        "User creation",
        "JWT generation",
      ],
    });
  } catch (error) {
    console.error("❌ Debug registration failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Debug registration failed",
        details:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}
