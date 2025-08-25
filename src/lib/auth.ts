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

<<<<<<< HEAD
  public async loginWithWallet(): Promise<AuthResult> {
    try {
      

      // Wait a moment for MiniKit to initialize if needed
      await new Promise((resolve) => setTimeout(resolve, 100));

      

      // Check if MiniKit is available
      if (!MiniKit.isInstalled()) {
        return {
          success: false,
          error:
            "Wallet authentication requires World App. Please use email login or open in World App.",
        };
      }

      
      return await this.performBlockchainAuth();
    } catch (error) {
      console.error("Wallet authentication error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Wallet authentication failed",
      };
    }
  }

  /**
   * Email login - performs secure email/password authentication
   */
  public async loginWithEmail(authData: EmailAuthData): Promise<AuthResult> {
    try {
       

      const { response, json: result } = await this.fetchJsonWithRetry(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: authData.email,
            password: authData.password,
          }),
          retryCount: 2,
          retryDelayMs: 300,
        }
      );

      if (!response.ok || !result?.success) {
        return {
          success: false,
          error: result?.error || "Email login failed",
        };
      }

      
      localStorage.setItem("auth_token", result.token);

      // Create authenticated user object
      this.user = {
        id: result.user.id,
        username: result.user.username,
        authMethod: "email",
        isAuthenticated: true,
        email: result.user.email,
      };

      
      return {
        success: true,
        user: this.user,
      };
    } catch (error) {
      console.error("Email authentication error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Email authentication failed",
      };
    }
  }

  /**
   * Legacy login method - now redirects to wallet login for backward compatibility
   */
  public async login(): Promise<AuthResult> {
    return this.loginWithWallet();
  }

  /**
   * Perform real blockchain authentication via MiniKit
   */
  private async performBlockchainAuth(): Promise<AuthResult> {
    try {
      // Step 1: Get nonce from backend for security
      const nonceResponse = await fetch("/api/nonce");
      if (!nonceResponse.ok) {
        throw new Error("Failed to get authentication nonce");
      }
      const { nonce } = await nonceResponse.json();

      
      const walletAuthInput: WalletAuthInput = {
        nonce: nonce,
        requestId: crypto.randomUUID(),
        expirationTime: new Date(
          new Date().getTime() + 7 * 24 * 60 * 60 * 1000
        ), // 7 days
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        statement:
          "Welcome to Blockchain Quiz Challenge! Sign in to compete on the leaderboard.",
      };

      const { finalPayload } = await MiniKit.commandsAsync.walletAuth(
        walletAuthInput
      );

      if (finalPayload.status === "error") {
        return {
          success: false,
          error: "Wallet authentication failed. Please try again.",
        };
      }

      
      const verifyResponse = await fetch("/api/complete-siwe", {
=======
  /**
   * Create a guest user - can play but won't save to leaderboard
   */
  public async createGuestUser(username: string): Promise<AuthResult> {
    try {
      console.log("👻 Creating guest user:", username);

      const response = await fetch("/api/auth/guest", {
>>>>>>> bdff4c576389d54a7b55bc4b0c800ea3e5dd738c
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
<<<<<<< HEAD
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error("Authentication verification failed");
      }

      const verifyResult = await verifyResponse.json();

      if (!verifyResult.isValid) {
        return {
          success: false,
          error: "Authentication signature is invalid",
        };
      }

      

      
      const storedUsername =
        typeof window !== "undefined"
          ? localStorage.getItem("wallet_username")
          : null;
      const username =
        storedUsername ||
        MiniKit.user?.username ||
        verifyResult.user?.username ||
        `Player_${finalPayload.address.slice(0, 6)}`;

      
      this.user = {
        id: verifyResult.user?.id || finalPayload.address, // Use database ID if available
        username: username,
        authMethod: "wallet",
        isAuthenticated: true,
        address: finalPayload.address,
      };

      

      
      if (typeof window !== "undefined") {
        localStorage.removeItem("wallet_username");
      }

      return {
        success: true,
        user: this.user,
      };
    } catch (error) {
      console.error("Blockchain auth error:", error);
      throw error;
    }
  }

  /**
   * Register with email - creates new email/password account
   */
  public async registerWithEmail(authData: EmailAuthData): Promise<AuthResult> {
    try {
      

      if (!authData.username) {
        return {
          success: false,
          error: "Username is required for registration",
        };
      }

      const { response, json: result } = await this.fetchJsonWithRetry(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            email: authData.email,
            password: authData.password,
            username: authData.username,
          }),
          retryCount: 2,
          retryDelayMs: 300,
        }
      );

      if (!response.ok || !result?.success) {
        return {
          success: false,
          error: result?.error || "Email registration failed",
        };
      }

      
      localStorage.setItem("auth_token", result.token);

      
      this.user = {
        id: result.user.id,
        username: result.user.username,
        authMethod: "email",
        isAuthenticated: true,
        email: result.user.email,
      };

      
      return {
        success: true,
        user: this.user,
      };
    } catch (error) {
      console.error("Email registration error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Email registration failed",
      };
    }
  }

  /**
   * Register with wallet - in blockchain context, this is the same as login
   * Since wallet addresses are self-sovereign identities
   */
  public async registerWithWallet(): Promise<AuthResult> {
    return this.loginWithWallet();
  }

  /**
   * Legacy register method - now redirects to wallet registration for backward compatibility
   */
  public async register(): Promise<AuthResult> {
    return this.registerWithWallet();
  }

  /**
   * Restore session from stored token (email auth only)
   */
  public async restoreSession(): Promise<AuthResult> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        return { success: false, error: "No stored session" };
      }

      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
=======
        body: JSON.stringify({ username }),
>>>>>>> bdff4c576389d54a7b55bc4b0c800ea3e5dd738c
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
<<<<<<< HEAD
        
        localStorage.removeItem("auth_token");
        return { success: false, error: "Invalid session" };
      }

      
