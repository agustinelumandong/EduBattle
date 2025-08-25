import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

interface UpdateUsernameRequest {
  userId: string;
  username: string;
}

/**
 * API route to update username for existing users
 */
export async function POST(req: NextRequest) {
  try {
    console.log("🔄 Username update request received");

    const { userId, username } = (await req.json()) as UpdateUsernameRequest;

    if (!userId || !username) {
      return NextResponse.json(
        { success: false, error: "User ID and username are required" },
        { status: 400 }
      );
    }

    // Validate username
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        {
          success: false,
          error: "Username must be between 3 and 20 characters",
        },
        { status: 400 }
      );
    }

    // Check if username is already taken by another user
    const existingUser = await database.findUserByUsername(username);
    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json(
        { success: false, error: "Username is already taken by another user" },
        { status: 409 }
      );
    }

    // Update the user
    const updatedUser = await database.updateUser(userId, { username });

    console.log("✅ Username updated successfully:", {
      userId: updatedUser.id,
      newUsername: updatedUser.username,
    });

    return NextResponse.json({
      success: true,
      message: "Username updated successfully",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        authMethod: updatedUser.authMethod,
      },
    });
  } catch (error: any) {
    console.error("❌ Username update failed:", error.message);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update username: " + error.message,
      },
      { status: 500 }
    );
  }
}
