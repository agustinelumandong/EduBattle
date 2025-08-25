import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("👻 Guest user creation attempt started");
  try {
    const { username } = await request.json();
    console.log("📝 Guest data received:", { username });

    // Validate inputs
    if (!username || username.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Username must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Create guest user in database
    console.log("👤 Creating guest user in database...");
    const user = await database.createGuestUser(username.trim());
    console.log("✅ Guest user created successfully:", {
      userId: user.id,
      username: user.username,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        isGuest: true,
      },
    });
  } catch (error) {
    console.error("Guest user creation error:", error);

    let errorMessage = "Guest user creation failed";
    if (error instanceof Error) {
      if (error.message.includes("connect")) {
        errorMessage =
          "Database connection failed. Please check your DATABASE_URL environment variable.";
      } else if (error.message.includes("Prisma")) {
        errorMessage =
          "Database query failed. Please ensure your database is properly set up.";
      }

      if (process.env.NODE_ENV === "development") {
        errorMessage = `${errorMessage} Details: ${error.message}`;
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