=======
        return {
          success: false,
          error: result.error || "Failed to create guest user",
        };
      }

      // Create authenticated user object
>>>>>>> bdff4c576389d54a7b55bc4b0c800ea3e5dd738c
      this.user = {
        id: result.user.id,
        username: result.user.username,
        isGuest: true,
        isAuthenticated: true,
      };

      console.log("✅ Guest user created successfully");
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
      console.log("🔗 Starting enhanced wallet connection...");

      let walletAddress: string | null = address || null;

      // If no address provided, try to get one using onchainkit
      if (!walletAddress) {
        try {
          // Use onchainkit to get the connected wallet
          const accounts = await this.getOnchainkitAccounts();
          if (accounts && accounts.length > 0) {
            walletAddress = accounts[0];
            console.log(
              "✅ Wallet detected via onchainkit:",
              walletAddress.slice(0, 10) + "..."
            );
          }
        } catch (onchainkitError) {
          console.log(
            "Onchainkit not available, falling back to basic wallet detection"
          );
        }
      }

      // Fallback to basic wallet detection if onchainkit didn't work
      if (!walletAddress) {
        console.log("🔍 Trying basic wallet detection...");
        walletAddress = await this.detectBasicWallet();
      }

      // If still no address, try to request connection
      if (!walletAddress) {
        console.log("🔌 Requesting wallet connection...");
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
        console.log("✅ Wallet connected successfully via API");
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
        console.log("🔍 Detecting wallet extensions...");

        try {
          // Try to get accounts
          const accounts = await (window as any).ethereum.request({
            method: "eth_accounts",
          });

          if (accounts && accounts.length > 0) {
            console.log(
              "✅ Wallet detected:",
              accounts[0].slice(0, 10) + "..."
            );
            return accounts[0];
          }

          console.log("📱 Wallet extension found but no accounts connected");
          return null;
        } catch (requestError) {
          console.log("⚠️ Wallet request failed:", requestError);
          return null;
        }
      }

      console.log("❌ No wallet extension detected");
      return null;
    } catch (error) {
      console.log("⚠️ Wallet detection error:", error);
      return null;
    }
  }

  /**
   * Request wallet connection using onchainkit or fallback
   */
  public async requestWalletConnection(): Promise<string | null> {
    try {
      console.log("🔗 Requesting wallet connection...");

      // Try onchainkit first
      try {
        const accounts = await this.getOnchainkitAccounts();
        if (accounts && accounts.length > 0) {
          return accounts[0];
        }
      } catch (onchainkitError) {
        console.log("Onchainkit not available, using fallback");
      }

      // Fallback to basic wallet connection
      if (typeof window !== "undefined" && (window as any).ethereum) {
        console.log("🔌 Requesting accounts from wallet extension...");

        try {
          const accounts = await (window as any).ethereum.request({
            method: "eth_requestAccounts",
          });

          if (accounts && accounts.length > 0) {
            console.log(
              "✅ Wallet connected:",
              accounts[0].slice(0, 10) + "..."
            );
            return accounts[0];
          }
        } catch (requestError) {
          console.log("🚫 User rejected wallet connection");
          return null;
        }
      }

      console.log("❌ No wallet connection available");
      return null;
    } catch (error) {
      console.log("🚫 Wallet connection rejected:", error);
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
      console.log("Error checking wallet extensions:", error);
    }

    return wallets;
  }

  /**
   * Logout current user and clear all session data
   */
  public logout(): void {
    this.user = null;
<<<<<<< HEAD
    
    localStorage.removeItem("auth_token");
    
=======
    console.log("🚪 User logged out successfully");
>>>>>>> bdff4c576389d54a7b55bc4b0c800ea3e5dd738c
  }
}

// Export singleton instance for easy access
export const auth = Auth.getInstance();
