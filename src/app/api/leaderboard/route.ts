import { NextResponse } from "next/server";
import { database } from "@/lib/database";

export async function GET() {
  try {
    const leaderboard = await database.getLeaderboard();
    return NextResponse.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
