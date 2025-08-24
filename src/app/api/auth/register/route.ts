import { database } from "@/lib/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import validator from "validator";

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("📝 Registration attempt started");
  try {
    const { email, password, username } = await request.json();
    console.log("📧 Registration data received:", { email: email?.substring(0, 3) + "***", usernameLength: username?.length });

    // Validate inputs
    if (!email || !password || !username) {
      return NextResponse.json(
        { success: false, error: "Email, password, and username are required" },
        { status: 400 }
      );
    }

    if (!validator.isEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (username.length < 2) {
      return NextResponse.json(
        { success: false, error: "Username must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    console.log("🔍 Checking for existing user...");
    const existingUser = await database.findUserByEmail(email);
    if (existingUser) {
      console.log("❌ User already exists with this email");
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 409 }
      );
    }
    console.log("✅ Email available for registration");

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user in database
    console.log("👤 Creating user in database...");
    const user = await database.createUser({
      email,
      username,
      authMethod: "email",
      passwordHash,
    });
    console.log("✅ User created successfully:", { userId: user.id, username: user.username });

    // Generate JWT token
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
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        authMethod: user.authMethod,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    
    // Provide more specific error messages for debugging
    let errorMessage = "Registration failed";
    if (error instanceof Error) {
      // Database connection errors
      if (error.message.includes('connect')) {
        errorMessage = "Database connection failed. Please check your DATABASE_URL environment variable.";
      } 
      // Prisma client errors
      else if (error.message.includes('Prisma')) {
        errorMessage = "Database query failed. Please ensure your database is properly set up.";
      }
      // Unique constraint errors
      else if (error.message.includes('Unique constraint')) {
        errorMessage = "Email address already exists. Please use a different email.";
      }
      // JWT errors
      else if (error.message.includes('JWT') || error.message.includes('token')) {
        errorMessage = "Authentication token error. Please check your JWT_SECRET environment variable.";
      }
      
      // In development, show full error
      if (process.env.NODE_ENV === 'development') {
        errorMessage = `${errorMessage} Details: ${error.message}`;
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
