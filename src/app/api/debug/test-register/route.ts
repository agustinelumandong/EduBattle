import { database } from "@/lib/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("🧪 Debug registration test started");
    
    const testData = {
      email: `debug_${Date.now()}@test.com`,
      username: "debuguser",
      password: "testpass123"
    };

    console.log("📧 Test data:", { email: testData.email, username: testData.username });

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
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      steps: ["User check", "Password hash", "User creation", "JWT generation"]
    });

  } catch (error) {
    console.error("❌ Debug registration failed:", error);
    
    return NextResponse.json({
      success: false,
      error: "Debug registration failed",
      details: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : "Unknown error"
    }, { status: 500 });
  }
}
