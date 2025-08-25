import { useOnchainKit } from "@coinbase/onchainkit";

// Simple authentication system supporting guest mode and enhanced wallet connection
export interface User {
  id: string;
  username: string;
  isGuest: boolean;
  walletAddress?: string;
  isAuthenticated: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface WalletAuthData {
  address: string;
  username?: string;
}

/**
 * Enhanced Authentication class supporting:
 * 1. Guest mode - play without login (no leaderboard)
 * 2. Enhanced wallet authentication using Coinbase onchainkit
 */
export class Auth {
  private static instance: Auth;
  private user: User | null = null;

  private constructor() {}

  public static getInstance(): Auth {
    if (!Auth.instance) {
      Auth.instance = new Auth();
    }
    return Auth.instance;
  }

  /**
   * Check if user is currently authenticated
   */
  public isAuthenticated(): boolean {
    return this.user !== null && this.user.isAuthenticated;
  }

  /**
   * Get current user information
   */
  public getCurrentUser(): User | null {
    return this.user;
  }

  /**
   * Create a guest user - can play but won't save to leaderboard
   */
  public async createGuestUser(username: string): Promise<AuthResult> {
    try {

      const response = await fetch("/api/auth/guest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          error: result.error || "Failed to create guest user",
        };
      }

      // Create authenticated user object
      this.user = {
        id: result.user.id,
        username: result.user.username,
        isGuest: true,
        isAuthenticated: true,
      };

      return { success: true, user: this.user };
    } catch (error) {
      console.error("Guest user creation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Guest creation failed",
      };
    }
  }

  /**
   * Enhanced wallet connection using Coinbase onchainkit
   */
  public async connectWallet(
    address?: string,
    username?: string
  ): Promise<AuthResult> {
    try {

      let walletAddress: string | null = address || null;

      // If no address provided, try to get one using onchainkit
      if (!walletAddress) {
        try {
          // Use onchainkit to get the connected wallet
          const accounts = await this.getOnchainkitAccounts();
          if (accounts && accounts.length > 0) {
            walletAddress = accounts[0];
             
          }
        } catch (onchainkitError) {
         
        }
      }

      // Fallback to basic wallet detection if onchainkit didn't work
      if (!walletAddress) {
         
        walletAddress = await this.detectBasicWallet();
      }

      // If still no address, try to request connection
      if (!walletAddress) {
        
        walletAddress = await this.requestWalletConnection();
      }

      if (!walletAddress) {
        return {
          success: false,
          error: "Please unlock your wallet and try again.",
        };
      }

      // Connect wallet with generated username
      const displayUsername = username || `Player_${walletAddress.slice(0, 6)}`;
      const result = await this.authenticateWallet(
        walletAddress,
        displayUsername
      );

      if (result.success && result.user) {
        this.user = result.user;

        return { success: true, user: this.user };
      } else {
        return result;
      }
    } catch (error) {
      console.error("Enhanced wallet connection error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Wallet connection failed",
      };
    }
  }

  /**
   * Get accounts from onchainkit
   */
  private async getOnchainkitAccounts(): Promise<string[]> {
    try {
      // Since onchainkit is a React hook, we'll use basic wallet detection for now
      // and implement proper onchainkit integration in the React components
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Authenticate wallet with backend API
   */
  private async authenticateWallet(
    address: string,
    username: string
  ): Promise<AuthResult> {
    try {
      const response = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          username,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          error: result.error || "Wallet authentication failed",
        };
      }

      // Create authenticated user object
      const user = {
        id: result.user.id,
        username: result.user.username,
        isGuest: false,
        walletAddress: address,
        isAuthenticated: true,
      };

      return { success: true, user };
    } catch (error) {
      console.error("Wallet API authentication error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Wallet API authentication failed",
      };
    }
  }

  /**
   * Basic wallet detection (fallback)
   */
  private async detectBasicWallet(): Promise<string | null> {
    try {
      // Check if MetaMask or similar is available
      if (typeof window !== "undefined" && (window as any).ethereum) {
        

        try {
          // Try to get accounts
          const accounts = await (window as any).ethereum.request({
            method: "eth_accounts",
          });

          if (accounts && accounts.length > 0) {
            
            return accounts[0];
          }

          
          return null;
        } catch (requestError) {
          
          return null;
        }
      }

      
      return null;
    } catch (error) {
      
      return null;
    }
  }

  /**
   * Request wallet connection using onchainkit or fallback
   */
  public async requestWalletConnection(): Promise<string | null> {
    try {
      

      // Try onchainkit first
      try {
        const accounts = await this.getOnchainkitAccounts();
        if (accounts && accounts.length > 0) {
          return accounts[0];
        }
      } catch (onchainkitError) {
         
      }

      // Fallback to basic wallet connection
      if (typeof window !== "undefined" && (window as any).ethereum) {
        

        try {
          const accounts = await (window as any).ethereum.request({
            method: "eth_requestAccounts",
          });

          if (accounts && accounts.length > 0) {
            
            return accounts[0];
          }
        } catch (requestError) {
          
          return null;
        }
      }

      
      return null;
    } catch (error) {
      
      return null;
    }
  }

  /**
   * Check if onchainkit is available
   */
  public isOnchainkitAvailable(): boolean {
    try {
      return typeof useOnchainKit !== "undefined";
    } catch {
      return false;
    }
  }

  /**
   * Check which wallet extensions are available
   */
  public getAvailableWallets(): string[] {
    const wallets: string[] = [];

    try {
      if (typeof window !== "undefined") {
        // Check MetaMask
        if ((window as any).ethereum) {
          wallets.push("MetaMask/Coinbase Wallet");
        }

        // Check Coinbase Wallet specifically
        if ((window as any).coinbaseWalletExtension) {
          wallets.push("Coinbase Wallet Extension");
        }

        // Check other common wallets
        if ((window as any).phantom?.ethereum) {
          wallets.push("Phantom");
        }
      }
    } catch (error) {
      
    }

    return wallets;
  }

  /**
   * Logout current user and clear all session data
   */
  public logout(): void {
    this.user = null;
    
  }
}

// Export singleton instance for easy access
export const auth = Auth.getInstance();
