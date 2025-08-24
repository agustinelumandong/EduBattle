"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/database";

export default function LeaderboardView() {
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const response = await fetch("/api/leaderboard");
        const result = await response.json();
        if (result.success) {
          setPlayers(result.data);
        }
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      }
    };
    loadLeaderboard();
  }, []);

  if (players.length === 0) {
    return (
      <div className="text-center text-white py-8">
        <p className="text-lg">No players yet!</p>
        <p className="text-sm text-gray-400">
          Complete your first game to appear on the leaderboard!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-white border-b border-gray-600 pb-2">
        <div>Rank</div>
        <div>Player</div>
        <div>Wins</div>
        <div>Type</div>
      </div>

      {players.map((player) => (
        <div
          key={player.id}
          className="grid grid-cols-4 gap-4 text-sm text-white border-b border-gray-700 pb-2"
        >
          <div className="font-bold">
            {player.rank === 1 && "🥇"}
            {player.rank === 2 && "🥈"}
            {player.rank === 3 && "🥉"}
            {player.rank > 3 && `#${player.rank}`}
          </div>
          <div className="truncate">
            <div className="font-medium">
              {player.user?.username || player.username || "Unknown"}
            </div>
            <div className="text-xs text-gray-400">
              {player.user?.walletAddress
                ? `${player.user.walletAddress.slice(
                    0,
                    6
                  )}...${player.user.walletAddress.slice(-4)}`
                : player.user?.email || "No ID"}
            </div>
          </div>
          <div className="font-bold text-green-400">{player.totalWins}</div>
          <div className="text-xs">
            {player.user?.authMethod === "wallet" ? "🔗 Wallet" : "📧 Email"}
          </div>
        </div>
      ))}

      <div className="text-center text-sm text-gray-400 pt-2">
        Total Players: {players.length}
      </div>
    </div>
  );
}
