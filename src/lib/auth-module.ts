// TODO: Replace with Base MiniKit imports
// import { useMiniKit, useAuthenticate } from '@coinbase/onchainkit/minikit';

/**
 * 🔐 MODULAR AUTHENTICATION SYSTEM
 * Copy-pastable authentication module supporting:
 * - Base MiniKit blockchain authentication (Quick Auth / wallet auth)
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
   * 🔐 BASE MINIKIT WALLET AUTHENTICATION
   * Real blockchain authentication with Base MiniKit
   */
  public async authenticateWithWallet(): Promise<AuthResult> {
    try {
      // TODO: Implement Base MiniKit wallet authentication
      return {
        success: false,
        error: "Base MiniKit wallet authentication not yet implemented",
      };
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
