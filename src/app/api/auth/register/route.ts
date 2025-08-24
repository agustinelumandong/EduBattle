import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import { database } from "@/lib/database";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email, password, username } = await request.json();

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
    const existingUser = await database.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user in database
    const user = await database.createUser({
      email,
      username,
      authMethod: "email",
      passwordHash,
    });

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
    return NextResponse.json(
      { success: false, error: "Registration failed" },
      { status: 500 }
    );
  }
}
