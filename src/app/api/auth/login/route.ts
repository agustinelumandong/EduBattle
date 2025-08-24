import { database } from "@/lib/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import validator from "validator";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await request.json();

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!validator.isEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await database.findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user has a password hash (email auth users should have one)
    if (!user.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-for-demo";
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        authMethod: "email",
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
        authMethod: "email",
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    
    // Provide more specific error messages for debugging
    let errorMessage = "Login failed";
    if (error instanceof Error) {
      // Database connection errors
      if (error.message.includes('connect')) {
        errorMessage = "Database connection failed. Please check your DATABASE_URL environment variable.";
      } 
      // Prisma client errors
      else if (error.message.includes('Prisma')) {
        errorMessage = "Database query failed. Please ensure your database is properly set up.";
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
