import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const { userId, won, score, gameData } = await request.json();

    if (!userId || typeof won !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid game data" },
        { status: 400 }
      );
    }

    const game = await database.recordGame({
      userId,
      won,
      score,
      gameData,
    });

    return NextResponse.json({
      success: true,
      gameId: game.id,
    });
  } catch (error) {
    console.error("Game recording error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record game" },
      { status: 500 }
    );
  }
}
