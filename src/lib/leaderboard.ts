/**
 * 🏆 LEADERBOARD MANAGEMENT
 * Simple leaderboard system for authenticated users
 */

export interface LeaderboardEntry {
  id: string;
  userId: string;
  totalWins: number;
  totalGames: number;
  rank?: number;
  updatedAt: Date;
  user: {
    username: string;
    isGuest: boolean;
    walletAddress?: string;
  };
}

/**
 * Get leaderboard data from the database
 * This fetches real-time data for authenticated users
 */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch("/api/leaderboard");
    if (!response.ok) {
      throw new Error("Failed to fetch leaderboard");
    }

    const result = await response.json();
    return result.entries || [];
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return [];
  }
}

/**
 * Get user stats from the database
 * Returns null for guest users or if user not found
 */
export async function getUserStats(
  userId: string
): Promise<LeaderboardEntry | null> {
  try {
    const response = await fetch("/api/leaderboard/user/" + userId);
    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.entry || null;
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    return null;
  }
}
