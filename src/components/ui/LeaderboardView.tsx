"use client";

import { useCallback, useEffect, useState } from "react";

export default function LeaderboardView() {
  const [players, setPlayers] = useState<any[]>([]);

  const loadLeaderboard = useCallback(async () => {
    try {
      const response = await fetch("/api/leaderboard");
      const result = await response.json();
      if (result.success) {
        setPlayers(result.data);
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();
    
    // Set up periodic refresh every 30 seconds to keep leaderboard updated
    const interval = setInterval(loadLeaderboard, 30000);
    
    return () => clearInterval(interval);
  }, [loadLeaderboard]);

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
      <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2 mb-4">
        <button
          onClick={loadLeaderboard}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors w-full sm:w-auto"
        >
          Refresh
        </button>
      </div>
      
      <div className="hidden sm:grid grid-cols-3 gap-4 text-sm font-semibold text-white border-b border-gray-600 pb-2">
        <div className="col-span-1 text-center">Rank</div>
        <div className="col-span-1 text-center">Player</div>
        <div className="col-span-1 text-center">Wins</div>
         
      </div>

      <div className="max-h-80 overflow-y-auto pr-1">
        {players.map((player) => (
          <div
            key={player.id}
            className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 items-center text-sm text-white border-b border-gray-700 pb-2"
          >
            <div className="font-bold text-2xl sm:text-2xl text-center">
              {player.rank === 1 && "🥇"}
              {player.rank === 2 && "🥈"}
              {player.rank === 3 && "🥉"}
              {player.rank > 3 && `#${player.rank}`}
            </div>
            <div className="truncate">
              <div className="font-medium text-center">
                {player.user?.username || player.username || "Unknown"}
              </div>
              <div className="text-xs text-gray-400 text-center">
                {player.user?.walletAddress
                  ? `${player.user.walletAddress.slice(
                      0,
                      6
                    )}...${player.user.walletAddress.slice(-4)}`
                  : player.user?.email || "No ID"}
              </div>
            </div>
            <div className="font-bold text-green-400 text-center">{player.totalWins}</div>
             
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-400 pt-2">
        Total Players: {players.length}
      </div>
    </div>
  );
}
