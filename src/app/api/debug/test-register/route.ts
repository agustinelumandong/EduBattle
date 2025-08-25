import { database } from "@/lib/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
     

    const body = await request.json();
    const testType = body.testType || "email"; // "email" or "wallet"

    // Test database connection first
    try {
     
      await database.findUserByEmail("connection_test@test.com");
      
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

    if (testType === "wallet") {
      // Test wallet user creation
      const testWalletData = {
        address: `0x${Date.now().toString(16).padStart(40, "0")}`, // Generate test wallet address
        username: `testwallet_${Date.now()}`,
      };

     

      // Check if wallet user exists
      const existingWalletUser = await database.findUserByWallet(
        testWalletData.address
      );
     

      // Create wallet user
      const walletUser = await database.createUser({
        email: "",
        username: testWalletData.username,
        authMethod: "wallet",
        walletAddress: testWalletData.address,
        passwordHash: "",
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
        steps: [
          "Database connection",
          "Wallet user check",
          "Wallet user creation",
        ],
      });
    }

    // Default email user test
    const testData = {
      email: `debug_${Date.now()}@test.com`,
      username: "debuguser",
      password: "testpass123",
    };

     

    // Step 1: Check if user exists
     
    const existingUser = await database.findUserByEmail(testData.email);
     

    // Step 2: Hash password
     
    const passwordHash = await bcrypt.hash(testData.password, 12);
     

    // Step 3: Create user
     
    const user = await database.createUser({
      email: testData.email,
      username: testData.username,
      authMethod: "email",
      passwordHash,
    });
     

    // Step 4: Generate JWT
     
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
