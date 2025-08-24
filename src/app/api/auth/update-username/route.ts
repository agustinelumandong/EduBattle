import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface UpdateUsernameData {
  userId: string;
  newUsername: string;
}

/**
 * API route to update user username
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, newUsername } = (await req.json()) as UpdateUsernameData;

    if (!userId || !newUsername) {
      return NextResponse.json(
        { success: false, error: "User ID and new username are required" },
        { status: 400 }
      );
    }

    if (newUsername.length < 3 || newUsername.length > 20) {
      return NextResponse.json(
        {
          success: false,
          error: "Username must be between 3 and 20 characters",
        },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        username: newUsername,
        id: { not: userId },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Username is already taken" },
        { status: 400 }
      );
    }

    // Update username
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { username: newUsername },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        authMethod: updatedUser.authMethod,
        walletAddress: updatedUser.walletAddress,
      },
    });
  } catch (error: any) {
    console.error("Username update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Username update failed",
      },
      { status: 500 }
    );
  }
}
