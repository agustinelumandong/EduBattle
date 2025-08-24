// Interface for leaderboard player entry
export interface LeaderboardPlayer {
    rank: number;
    id: string;              // User ID (wallet address or email user ID)
    username: string;
    totalWins: number;
    authMethod: 'wallet' | 'email';  // How the user authenticates
    displayId: string;       // For display purposes (shortened wallet or email)
  }
  
  // Interface for leaderboard data storage
  export interface LeaderboardData {
    players: Record<string, {
      username: string;
      totalWins: number;
      authMethod: 'wallet' | 'email';
      displayId: string;
    }>;
  }
  
  /**
   * Universal Leaderboard supporting both wallet and email authenticated users
   * This manages win tracking and competitive rankings based on number of wins
   * Works with both blockchain wallet addresses and email user IDs
   */
  export class Leaderboard {
    private static instance: Leaderboard;
    private storageKey = 'blockchain_quiz_leaderboard';
  
    private constructor() {}
  
    public static getInstance(): Leaderboard {
      if (!Leaderboard.instance) {
        Leaderboard.instance = new Leaderboard();
      }
      return Leaderboard.instance;
    }
  
    /**
     * Initialize leaderboard data structure
     */
    private getDefaultData(): LeaderboardData {
      return {
        players: {}
      };
    }
  
    /**
     * Get leaderboard data from storage (using localStorage as MiniKit storage interface)
     * In a production app, this would use MiniKit's backend storage capabilities
     */
    private getLeaderboardData(): LeaderboardData {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.error('Failed to load leaderboard data:', error);
      }
      return this.getDefaultData();
    }
  
    /**
     * Save leaderboard data to storage
     */
    private saveLeaderboardData(data: LeaderboardData): void {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save leaderboard data:', error);
      }
    }
  
    /**
     * Record a win for the specified player
     * This function should be called after a successful game completion
     * 
     * @param playerId - The unique identifier (wallet address or email user ID)
     * @param username - The player's display name
     * @param authMethod - The authentication method used ('wallet' or 'email')
     */
    public recordWin(playerId: string, username: string, authMethod: 'wallet' | 'email' = 'wallet'): void {
      const data = this.getLeaderboardData();
      
      // Create display ID for UI purposes
      const displayId = authMethod === 'wallet' 
        ? `${playerId.slice(0, 6)}...${playerId.slice(-4)}` // Wallet: 0x1234...5678
        : playerId.includes('@') ? playerId : `User ${playerId.slice(-6)}`; // Email or ID
      
      if (data.players[playerId]) {
        // Player exists, increment wins
        data.players[playerId].totalWins += 1;
        // Update username in case it changed
        data.players[playerId].username = username;
        data.players[playerId].authMethod = authMethod;
        data.players[playerId].displayId = displayId;
      } else {
        // New player, initialize with first win
        data.players[playerId] = {
          username: username,
          totalWins: 1,
          authMethod: authMethod,
          displayId: displayId
        };
      }
  
      this.saveLeaderboardData(data);
    }
  
    /**
     * Get the current leaderboard ranked by total wins
     * Returns players sorted from highest to lowest wins
     */
    public getLeaderboard(): LeaderboardPlayer[] {
      const data = this.getLeaderboardData();
      
      // Convert to array and sort by total wins (descending)
      const sortedPlayers = Object.entries(data.players)
        .map(([id, playerData]) => ({
          id,
          username: playerData.username,
          totalWins: playerData.totalWins,
          authMethod: playerData.authMethod,
          displayId: playerData.displayId
        }))
        .sort((a, b) => b.totalWins - a.totalWins);
  
      // Add rank numbers
      return sortedPlayers.map((player, index) => ({
        ...player,
        rank: index + 1
      }));
    }
  
    /**
     * Get a specific player's stats
     */
    public getPlayerStats(playerId: string): { username: string; totalWins: number; rank: number; authMethod: 'wallet' | 'email'; displayId: string } | null {
      const leaderboard = this.getLeaderboard();
      const player = leaderboard.find(p => p.id === playerId);
      
      if (player) {
        return {
          username: player.username,
          totalWins: player.totalWins,
          rank: player.rank,
          authMethod: player.authMethod,
          displayId: player.displayId
        };
      }
      
      return null;
    }
  
    /**
     * Get total number of players on leaderboard
     */
    public getTotalPlayers(): number {
      const data = this.getLeaderboardData();
      return Object.keys(data.players).length;
    }
  
    /**
     * Clear all leaderboard data (admin function)
     */
    public clearLeaderboard(): void {
      this.saveLeaderboardData(this.getDefaultData());
    }
  }
  
  // Export singleton instance for easy access
  export const leaderboard = Leaderboard.getInstance();