import { MiniKit, type WalletAuthInput } from "@worldcoin/minikit-js";

/**
 * 🔐 MODULAR AUTHENTICATION SYSTEM
 * Copy-pastable authentication module supporting:
 * - MiniKit blockchain authentication (SIWE)
 * - Email/password authentication
 * - Session management
 *
 * Usage: Import and use in any project
 */

// Types for authentication
export interface User {
  id: string;
  username: string;
  authMethod: "wallet" | "email";
  isAuthenticated: boolean;
  address?: string;
  email?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface EmailAuthData {
  email: string;
  password: string;
  username?: string;
}

/**
 * 🚀 COPY-PASTABLE AUTH CLASS
 * Drop this into any project for instant authentication
 */
export class ModularAuth {
  private static instance: ModularAuth;
  private user: User | null = null;

  private constructor() {}

  public static getInstance(): ModularAuth {
    if (!ModularAuth.instance) {
      ModularAuth.instance = new ModularAuth();
    }
    return ModularAuth.instance;
  }

  // Current user state
  public isAuthenticated(): boolean {
    return this.user !== null && this.user.isAuthenticated;
  }

  public getCurrentUser(): User | null {
    return this.user;
  }

  /**
   * 🔐 MINIKIT WALLET AUTHENTICATION
   * Real blockchain authentication with SIWE
   */
  public async authenticateWithWallet(): Promise<AuthResult> {
    try {
       

      if (!MiniKit.isInstalled()) {
        return {
          success: false,
          error:
            "MiniKit not available. Please use World App or try email authentication.",
        };
      }

      // Step 1: Get secure nonce
      const nonceResponse = await fetch("/api/nonce");
      if (!nonceResponse.ok) throw new Error("Failed to get nonce");
      const { nonce } = await nonceResponse.json();

      // Step 2: MiniKit wallet authentication
      const walletAuthInput: WalletAuthInput = {
        nonce,
        requestId: crypto.randomUUID(),
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000),
        statement: "Sign in to Quiz Challenge with your wallet",
      };

      const { finalPayload } = await MiniKit.commandsAsync.walletAuth(
        walletAuthInput
      );

      if (finalPayload.status === "error") {
        return { success: false, error: "Wallet authentication cancelled" };
      }

      // Step 3: Verify signature on backend
      const verifyResponse = await fetch("/api/complete-siwe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: finalPayload, nonce }),
      });

      if (!verifyResponse.ok) throw new Error("Signature verification failed");

      const verifyResult = await verifyResponse.json();
      if (!verifyResult.isValid) {
        return { success: false, error: "Invalid signature" };
      }

      // Create authenticated user
      this.user = {
        id: finalPayload.address,
        username: MiniKit.user?.username || finalPayload.address.slice(0, 8),
        authMethod: "wallet",
        isAuthenticated: true,
        address: finalPayload.address,
      };

      return { success: true, user: this.user };
    } catch (error) {
      console.error("Wallet auth error:", error);
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
   * 📧 EMAIL AUTHENTICATION
   * Traditional email/password login
   */
  public async authenticateWithEmail(
    authData: EmailAuthData,
    isRegister = false
  ): Promise<AuthResult> {
    try {
       

      const response = await fetch(
        `/api/auth/${isRegister ? "register" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(authData),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          error: result.error || "Email authentication failed",
        };
      }

      // Store session token
      localStorage.setItem("auth_token", result.token);

      // Create authenticated user
      this.user = {
        id: result.user.id,
        username: result.user.username,
        authMethod: "email",
        isAuthenticated: true,
        email: result.user.email,
      };

      return { success: true, user: this.user };
    } catch (error) {
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
   * 🔄 SESSION RESTORATION
   * Restore user session from stored token
   */
  public async restoreSession(): Promise<AuthResult> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return { success: false, error: "No session found" };

      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        localStorage.removeItem("auth_token");
        return { success: false, error: "Invalid session" };
      }

      this.user = {
        id: result.user.id,
        username: result.user.username,
        authMethod: result.user.authMethod,
        isAuthenticated: true,
        email: result.user.email,
      };

      return { success: true, user: this.user };
    } catch (error) {
      localStorage.removeItem("auth_token");
      return { success: false, error: "Session restoration failed" };
    }
  }

  /**
   * 🚪 LOGOUT
   * Clear user session and data
   */
  public logout(): void {
    this.user = null;
    localStorage.removeItem("auth_token");
     
  }
}

// Export singleton instance
export const modularAuth = ModularAuth.getInstance();
