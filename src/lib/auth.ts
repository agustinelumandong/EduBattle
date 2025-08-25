import { MiniKit, WalletAuthInput } from "@worldcoin/minikit-js";

// Interface for user authentication state
export interface User {
  id: string; // Unique identifier (wallet address for wallet auth, generated ID for email)
  username: string; // Display name
  authMethod: "wallet" | "email"; // Authentication method used
  isAuthenticated: boolean;
  // Wallet-specific fields (optional)
  address?: string; // Blockchain wallet address
  // Email-specific fields (optional)
  email?: string; // Email address
}

// Interface for authentication results
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Interface for email authentication
export interface EmailAuthData {
  email: string;
  password: string;
  username?: string; // For registration
}

/**
 * Hybrid Authentication class supporting both blockchain wallets AND email/password
 * This handles:
 * 1. Wallet authentication using MiniKit Sign in with Ethereum (SIWE)
 * 2. Email/password authentication using secure JWT tokens
 */
export class Auth {
  private static instance: Auth;
  private user: User | null = null;

  private constructor() {}

  // Simple JSON fetch with retry and backoff to reduce intermittent network/cold-start failures
  private async fetchJsonWithRetry(
    input: RequestInfo | URL,
    init: RequestInit & { retryCount?: number; retryDelayMs?: number } = {}
  ): Promise<{ response: Response; json: any }> {
    const { retryCount = 2, retryDelayMs = 300, ...requestInit } = init;

    let lastError: unknown = null;
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const response = await fetch(input, {
          // Ensure no caching artifacts in some environments
          cache: "no-store",
          ...requestInit,
          headers: {
            "Content-Type": "application/json",
            ...(requestInit.headers || {}),
          },
        });

        // Parse JSON once per attempt
        const json = await response.json().catch(() => ({}));

        // Retry on transient server/network errors
        if (response.status >= 500) {
          if (attempt < retryCount) {
            await new Promise((r) =>
              setTimeout(r, retryDelayMs * (attempt + 1))
            );
            continue;
          }
        }

        return { response, json };
      } catch (error) {
        lastError = error;
        if (attempt < retryCount) {
          await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)));
          continue;
        }
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("Network request failed");
  }

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
   * Wallet login - performs REAL blockchain authentication
   * This requires MiniKit to be available (World App or compatible environment)
   */
  public async loginWithWallet(): Promise<AuthResult> {
    try {
      console.log("🔐 Starting blockchain wallet authentication...");

      // Wait a moment for MiniKit to initialize if needed
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("MiniKit installed:", MiniKit.isInstalled());

      // Check if MiniKit is available
      if (!MiniKit.isInstalled()) {
        return {
          success: false,
          error:
            "Wallet authentication requires World App. Please use email login or open in World App.",
        };
      }

      console.log("✅ Using MiniKit blockchain authentication");
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
      console.log("📧 Starting email authentication for:", authData.email);

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

      // Store JWT token for session management
      localStorage.setItem("auth_token", result.token);

      // Create authenticated user object
      this.user = {
        id: result.user.id,
        username: result.user.username,
        authMethod: "email",
        isAuthenticated: true,
        email: result.user.email,
      };

      console.log("✅ Email authentication successful");
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

      // Step 2: Perform wallet authentication using SIWE
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

      // Step 3: Verify the signature on backend (now also registers user in database)
      const verifyResponse = await fetch("/api/complete-siwe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      // 🆕 CRITICAL FIX: User is now automatically registered in database by complete-siwe endpoint
      // No need for separate wallet registration call
      console.log(
        "✅ SIWE verification successful, user should be in database:",
        verifyResult
      );

      // Get username from response or generate fallback
      const storedUsername =
        typeof window !== "undefined"
          ? localStorage.getItem("wallet_username")
          : null;
      const username =
        storedUsername ||
        MiniKit.user?.username ||
        verifyResult.user?.username ||
        `Player_${finalPayload.address.slice(0, 6)}`;

      // Create authenticated user object
      this.user = {
        id: verifyResult.user?.id || finalPayload.address, // Use database ID if available
        username: username,
        authMethod: "wallet",
        isAuthenticated: true,
        address: finalPayload.address,
      };

      console.log("👤 User object created:", this.user);

      // Clear stored username after successful authentication
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
      console.log("📝 Starting email registration for:", authData.email);

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

      // Store JWT token for session management
      localStorage.setItem("auth_token", result.token);

      // Create authenticated user object
      this.user = {
        id: result.user.id,
        username: result.user.username,
        authMethod: "email",
        isAuthenticated: true,
        email: result.user.email,
      };

      console.log("✅ Email registration successful");
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
    // In blockchain authentication, register and login are equivalent
    // The wallet address serves as both username and authentication
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
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Clear invalid token
        localStorage.removeItem("auth_token");
        return { success: false, error: "Invalid session" };
      }

      // Restore user state
      this.user = {
        id: result.user.id,
        username: result.user.username,
        authMethod: result.user.authMethod,
        isAuthenticated: true,
        email: result.user.email,
      };

      return {
        success: true,
        user: this.user,
      };
    } catch (error) {
      console.error("Session restoration error:", error);
      localStorage.removeItem("auth_token");
      return { success: false, error: "Session restoration failed" };
    }
  }

  /**
   * Logout current user and clear all session data
   */
  public logout(): void {
    this.user = null;
    // Clear email auth token if it exists
    localStorage.removeItem("auth_token");
    console.log("🚪 User logged out successfully");
  }
}

// Export singleton instance for easy access
export const auth = Auth.getInstance();
