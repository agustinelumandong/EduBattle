import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { database } from "@/lib/database";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    // Verify JWT token
    const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-for-demo";

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Get fresh user data from database
      const user = await database.findUserById(decoded.userId);
      if (!user) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          authMethod: user.authMethod,
        },
      });
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
